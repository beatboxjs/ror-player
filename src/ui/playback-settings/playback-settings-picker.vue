<script lang="ts" setup>
	import HybridPopoverButton from "../utils/hybrid-popover-button.vue";
	import { PlaybackSettings } from "../../state/playbackSettings";
	import config from "../../config";
	import { isEqual } from "lodash-es";
	import { clone, generateId } from "../../utils";
	import { computed } from "vue";
	import vTooltip from "../utils/tooltip";

	const props = withDefaults(defineProps<{
		modelValue: PlaybackSettings;
		defaultSpeed?: number;
		tooltipPlacement?: string;
	}>(), {
		tooltipPlacement: "top"
	});

	const emit = defineEmits<{
		"update:modelValue": [playbackSettings: PlaybackSettings];
	}>();

	const id = `bb-playback-settings-${generateId()}`;

	const playbackSettings = computed({
		get: () => props.modelValue,
		set: (playbackSettings) => {
			emit('update:modelValue', playbackSettings);
		}
	});

	const speed = computed({
		get: () => playbackSettings.value.speed,
		set: (speed) => {
			playbackSettings.value = { ...playbackSettings.value, speed };
		}
	});

	const defaultSpeed = props.defaultSpeed || config.defaultSpeed;

	const loop = computed({
		get: () => playbackSettings.value.loop,
		set: (loop) => {
			playbackSettings.value = { ...playbackSettings.value, loop };
		}
	});

	const whistle = computed({
		get: () => playbackSettings.value.whistle,
		set: (whistle) => {
			playbackSettings.value = { ...playbackSettings.value, whistle };
		}
	});

	const volume = computed({
		get: () => playbackSettings.value.volume,
		set: (volume) => {
			playbackSettings.value = { ...playbackSettings.value, volume };
		}
	});

	const volumes = Object.fromEntries(config.instrumentKeys.map((instrumentKey) => [instrumentKey, computed({
		get: () => playbackSettings.value.volumes[instrumentKey],
		set: (volume) => {
			playbackSettings.value = { ...playbackSettings.value, volumes: { ...playbackSettings.value.volumes, [instrumentKey]: volume }};
		}
	})]));

	const allMuted = computed({
		get: () => config.instrumentKeys.every((instr) => props.modelValue.mute[instr]),
		set: (mute) => {
			playbackSettings.value = { ...playbackSettings.value, mute: Object.fromEntries(config.instrumentKeys.map((instrumentKey) => [instrumentKey, mute])) };
		}
	});

	const muted = Object.fromEntries(config.instrumentKeys.map((instrumentKey) => [instrumentKey, computed({
		get: () => playbackSettings.value.mute[instrumentKey],
		set: (mute) => {
			playbackSettings.value = { ...playbackSettings.value, mute: { ...playbackSettings.value.mute, [instrumentKey]: mute } };
		}
	})]));

	const activePreset = computed({
		get: () => Object.keys(config.volumePresets).find((preset) => isEqual(config.volumePresets[preset], playbackSettings.value.volumes)),
		set: (preset) => {
			if (preset) {
				playbackSettings.value = { ...playbackSettings.value, volumes: clone(config.volumePresets[preset]) };
			}
		}
	});
</script>

<template>
	<HybridPopoverButton custom-class="bb-playback-settings" variant="light" title="Playback settings">
		<template #button>
			<fa icon="sliders-h"/> <fa icon="caret-down"/>
		</template>

		<div class="row">
			<label :for="`${id}-speed`" class="col-sm-3 col-form-label">Speed</label>
			<div class="col-sm-9 d-flex align-items-center">
				<input :id="`${id}-speed`" type="range" class="form-range" v-model.number="speed" min="30" max="180" v-tooltip="`${speed}`"/>
				<button type="button" class="btn btn-secondary btn-sm ms-2" @click="speed = defaultSpeed">Reset</button>
			</div>
		</div>

		<div class="row">
			<label :for="`${id}-loop`" class="col-sm-3 col-form-label">Loop</label>
			<div class="col-sm-9 d-flex align-items-center">
				<input :id="`${id}-loop`" type="checkbox" class="form-check-input mt-0" v-model="loop"/>
			</div>
		</div>

		<div class="row">
			<label :for="`${id}-whistle`" class="col-sm-3 col-form-label">Whistle</label>
			<div class="col-sm-9 d-flex align-items-center">
				<div class="btn-group">
					<button type="button" class="btn btn-secondary btn-sm" :class="{ active: whistle === false }" @click="whistle = false">No</button>
					<button type="button" class="btn btn-secondary btn-sm" :class="{ active: whistle === 1 }" @click="whistle = 1">On one</button>
					<button type="button" class="btn btn-secondary btn-sm" :class="{ active: whistle === 2 }" @click="whistle = 2">On all</button>
				</div>
			</div>
		</div>

		<hr />

		<table class="volumes">
			<tbody>
				<tr class="sliders">
					<td class="master">
						<input type="range" class="form-range" v-model.number="volume" min="0" max="2" step="0.05" v-tooltip="`${(volume * 100).toFixed()}%`" />
					</td>
					<td v-for="instrumentKey in config.instrumentKeys" :key="instrumentKey">
						<input type="range" class="form-range" v-model.number="volumes[instrumentKey].value" min="0" max="2" step="0.05" v-tooltip="`${(volumes[instrumentKey].value * 100).toFixed()}%`" />
					</td>
				</tr>
				<tr class="mute">
					<td class="master">
						<a href="javascript:" :class="allMuted ? 'active' : 'inactive'" @click="allMuted = !allMuted" draggable="false"><fa icon="volume-mute"/></a>
					</td>
					<td v-for="instrumentKey in config.instrumentKeys" :key="instrumentKey">
						<a href="javascript:" :class="muted[instrumentKey].value ? 'active' : 'inactive'" @click="muted[instrumentKey].value = !muted[instrumentKey].value" draggable="false"><fa icon="volume-mute"/></a>
					</td>
				</tr>
				<tr class="instrument-names">
					<td class="master">
						<strong>Master</strong>
					</td>
					<td v-for="instrumentKey in config.instrumentKeys" :key="instrumentKey">
						<span>{{config.instruments[instrumentKey].name}}</span>
					</td>
				</tr>
			</tbody>
		</table>

		<hr/>

		<div class="row">
			<div class="btn-group">
				<button v-for="preset in Object.keys(config.volumePresets)" :key="preset" type="button" class="btn btn-secondary" :class="{ active: preset === activePreset }" @click="activePreset = preset">{{preset}}</button>
			</div>
		</div>
	</HybridPopoverButton>
</template>

<style lang="scss">
	.bb-playback-settings {
		&.popover {
			max-width: none;
		}

		.instrument-names td {
			vertical-align: top;

			span,strong {
				display: inline-block;
				white-space: nowrap;
				writing-mode: vertical-rl;
				transform: rotate(180deg);
			}
		}

		.volumes {
			table-layout: fixed;
			width: 0;

			.sliders td {
				width: 28px;
				height: 132px;
			}

			input[type=range] {
				transform: rotate(-90deg);
				transform-origin: bottom left;
				margin: 105px 0 0 15px;
				width: 120px;
				height: 20px;
			}
		}

		td {
			padding: 1px 8px;
			text-align: center;
		}

		.mute td {
			padding-top: 10px;
			padding-bottom: 4px;
		}

		td.master {
			border-right: 1px solid #dee2e6;
			padding-left: 0;
			padding-right: 8px;

			input[type=range] {
				margin-left: 20px;
			}
		}

		.inactive {
			color: #bbb;
		}
	}
</style>