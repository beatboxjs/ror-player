import Component from "vue-class-component";
import WithRender from "./example-song-player.vue";
import Vue from "vue";
import { InjectReactive, Prop, Watch } from "vue-property-decorator";
import { getPatternFromState, State } from "../../state/state";
import { BeatboxReference, createBeatbox, getPlayerById, songToBeatbox, stopAllPlayers } from "../../services/player";
import { PlaybackSettings } from "../../state/playbackSettings";
import Beatbox from "beatbox.js";
import $ from "jquery";
import config from "../../config";
import { allInstruments, getEffectiveSongLength, SongParts } from "../../state/song";
import "./example-song-player.scss";
import { scrollToElement } from "../../services/utils";
import FileSaver from "file-saver";
import Progress from "../utils/progress";
import { exportMP3 } from "beatbox.js-export";
import { ExampleSong } from "../../state/tune";

@WithRender
@Component({
	components: { Progress }
})
export default class ExampleSongPlayer extends Vue {
	@InjectReactive() readonly state!: State;

	@Prop({ type: String, required: true }) readonly tuneName!: string;
	@Prop({ type: Array, required: true }) readonly song!: ExampleSong;
	@Prop(Object) readonly settings?: PlaybackSettings;

	playerRef: BeatboxReference | null = null;
	loading: number | null = null;
	exportCanceled: boolean = false;

	get playbackSettings() {
		return this.settings || this.state.playbackSettings;
	}

	get player() {
		return this.playerRef && getPlayerById(this.playerRef.id);
	}

	get normalizedSong(): Array<Required<Exclude<ExampleSong[0], string>>> {
		return this.song.flatMap((part) => {
			const result = {
				tuneName: this.tuneName,
				...(typeof part === "string" ? { patternName: part } : part)
			};
			const pattern = getPatternFromState(this.state, result.tuneName, result.patternName);
			if(!pattern)
				return [];
			else {
				return [{
					length: pattern.length,
					instruments: config.instrumentKeys,
					...result
				}];
			}
		});
	}

	get songParts(): SongParts {
		let i = 2;
		const result = {
			0: allInstruments(this.normalizedSong[0].tuneName != "Stolen" ? [ "General Breaks", "Whistle in" ] : [ "Stolen", "Whistle in (Stolen)"])
		} as SongParts;
		for(const part of this.normalizedSong) {
			result[i] = allInstruments([ part.tuneName, part.patternName ], part.instruments);
			i += part.length / 4;
		}
		return result;
	}

	createPlayer() {
		this.playerRef = createBeatbox(false);
		this.player!.on("beat", (beat: number) => {
			this.updateMarkerPos(true);
		});
		this.updatePlayer();
	};

	@Watch("song", { deep: true })
	@Watch("settings", { deep: true })
	@Watch("state.playbackSettings", { deep: true })
	@Watch("state.tunes", { deep: true })
	updatePlayer() {
		if(!this.player)
			return;

		let songBeatbox = songToBeatbox(this.songParts, this.state, this.playbackSettings);
		this.player.setPattern(songBeatbox);
		this.player.setUpbeat(songBeatbox.upbeat);
		this.player.setBeatLength(60000/this.playbackSettings.speed/config.playTime);
		this.player.setRepeat(this.playbackSettings.loop);
	}

	playStop() {
		if(this.player == null)
			this.createPlayer();

		const player = this.player as Beatbox;

		if(!player.playing) {
			stopAllPlayers();
			player.play();
		} else {
			player.stop();
			player.setPosition(0);
		}
	};

	setPosition($event: MouseEvent) {
		if(this.player == null)
			this.createPlayer();

		const player = this.player as Beatbox;

		const length = 4 * getEffectiveSongLength(this.songParts, this.state) * config.playTime + player._upbeat;
		const $el = $(this.$el).find('.song');
		const percent = ($event.pageX - ($el.offset() as JQuery.Coordinates).left + $el[0].scrollLeft) / $el[0].scrollWidth;
		player.setPosition(Math.floor(percent * length));
		this.updateMarkerPos(false);
	}

	updateMarkerPos(scrollFurther: boolean) {
		const player = this.player as Beatbox;
		const $el = $(this.$el).find(".song");
		const $marker = $el.find(".position-marker");
		$marker.css("left", (player.getPosition() / player._pattern.length) * $el[0].scrollWidth + "px");
		scrollToElement($marker[0] as HTMLElement, scrollFurther);
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
				FileSaver.saveAs(blob, this.tuneName + ".mp3");
		} catch(err) {
			this.loading = null;
			console.error("Error exporting MP3", err.stack || err);
			this.$bvModal.msgBoxOk("Error exporting MP3: " + err.message);
		}
	}

	cancelExport() {
		this.exportCanceled = true;
	}

}
