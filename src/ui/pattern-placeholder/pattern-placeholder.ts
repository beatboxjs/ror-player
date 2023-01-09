import "./pattern-placeholder.scss";
import Component from "vue-class-component";
import WithRender from "./pattern-placeholder.vue";
import Vue from "vue";
import Beatbox from "beatbox.js";
import { createPattern, getPatternFromState, State } from "../../state/state";
import { InjectReactive, Prop, Watch } from "vue-property-decorator";
import {
	BeatboxReference,
	createBeatbox,
	getPlayerById,
	patternToBeatbox,
	stopAllPlayers
} from "../../services/player";
import $ from "jquery";
import { normalizePlaybackSettings, PlaybackSettings } from "../../state/playbackSettings";
import config from "../../config";
import defaultTunes from "../../defaultTunes";
import { patternEquals } from "../../state/pattern";
import WithPatternPlaceholderItemRender from "./pattern-placeholder-item.vue";
import events, { registerMultipleHandlers } from "../../services/events";
import { DragType, PatternDragData, setDragData } from "../../services/draggable";
import PatternEditorDialog from "../pattern-editor-dialog/pattern-editor-dialog";
import { id } from "../../utils";
import FileSaver from "file-saver";
import Progress from "../utils/progress";
import { exportMP3 } from "beatbox.js-export";

@WithPatternPlaceholderItemRender
@Component({})
export class PatternPlaceholderItem extends Vue {
}


@WithRender
@Component({
	components: { PatternEditorDialog, Progress }
})
export default class PatternPlaceholder extends Vue {
	@InjectReactive() readonly state!: State;

	@Prop({ type: String, required: true }) readonly tuneName!: string;
	@Prop({ type: String, required: true }) readonly patternName!: string;
	@Prop({ type: Boolean, default: false }) readonly readonly!: boolean;
	@Prop(Object) readonly settings?: PlaybackSettings;
	@Prop({ default: null }) readonly draggable!: any;
	@Prop({ type: String, default: "copy" }) readonly dragEffect!: DataTransfer['dropEffect'];

	playerRef: BeatboxReference | null = null;
	editorId: string | null = null;
	fallbackPlaybackSettings: PlaybackSettings = null as any;
	_unregisterHandlers!: () => void;
	dragging: boolean = false;
	loading: number | null = null;
	exportCanceled: boolean = false;

	created() {
		this._unregisterHandlers = registerMultipleHandlers({
			"edit-pattern"(data) {
				if(!data.handled && data.pattern[0] == this.tuneName && data.pattern[1] == this.patternName && data.readonly == this.readonly) {
					//data.handled = true;

				}
			}
		}, this);
	}

	beforeDestroy() {
		this._unregisterHandlers();
	}

	get player() {
		return this.playerRef && getPlayerById(this.playerRef.id);
	}

	get pattern() {
		return getPatternFromState(this.state, this.tuneName, this.patternName);
	}

	@Watch("state.playbackSettings", { deep: true, immediate: true })
	handleFallbackPlaybackSettingsChange(newPlaybackSettings: PlaybackSettings) {
		const pattern = this.pattern;
		this.fallbackPlaybackSettings = normalizePlaybackSettings(Object.assign({}, this.state.playbackSettings, pattern && {
			speed: pattern.speed,
			loop: pattern.loop
		}));
	}

	get playbackSettings() {
		return this.settings || this.fallbackPlaybackSettings;
	}

	get hasLocalChanges() {
		const original = defaultTunes.getPattern(this.tuneName, this.patternName);
		const current = this.pattern;

		return original && current && !patternEquals(original, current);
	}

	get isCustomPattern() {
		return !defaultTunes.getPattern(this.tuneName, this.patternName);
	}

	@Watch("playbackSettings", { deep: true })
	@Watch("pattern", { deep: true })
	onUpdate() {
		this.updatePlayer();
	}

	async editPattern() {
		events.$emit("edit-pattern-command", { pattern:[this.tuneName,  this.patternName], readonly: this.readonly });
	}

	createPlayer() {
		this.playerRef = createBeatbox(false);
		(this.player as Beatbox).on("beat", (beat: number) => {
			const $el = $(this.$el);
			$el.find(".position-marker").css("left", (beat / (this.player as Beatbox)._pattern.length) * ($el.outerWidth() as number) + "px");
		});
		this.updatePlayer();
	};

	updatePlayer() {
		if(!this.player)
			return;

		const patternObj = this.pattern;

		if(!patternObj)
			return;

		let playbackSettings = this.playbackSettings;
		if(patternObj.loop && !playbackSettings.loop)
			playbackSettings = { ...playbackSettings, loop: true };

		const pattern = patternToBeatbox(patternObj, playbackSettings);

		this.player.setPattern(playbackSettings.length ? pattern.slice(0, playbackSettings.length*config.playTime + pattern.upbeat) : pattern);
		this.player.setUpbeat(pattern.upbeat);
		this.player.setBeatLength(60000/playbackSettings.speed/config.playTime);
		this.player.setRepeat(playbackSettings.loop);
	};

	playPattern() {
		if(this.player == null)
			this.createPlayer();

		const player = this.player as Beatbox;

		if(!player.playing) {
			stopAllPlayers();
			player.setPosition(0);
			player.play();
		} else {
			player.stop();
			player.setPosition(0);
		}
	};

	async restore() {
		if(await this.$bvModal.msgBoxConfirm(`Are you sure that you want to revert your modifications to ${this.patternName} (${this.tuneName})?`)) {
			createPattern(this.state, this.tuneName, this.patternName, defaultTunes.getPattern(this.tuneName, this.patternName) || undefined);
		}
	}

	handleDragStart(event: DragEvent) {
		const dragData: PatternDragData = {
			type: DragType.PLACEHOLDER,
			pattern: [ this.tuneName, this.patternName ],
			data: this.draggable
		};
		(event.dataTransfer as DataTransfer).effectAllowed = this.dragEffect;
		setDragData(event, dragData);
		setTimeout(() => {
			this.dragging = true;
		}, 0);
		events.$emit("pattern-placeholder-drag-start");
	}

	handleDragEnd(event: DragEvent) {
		events.$emit("pattern-placeholder-drag-end");
		setTimeout(() => {
			this.dragging = false;
		}, 0);
	}

	async downloadMP3() {
		if(this.player == null)
			this.createPlayer();

		const player = this.player!;

		try {
			this.loading = 0;
			this.exportCanceled = false;
			const blob = await exportMP3(player, (perc) => {
				if(this.exportCanceled)
					return false;
				else
					this.loading = Math.round(perc*100);
			});

			this.loading = null;

			if (blob)
				FileSaver.saveAs(blob, `${this.tuneName} - ${this.patternName}.mp3`);
		} catch(err:any) {
			this.loading = null;
			console.error("Error exporting MP3", err.stack || err);
			this.$bvModal.msgBoxOk("Error exporting MP3: " + err.message);
		}
	}

	cancelExport() {
		this.exportCanceled = true;
	}
}