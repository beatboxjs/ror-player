<Popover custom-class="bb-playback-settings" variant="secondary">
	<template #button>
		<nobr><fa icon="sliders-h"/> <fa icon="caret-down"/></nobr>
	</template>

	<b-form-group label="Speed" label-cols="3">
		<b-button-group class="d-flex my-auto flex-grow-1">
			<b-form-input type="range" class="my-auto" @update="update({ speed: $event })" :value="playbackSettings.speed" min="30" max="180" :id="`${id}-speed`"  />
			<b-button size="sm" @click="resetSpeed()" variant="secondary" class="ml-2">Reset</b-button>
			<b-tooltip :target="`${id}-speed`">{{playbackSettings.speed}}</b-tooltip>
		</b-button-group>
	</b-form-group>

	<b-form-group label="Loop" label-cols="3">
		<b-form-checkbox @change="update({ loop: $event })" :checked="playbackSettings.loop" class="my-auto" />
	</b-form-group>

	<b-form-group label="Click" label-cols="3">
		<b-button-group class="my-auto">
			<b-button size="sm" @click="update({ metronome: false })" :pressed="playbackSettings.metronome == false" variant="secondary">No</b-button>
			<b-button size="sm" @click="update({ metronome: 1 })" :pressed="playbackSettings.metronome == 1" variant="secondary">On one</b-button>
			<b-button size="sm" @click="update({ metronome: 2 })" :pressed="playbackSettings.metronome == 2" variant="secondary">On all</b-button>
		</b-button-group>
	</b-form-group>

	<hr />

	<table class="volumes">
		<tbody>
			<tr class="sliders">
				<td class="master">
					<b-form-input type="range" @update="update({ volume: $event })" :value="playbackSettings.volume" min="0" max="2" step="0.05" :id="`${id}-vol-master`" />
					<b-tooltip :target="`${id}-vol-master`">{{(playbackSettings.volume * 100).toFixed()}}%</b-tooltip>
				</td>
				<td v-for="instrumentKey in config.instrumentKeys">
					<b-form-input type="range" @update="setVolumes({ [instrumentKey]: $event })" :value="playbackSettings.volumes[instrumentKey]" min="0" max="2" step="0.05" :id="`${id}-vol-${instrumentKey}`" />
					<b-tooltip :target="`${id}-vol-${instrumentKey}`">{{(playbackSettings.volumes[instrumentKey] * 100).toFixed()}}%</b-tooltip>
				</td>
			</tr>
			<tr class="mute">
				<td class="master">
					<a href="javascript:" @click="muteAll()" :class="allMuted ? 'active' : 'inactive'"><fa icon="volume-mute"/></a>
				</td>
				<td v-for="instrumentKey in config.instrumentKeys">
					<a href="javascript:" @click="mute(instrumentKey)" :class="playbackSettings.mute[instrumentKey] ? 'active' : 'inactive'"><fa icon="volume-mute"/></a>
				</td>
			</tr>
			<tr class="instrument-names">
				<td class="master">
					<strong>Master</strong>
				</td>
				<td v-for="instrumentKey in config.instrumentKeys">
					<span>{{config.instruments[instrumentKey].name}}</span>
				</td>
			</tr>
		</tbody>
	</table>

	<hr/>

	<b-form-row class="justify-content-center">
		<b-button-group>
			<b-button v-for="(settings, i) in config.volumePresets" :key="i" @click="setVolumes(settings)" :pressed="isPresetActive(settings)" variant="secondary">{{i}}</b-button>
		</b-button-group>
	</b-form-row>
</Popover>