import "./pattern-player.scss";
import Vue from "vue";
import Component from "vue-class-component";
import template from "./pattern-player.vue";
import config, { Instrument } from "../../config";
import { InjectReactive, Prop, Watch } from "vue-property-decorator";
import { BeatboxReference, createBeatbox, getPlayerById, patternToBeatbox } from "../../services/player";
import { Pattern, patternEquals, PatternOptional, updateStroke, updatePattern } from "../../state/pattern";
import { normalizePlaybackSettings, PlaybackSettings, updatePlaybackSettings } from "../../state/playbackSettings";
import $ from "jquery";
import { scrollToElement } from "../../services/utils";
import { createPattern, getPatternFromState, State } from "../../state/state";
import { clone } from "../../utils";
import defaultTunes from "../../defaultTunes";
import isEqual from "lodash.isequal";
import PlaybackSettingsComponent from "../playback-settings/playback-settings";
import StrokeDropdown from "./stroke-dropdown";

type StrokeDropdownInfo = {
	instr: Instrument,
	i: number,
	sequence?: string
};

@Component({
	template,
	components: { PlaybackSettings: PlaybackSettingsComponent, StrokeDropdown }
})
export default class PatternPlayer extends Vue {

	@InjectReactive() readonly state!: State;

	@Prop(Object) readonly player?: BeatboxReference;
	@Prop({ type: String, required: true }) readonly tuneName!: string;
	@Prop({ type: String, required: true }) readonly patternName!: string;
	@Prop({ type: Boolean, default: false }) readonly readonly!: boolean;

	playerRef: BeatboxReference = null as any;
	playbackSettings: PlaybackSettings = null as any;
	currentStrokeDropdown: StrokeDropdownInfo | null = null;

	get playerInst() {
		return getPlayerById(this.playerRef.id);
	}

	get pattern() {
		return getPatternFromState(this.state, this.tuneName, this.patternName) as Pattern;
	}

	get originalPattern() {
		return defaultTunes.getPattern(this.tuneName, this.patternName);
	}

	get config() {
		return config;
	}

	get upbeatBeats() {
		return Math.ceil(this.pattern.upbeat / this.pattern.time);
	}

	created() {
		this.playerRef = this.player || createBeatbox(true);
		const player = this.playerInst;
		player.onbeat = this.strokeCallback;
		const onstop = player.onstop;
		player.onstop = () => {
			$(".beat.active", this.$el).removeClass("active");
			onstop && onstop.apply(player);
		};

		this.playbackSettings = Object.assign(normalizePlaybackSettings(this.state.playbackSettings), {
			speed: this.pattern.speed,
			loop: this.pattern.loop
		});

		this.updatePlayer();
	}

	@Watch("playbackSettings.volume")
	@Watch("playbackSettings.volumes", { deep: true })
	onThisVolumeChange() {
		events.$emit("update-state", updatePlaybackSettingsInState(this.state, {
			volume: this.playbackSettings.volume,
			volumes: this.playbackSettings.volumes
		}));
	}

	@Watch("state.playbackSettings.volume")
	@Watch("state.playbackSettings.volumes", { deep: true })
	onThatVolumeChange() {
		this.playbackSettings.volume = this.state.playbackSettings.volume;
		this.playbackSettings.volumes = clone(this.state.playbackSettings.volumes);
	}

	@Watch("pattern", { deep: true })
	@Watch("playbackSettings", { deep: true })
	updatePlayer() {
		let beatboxPattern = patternToBeatbox(this.pattern, this.playbackSettings);
		this.playerInst.setPattern(beatboxPattern);
		this.playerInst.setUpbeat(beatboxPattern.upbeat);
		this.playerInst.setBeatLength(60000/this.playbackSettings.speed/config.playTime);
		this.playerInst.setRepeat(this.playbackSettings.loop);
	}

	updateMarkerPosition(scrollFurther: boolean = false, force: boolean = false) {
		const i = (this.playerInst.getPosition() * this.pattern.time / config.playTime) - this.pattern.upbeat;

		const strokeIdx = Math.floor(i);

		const stroke = $(".stroke-i-"+strokeIdx, this.$el);
		const marker = $(".position-marker", this.$el);
		if(stroke.length > 0) {
			marker.offset({ left: (stroke.offset() as JQuery.Coordinates).left + (stroke.outerWidth() as number) * (i - strokeIdx) });
			scrollToElement(marker[0], scrollFurther, force);
		}
	}

	strokeCallback(beatIdx: number) {
		this.updateMarkerPosition(true);

		let i = Math.floor(beatIdx / config.playTime - this.pattern.upbeat / this.pattern.time);

		const beat = $(".beat-i-" + i, this.$el);
		$(".beat.active").not(beat).removeClass("active");
		beat.addClass("active");
	}

	playPause() {
		if(!this.playerInst.playing) {
			this.playerInst.play();
			this.updateMarkerPosition(true, true);
		}
		else
			this.playerInst.stop();
	}

	stop() {
		if(this.playerInst.playing)
			this.playerInst.stop();
		this.playerInst.setPosition(0);
	}

