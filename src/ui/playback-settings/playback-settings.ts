import "./playback-settings.scss";
import Vue from "vue";
import Component from "vue-class-component";
import WithRender from "./playback-settings.vue";
import { Model, Prop, Watch } from "vue-property-decorator";
import {
	Mute,
	PlaybackSettings, PlaybackSettingsOptional,
	updatePlaybackSettings, Volumes
} from "../../state/playbackSettings";
import config, { Instrument } from "../../config";
import isEqual from "lodash.isequal";
import $ from "jquery";
import { id } from "../../utils";

@WithRender
@Component({})
export default class PlaybackSettingsComponent extends Vue {

	@Prop({ type: Object, required: true }) playbackSettings!: PlaybackSettings;
	@Prop(Number) defaultSpeed?: number;
	@Prop({ type: String, default: "top" }) tooltipPlacement!: string;

	id = `bb-playback-settings-${id()}`;

	mounted() {
		$(document).on("click", this.handleDocumentClick);
	}

	beforeDestroy() {
		$(document).off("click", this.handleDocumentClick);
	}

	handleDocumentClick(event: JQuery.ClickEvent) {
		const $target = $(event.target);
		if($target.closest(this.$el).length == 0 && $target.closest(".bb-playback-settings").length == 0) {
			this.$root.$emit("bv::hide::popover", this.id);
		}
	}

	get config() {
		return config;
	}

	mute(instrumentKey: Instrument) {
		this.update({
			mute: {
				...this.playbackSettings.mute,
				[instrumentKey]: !this.playbackSettings.mute[instrumentKey]
			}
		});
	}

	get allMuted() {
		return config.instrumentKeys.every((instr) => this.playbackSettings.mute[instr]);
	}

	muteAll() {
		const mute: Mute = { };
		for(const instrumentKey of config.instrumentKeys) {
			Vue.set(mute, instrumentKey, !this.allMuted);
		}
		this.update({ mute });
	}

	resetSpeed() {
		this.update({
			speed: this.defaultSpeed || config.defaultSpeed
		});
	}

	setVolumes(volumes: Volumes) {
		this.update({
			volumes: {
				...this.playbackSettings.volumes,
				...volumes
			}
		});
	}

	isPresetActive(preset: Volumes) {
		return isEqual(preset, this.playbackSettings.volumes);
	}

	update(update: PlaybackSettingsOptional) {
		updatePlaybackSettings(this.playbackSettings, update);
	}

}