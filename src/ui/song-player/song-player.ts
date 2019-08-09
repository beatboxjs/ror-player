import FileSaver from "file-saver";
import "./song-player.scss";
import Vue from "vue";
import Component from "vue-class-component";
import template from "./song-player.vue";
import { InjectReactive, Watch } from "vue-property-decorator";
import { getPatternFromState, PatternReference, State, selectSong, createSong, getSongName, removeSong } from "../../state/state";
import { BeatboxReference, createBeatbox, getPlayerById, songToBeatbox, stopAllPlayers } from "../../services/player";
import { scrollToElement } from "../../services/utils";
import config, { Instrument } from "../../config";
import {
	Headphones,
	Mute,
	normalizePlaybackSettings,
	PlaybackSettingsOptional,
	updatePlaybackSettings
} from "../../state/playbackSettings";
import events, { MultipleHandlers, registerMultipleHandlers } from "../../services/events";
import {
	clearSong,
	deleteSongPart,
	getEffectiveSongLength,
	setSongPart,
	Song,
	SongParts,
	updateSong
} from "../../state/song";
import isEqual from "lodash.isequal";
import { clone, id } from "../../utils";
import { DragType, getDragData, PatternDragData, PatternResizeDragData, setDragData } from "../../services/draggable";
import { openPromptDialog } from "../utils/prompt";
import "beatbox.js-export";
import PlaybackSettingsComponent from "../playback-settings/playback-settings";
import PatternPlaceholder, { PatternPlaceholderItem } from "../pattern-placeholder/pattern-placeholder";
import { Pattern } from "../../state/pattern";
import ImportDialog from "../import-dialog/import-dialog";
import ShareDialog from "../share-dialog/share-dialog";

type DragOver = "trash" | { instr: Instrument | null, idx: number } | null;

@Component({
	template,
	components: {
		PlaybackSettings: PlaybackSettingsComponent,
		PatternPlaceholder,
		PatternPlaceholderItem,
		ShareDialog,
		ImportDialog
	}
})
export default class SongPlayer extends Vue {

	@InjectReactive() readonly state!: State;

	shareDialogId = `bb-share-dialog-${id()}`;
	importDialogId = `bb-import-dialog-${id()}`;
	playerRef: BeatboxReference = createBeatbox(false);
	dragging: boolean = false;
	dragOver: DragOver = null;
	dragOverCount: number = 0;
	loading: number | null = null;

	_unregisterHandlers!: () => void;

	get config() {
		return config;
	}

	get isEqual() {
		return isEqual;
	}

	created() {
		this._unregisterHandlers = registerMultipleHandlers({
			"pattern-placeholder-drag-start"() {
				this.dragging = true;
			},
			"pattern-placeholder-drag-end"() {
				this.dragging = false;
			}
		}, this);
	}

	mounted() {
		this.player.onbeat = (idx) => { this.updateMarkerPos(true); };
		this.updatePattern();
	}

	beforeDestroy() {
		this._unregisterHandlers();
	}

	get song() {
		return this.state.songs[this.state.songIdx];
	}

	get player() {
		return getPlayerById(this.playerRef.id);
	}

	updateMarkerPos(scrollFurther: boolean, force: boolean = false) {
		const i = Math.max(0, (this.player.getPosition() - this.player._upbeat)/config.playTime);
		const beatIdx = Math.floor(i);

		const beat = $(".beat-i-"+beatIdx, this.$el);
		$(".beat.active").not(beat).removeClass("active");
		beat.addClass("active");

		if(beat.length > 0)
			scrollToElement($(".song-position-marker", this.$el).offset({ left: (beat.offset() as JQuery.Coordinates).left + (i-beatIdx) * (beat.outerWidth() as number) })[0], scrollFurther, force);
	}

	@Watch("song", { deep: true })
	@Watch("state.playbackSettings", { deep: true })
	@Watch("state.tunes", { deep: true })
	updatePattern() {
		let songBeatbox = songToBeatbox(this.state);
		this.player.setPattern(songBeatbox);
		this.player.setUpbeat(songBeatbox.upbeat);
		this.player.setBeatLength(60000/this.state.playbackSettings.speed/config.playTime);
		this.player.setRepeat(this.state.playbackSettings.loop);
	}