	getBeatClass(i: number) {
		let positiveI = i;
		while(positiveI < 0) // Support negative numbers properly
			positiveI += 4;

		const ret = [ "beat-"+(positiveI%4), "beat-i-"+i ];
		if(positiveI%4 == 3)
			ret.push("before-bar");
		if(positiveI%4 == 0)
			ret.push("after-bar");
		return ret;
	}

	getStrokeClass(realI: number, instrumentKey: Instrument) {
		let i = realI - this.pattern.upbeat;

		const ret = [
			"stroke-"+(i%this.pattern.time),
			"stroke-i-"+i
		];
		if((i+1)%this.pattern.time == 0)
			ret.push("before-beat");
		if(i%this.pattern.time == 0)
			ret.push("after-beat");
		if((i+1)%(this.pattern.time*4) == 0)
			ret.push("before-bar");
		if(i%(this.pattern.time*4) == 0)
			ret.push("after-bar");

		if(this.originalPattern && (this.originalPattern[instrumentKey][realI] || "").trim() != (this.pattern[instrumentKey][realI] || "").trim())
			ret.push("has-changes");

		return ret;
	}

	headphones(instrumentKeys: Array<Instrument>, extend: boolean) {
		if(!instrumentKeys.some((key) => !this.playbackSettings.headphones.includes(key))) {
			if (!extend && this.playbackSettings.headphones.some((key) => !instrumentKeys.includes(key)))
				this.playbackSettings.headphones = instrumentKeys;
			else
				this.playbackSettings.headphones = this.playbackSettings.headphones.filter((key) => !instrumentKeys.includes(key));
		} else if(extend)
			this.playbackSettings.headphones = [ ...new Set([ ...this.playbackSettings.headphones, ...instrumentKeys ]) ];
		else
			this.playbackSettings.headphones = instrumentKeys;
	}

	isHiddenSurdoHeadphone(instrumentKey: Instrument) {
		let surdos = ["ls", "ms", "hs"] as Array<Instrument>;
		return surdos.includes(instrumentKey) && !surdos.some((it) => (this.playbackSettings.headphones.includes(it)));
	}

	mute(instrumentKey: Instrument) {
		Vue.set(this.playbackSettings.mute, instrumentKey, !this.playbackSettings.mute[instrumentKey]);
	}

	get allMuted() {
		return config.instrumentKeys.every((instr) => this.playbackSettings.mute[instr]);
	}

	muteAll() {
		let mute = !this.allMuted;
		for(let instrumentKey of config.instrumentKeys) {
			Vue.set(this.playbackSettings.mute, instrumentKey, mute);
		}
	}

	setPosition($event: MouseEvent) {
		let tr = $($event.target as any).closest("tr");
		let firstBeat = tr.find("td.beat").first();

		let patternLength = this.pattern.length * config.playTime + this.pattern.upbeat * config.playTime / this.pattern.time;
		let pos = Math.floor(patternLength * ($event.pageX - (firstBeat.offset() as JQuery.Coordinates).left) / (tr.outerWidth() as number - (firstBeat.offset() as JQuery.Coordinates).left + (tr.offset() as JQuery.Coordinates).left));

		this.playerInst.setPosition(pos);
		this.updateMarkerPosition(false);
	}

	get hasLocalChanges() {
		const original = this.originalPattern;
		const current = this.pattern;

		return original && current && !patternEquals(original, current);
	}

	async reset() {
		if(await this.$bvModal.msgBoxConfirm("Are you sure that you want to revert your modifications and restore the original break?"))
			createPattern(this.state, this.tuneName, this.patternName, this.originalPattern || undefined);
	}

	clickStroke(instrumentKey: Instrument, i: number) {
		if(isEqual(this.currentStrokeDropdown, { instr: instrumentKey, i }))
			this.currentStrokeDropdown = null;
		else {
			this.openStrokeDropdown({ instr: instrumentKey, i });
		}
	}

	onStrokeChange(newStroke: string, prev: boolean) {
		if(this.currentStrokeDropdown && (!prev || this.currentStrokeDropdown.i > 0))
			updateStroke(this.pattern, this.currentStrokeDropdown.instr, this.currentStrokeDropdown.i - (prev ? 1 : 0), newStroke);
	}

	onStrokePrevNext(previous: boolean = false) {
		if(!this.currentStrokeDropdown || previous && this.currentStrokeDropdown.i == 0 || !previous && this.currentStrokeDropdown.i >= this.pattern.length*this.pattern.time)
			return this.currentStrokeDropdown = null;

		this.openStrokeDropdown({
			instr: this.currentStrokeDropdown.instr,
			i: this.currentStrokeDropdown.i + (previous ? -1 : 1)
		});
	}

	onStrokeClose() {
		this.currentStrokeDropdown = null;
	}

	updatePattern(update: PatternOptional) {
		updatePattern(this.pattern, update);
	}

	async openStrokeDropdown(strokeDropdown: StrokeDropdownInfo) {
		this.currentStrokeDropdown = strokeDropdown;
		await this.$nextTick();
		this.$root.$emit("bv::show::popover", `bb-pattern-editor-stroke-${strokeDropdown.instr}-${strokeDropdown.i}`);
	}

}