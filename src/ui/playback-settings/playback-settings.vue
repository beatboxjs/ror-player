<div class="d-inline-block">
	<b-button :id="id" class="bb-playback-settings-button" variant="light"><i class="fas fa-sliders-h"></i> <i class="fas fa-caret-down"></i></b-button>

	<b-tooltip :target="id" :placement="tooltipPlacement">
		Playback settings
	</b-tooltip>

	<b-popover :target="id" custom-class="bb-playback-settings" placement="bottom" title="Playback settings">
		<b-form-group label="Speed" label-cols-sm="3">
			<b-button-group class="d-flex">
				<b-form-input type="range" @update="update({ speed: $event })" :value="playbackSettings.speed" min="30" max="180" :id="`${id}-speed`"  />
				<b-button size="sm" @click="resetSpeed()" variant="light">Reset</b-button>
				<b-tooltip :target="`${id}-speed`">{{playbackSettings.speed}}</b-tooltip>
			</b-button-group>
		</b-form-group>

		<b-form-group label="Loop" label-cols-sm="3">
			<b-form-checkbox @change="update({ loop: $event })" :checked="playbackSettings.loop" />
		</b-form-group>

		<b-form-group label="Whistle" label-cols-sm="3">
			<b-button-group>
				<b-button size="sm" @click="update({ whistle: false })" :pressed="playbackSettings.whistle == false" variant="light">No</b-button>
				<b-button size="sm" @click="update({ whistle: 1 })" :pressed="playbackSettings.whistle == 1" variant="light">On one</b-button>
				<b-button size="sm" @click="update({ whistle: 2 })" :pressed="playbackSettings.whistle == 2" variant="light">On all</b-button>
			</b-button-group>
		</b-form-group>

		<hr />

		<table class="volumes">
			<tbody>
				<tr>
					<td class="master">
						<b-form-input type="range" orient="vertical" @update="update({ volume: $event })" :value="playbackSettings.volume" min="0" max="2" step="0.05" />
					</td>
					<td v-for="instrumentKey in config.instrumentKeys">
						<b-form-input type="range" orient="vertical" @update="setVolumes({ [instrumentKey]: $event })" :value="playbackSettings.volumes[instrumentKey]" min="0" max="2" step="0.05" />
					</td>
				</tr>
				<tr class="mute">
					<td class="master">
						<a href="javascript:" @click="muteAll()" :class="allMuted ? 'active' : 'inactive'"><i class="fas fa-volume-mute"></i></a>
					</td>
					<td v-for="instrumentKey in config.instrumentKeys">
						<a href="javascript:" @click="mute(instrumentKey)" :class="playbackSettings.mute[instrumentKey] ? 'active' : 'inactive'"><i class="fas fa-volume-mute"></i></a>
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
				<b-button v-for="(settings, i) in config.volumePresets" :key="i" @click="setVolumes(settings)" :pressed="isPresetActive(settings)" variant="light">{{i}}</b-button>
			</b-button-group>
		</b-form-row>
	</b-popover>
</div>