	playPause() {
		if(!this.player.playing) {
			this.player.play();
			this.updateMarkerPos(true, true);
		}
		else
			this.player.stop();
	}

	stop() {
		stopAllPlayers();
		this.player.setPosition(0);
	}

	updatePlaybackSettings(update: PlaybackSettingsOptional) {
		updatePlaybackSettings(this.state.playbackSettings, update);
	}

	headphones(instrumentKeys: Array<Instrument>, extend: boolean) {
		let headphones: Headphones;

		if(!instrumentKeys.some((key) => !this.state.playbackSettings.headphones.includes(key))) {
			if (!extend && this.state.playbackSettings.headphones.some((key) => !instrumentKeys.includes(key)))
				headphones = instrumentKeys;
			else
				headphones = this.state.playbackSettings.headphones.filter((key) => !instrumentKeys.includes(key));
		} else if(extend)
			headphones = [ ...new Set([ ...this.state.playbackSettings.headphones, ...instrumentKeys ]) ];
		else
			headphones = instrumentKeys;

		this.updatePlaybackSettings({ headphones });
	}

	isHiddenSurdoHeadphone(instrumentKey: Instrument) {
		let surdos = ["ls", "ms", "hs"] as Array<Instrument>;
		return surdos.includes(instrumentKey) && !surdos.some((it) => (this.state.playbackSettings.headphones.includes(it)));
	}

	mute(instrumentKey: Instrument) {
		this.updatePlaybackSettings({
			mute: {
				...this.state.playbackSettings.mute,
				[instrumentKey]: !this.state.playbackSettings.mute[instrumentKey]
			}
		});
	}

	get allMuted() {
		return config.instrumentKeys.every((instr) => this.state.playbackSettings.mute[instr]);
	}

	muteAll() {
		const mute = {} as Mute;
		for(let instrumentKey of config.instrumentKeys)
			mute[instrumentKey] = !this.allMuted;
		this.updatePlaybackSettings({ mute });
	}

	get length() {
		let length = getEffectiveSongLength(this.song, this.state);
		if(this.dragging)
			length++;
		if(this.dragOver && typeof this.dragOver == "object")
			length = Math.max(length, this.dragOver.idx+2);
		length = Math.max(4, length);
		return length;
	}

	getColSpan(instrumentKey: Instrument, i: number) {
		const patternRef = (this.song[i] && this.song[i][instrumentKey]);
		if(!patternRef)
			return 1;

		const pattern = getPatternFromState(this.state, patternRef);
		if(!pattern)
			return 1;

		let ret = 1;
		while(ret<(pattern.length/4)) {
			if(this.song[i+ret] && this.song[i+ret][instrumentKey])
				break;

			ret++;
		}
		return ret;
	}

	getRowSpan(instrumentKey: Instrument, i: number) {
		if(!this.song[i] || !this.song[i][instrumentKey])
			return 1;

		const idx = config.instrumentKeys.indexOf(instrumentKey);
		const colspan = this.getColSpan(instrumentKey, i);
		let ret = 1;
		for(let j=idx+1; j<config.instrumentKeys.length; j++) {
			if(isEqual(this.song[i][instrumentKey], this.song[i][config.instrumentKeys[j]]) && colspan == this.getColSpan(config.instrumentKeys[j], i))
				ret++;
			else
				break;
		}
		return ret;
	}

	shouldDisplay(instrumentKey: Instrument, i: number) {
		const idx = config.instrumentKeys.indexOf(instrumentKey);
		if (idx > 0 && this.getRowSpan(config.instrumentKeys[idx-1], i) >= 2)
			return false;

		for(let j=i-1; j>=0; j--) {
			if(this.song[j] && this.song[j][instrumentKey])
				return (j + this.getColSpan(instrumentKey, j) - 1 < i);
		}

		return true;
	}

	removePatternFromSong(instrumentKey: Instrument, idx: number) {
		const span = this.getRowSpan(instrumentKey, idx);
		const instrIdx = config.instrumentKeys.indexOf(instrumentKey);
		for(let i=0; i<span; i++) {
			deleteSongPart(this.song, idx, config.instrumentKeys[instrIdx+i]);
		}
	}

	toggleInstrument(instrumentKey: Instrument, idx: number, tuneAndPattern: PatternReference) {
		if(isEqual(this.song[idx][instrumentKey], tuneAndPattern))
			deleteSongPart(this.song, idx, instrumentKey);
		else
			setSongPart(this.song, idx, instrumentKey, tuneAndPattern);
	}

	getPreviewPlaybackSettings(instrumentKey: Instrument, idx: number) {
		const ret = normalizePlaybackSettings(Object.assign({}, this.state.playbackSettings, {
			length: this.getColSpan(instrumentKey, idx)*4,
			loop: false
		}));

		const instrumentIdx = config.instrumentKeys.indexOf(instrumentKey);
		const rowSpan = this.getRowSpan(instrumentKey, idx);
		for(let i=0; i<config.instrumentKeys.length; i++) {
			ret.mute[config.instrumentKeys[i]] = (i < instrumentIdx || i >= instrumentIdx+rowSpan);
		}

		return ret;
	}

	setPosition(idx: number, $event: MouseEvent) {
		const beat = $($event.target as EventTarget).closest(".beat");
		const add = ($event.pageX - (beat.offset() as JQuery.Coordinates).left) / (beat.outerWidth() as number);
		this.player.setPosition(Math.floor((idx+add)*config.playTime+this.player._upbeat));
		this.updateMarkerPos(false);
	}

	handleResizeDragStart(event: DragEvent, instr: Instrument, idx: number) {
		const data: PatternResizeDragData = {
			type: DragType.PATTERN_RESIZE,
			instr,
			idx
		};

		setDragData(event, data);
	}

	handleDragEnter(event: DragEvent, dragOver: DragOver) {
		event.preventDefault();
		const dataTransfer = event.dataTransfer as DataTransfer;
		if(["move", "linkMove"].includes(dataTransfer.effectAllowed))
			dataTransfer.dropEffect = "move";
		else
			dataTransfer.dropEffect = "copy";

		if(isEqual(dragOver, this.dragOver))
			this.dragOverCount++;
		else
			this.dragOverCount = 1;
		this.dragOver = dragOver;
	}

	handleDragLeave(event: DragEvent, dragOver: DragOver) {
		if(isEqual(dragOver, this.dragOver) && --this.dragOverCount <= 0)
			this.dragOver = null;
	}

	handleDrop(event: DragEvent) {
		const data = getDragData(event);
		if(data && data.type == DragType.PLACEHOLDER && this.dragOver instanceof Object) {
			this.dropPattern(data.pattern, this.dragOver.instr, this.dragOver.idx);
			event.preventDefault();
		} else if(data && data.type == DragType.PATTERN_RESIZE) {
			this.resizePattern(data);
			event.preventDefault();
		}

		this.dragOver = null;
		this.dragOverCount = 0;
	}

	dropPattern(pattern: PatternReference, instr: Instrument | null, idx: number) {
		if(instr)
			setSongPart(this.song, idx, instr, pattern);
		else {
			for(const instr of config.instrumentKeys) {
				setSongPart(this.song, idx, instr, pattern);
			}
		}
	}

	isDragOver(dragOver: DragOver) {
		if(isEqual(dragOver, this.dragOver))
			return true;

		if(dragOver instanceof Object && this.dragOver instanceof Object && this.dragOver.instr == null && this.dragOver.idx == dragOver.idx)
			return true;

		return false;
	}

	getDragOverClass(dragOver: DragOver) {
		return this.isDragOver(dragOver) ? "drag-over" : "";
	}

	resizePattern({ idx, instr }: PatternResizeDragData) {
		const tuneAndPattern = this.song[idx][instr];

		if(!tuneAndPattern || !(this.dragOver instanceof Object) || !this.dragOver.instr)
			return;

		const dragOver = this.dragOver;

		const span = this.getRowSpan(instr, idx);
		const instrIdx = config.instrumentKeys.indexOf(instr);
		for(let i=0; i<span; i++) {
			deleteSongPart(this.song, idx, config.instrumentKeys[instrIdx+i]);
		}

		const patternLength = Math.ceil((getPatternFromState(this.state, tuneAndPattern) as Pattern).length / 4);
		for(const part of this.getAffectedResizePatternRange(instr, idx, dragOver.instr as Instrument, dragOver.idx, patternLength)) {
			this.dropPattern(tuneAndPattern, part[0], part[1]);
		}
	}

	getAffectedResizePatternRange(instrumentKey: Instrument, idx: number, toInstrumentKey: Instrument, toIdx: number, patternLength: number) {
		const instrumentIdx = config.instrumentKeys.indexOf(instrumentKey);
		const toInstrumentIdx = config.instrumentKeys.indexOf(toInstrumentKey);
		toIdx = Math.max(idx, toIdx);

		const ret: Array<[ Instrument, number ]> = [ ];

		for(let i=idx; i<=toIdx; i += (patternLength || 1)) {
			for(let j=Math.min(instrumentIdx, toInstrumentIdx); j<=Math.max(instrumentIdx, toInstrumentIdx); j++) {
				ret.push([ config.instrumentKeys[j], i ]);
			}
		}

		return ret;
	}

	/*function updateResizeRange() {
		$(".pattern-resize-range", this.$el).removeClass("pattern-resize-range");

		const c = this.currentPatternDrag;
		if(c) {
			getAffectedResizePatternRange(c.instrumentKey, c.idx, c.toInstrumentKey, c.toIdx).forEach(function(it) {
				$(".song-field-"+it[0]+"-"+it[1], this.$el).addClass("pattern-resize-range");
			});
		}
	}*/

	async downloadMP3() {
		try {
			this.loading = 0;
			const blob = await this.player.exportMP3((perc) => {
				if(Math.floor(perc*20) != Math.floor((this.loading as number)/5)) {
					this.loading = perc*100;
				}
			});

			this.loading = null;
			FileSaver.saveAs(blob, this.getSongName() + ".mp3");
		} catch(err) {
			this.loading = null;
			console.error("Error exporting MP3", err.stack || err);
			this.$bvModal.msgBoxOk("Error exporting MP3: " + err.message);
		}
	}

	async downloadWAV() {
		try {
			this.loading = 0;
			const blob = await this.player.exportWAV((perc) => {
				if(Math.floor(perc*20) != Math.floor((this.loading as number)/5)) {
					this.loading = perc*100;
				}
			});

			this.loading = null;
			FileSaver.saveAs(blob, this.getSongName() + ".wav");
		} catch(err) {
			this.loading = null;
			console.error("Error exporting WAV", err.stack || err);
			this.$bvModal.msgBoxOk("Error exporting WAV: " + err.message);
		}
	}

	getSongName(songIdx: number = this.state.songIdx) {
		return getSongName(this.state, songIdx);
	}

	selectSong(songIdx: number) {
		if(this.state.songIdx == songIdx)
			return;

		this.stop();

		selectSong(this.state, songIdx);
	}

	createSong() {
		this.stop();

		createSong(this.state, undefined, undefined, true);
	}

	async renameSong(songIdx: number) {
		const newName = await openPromptDialog(this, "Enter song name", this.song.name);
		if(newName) {
			updateSong(this.state.songs[songIdx], { name: newName });
		}
	}

	copySong(songIdx: number) {
		const copy = clone(this.state.songs[songIdx]);
		copy.name = copy.name ? "Copy of " + copy.name : "Copy";

		createSong(this.state, copy, songIdx + 1, this.state.songIdx == songIdx);
	}

	async removeSong(songIdx: number) {
		if(await this.$bvModal.msgBoxConfirm(`Do you really want to remove the song ${this.getSongName(songIdx)}?`))
			removeSong(this.state, songIdx);
	}

	async clearSong() {
		if(await this.$bvModal.msgBoxConfirm("Do you really want to clear the current song?")) {
			clearSong(this.song);
		}
	}

	openShareDialog() {
		this.$bvModal.show(this.shareDialogId);
	}

	openImportDialog() {
		this.$bvModal.show(this.importDialogId);
	}

}