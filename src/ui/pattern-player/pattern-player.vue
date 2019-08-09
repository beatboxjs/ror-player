<div>
	<div class="bb-pattern-editor-toolbar">
		<b-button :variant="playerRef && playerRef.playing ? 'info' : 'success'" @click="playPause()"><i :class="`fas fa-${playerRef && playerRef.playing ? 'pause' : 'play'}`"></i> {{playerRef && playerRef.playing ? 'Pause' : 'Play'}}</b-button>
		<b-button variant="danger" @click="stop()"><i class="fas fa-stop"></i> Stop</b-button>
		<PlaybackSettings :playback-settings="playbackSettings" :default-speed="pattern.speed" />

		<div class="divider"></div>

		<b-button-group v-if="!readonly">
			<b-dropdown :text="`Length: ${pattern.length}`" :class="{'has-changes': originalPattern && originalPattern.length != pattern.length}" variant="light">
				<b-dropdown-item v-for="le in [ 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64 ]" :key="le" :active="pattern.length == le" href="javascript:" @click="updatePattern({ length: le })">Length: {{le}}</b-dropdown-item>
			</b-dropdown>
		</b-button-group>

		<b-button-group v-if="!readonly">
			<b-dropdown :text="config.times[pattern.time] || `${pattern.time}⁄4`" :class="{'has-changes': originalPattern && originalPattern.time != pattern.time}" variant="light">
				<b-dropdown-item v-for="(desc, ti) in config.times" :key="ti" :active="pattern.time == ti" href="javascript:" @click="updatePattern({ time: ti })">Time signature: {{desc}}</b-dropdown-item>
			</b-dropdown>
		</b-button-group>

		<b-button-group v-if="!readonly">
			<b-dropdown :text="`Upbeat: ${pattern.upbeat}`" :class="{'has-changes': originalPattern && originalPattern.upbeat != pattern.upbeat}" variant="light">
				<b-dropdown-item v-for="i in pattern.time * 4 + 1" :key="i" :active="pattern.upbeat == i - 1" href="javascript:" @click="updatePattern({ upbeat: i - 1 })">Upbeat: {{i - 1}}</b-dropdown-item>
			</b-dropdown>
		</b-button-group>

		<slot/>

		<b-button variant="warning" v-if="hasLocalChanges" @click="reset()"><i class="fas fa-eraser"></i> Restore original</b-button>
	</div>
	<div class="bb-pattern-editor-container">
		<table class="pattern-editor" :class="'time-'+pattern.time">
			<thead>
				<tr>
					<td colspan="2" class="instrument-operations">
						<a href="javascript:" @click="muteAll()" :class="allMuted ? 'active' : 'inactive'" :title="`${allMuted ? 'Unmute' : 'Mute'} all instruments`" v-b-tooltip><i class="fas fa-volume-mute"></i></a>
					</td>
					<td v-for="i in upbeatBeats" :colspan="i == 1 ? (pattern.upbeat-1) % pattern.time + 1 : pattern.time" class="beat" :class="getBeatClass(i - upbeatBeats)" @click="setPosition($event)"><span>{{i - upbeatBeats}}</span></td>
					<td v-for="i in pattern.length" :colspan="pattern.time" class="beat" :class="getBeatClass(i-1)" @click="setPosition($event)"><span>{{i}}</span></td>
				</tr>
			</thead>
			<tbody>
				<tr v-for="instrumentKey in config.instrumentKeys">
					<th>{{config.instruments[instrumentKey].name}}</th>
					<td class="instrument-operations">
						<a v-if="!isHiddenSurdoHeadphone(instrumentKey)" href="javascript:" @click="headphones([ instrumentKey ], $event.ctrlKey || $event.shiftKey)" :class="playbackSettings.headphones.includes(instrumentKey) ? 'active' : 'inactive'"><i class="fas fa-headphones"></i></a>
						<a v-if="isHiddenSurdoHeadphone(instrumentKey) && instrumentKey == 'ms'" href="javascript:" @click="headphones([ 'ls', 'ms', 'hs' ], $event.ctrlKey || $event.shiftKey)" class="inactive"><i class="fas fa-headphones"></i></a>
						<a href="javascript:" @click="mute(instrumentKey)" :class="playbackSettings.mute[instrumentKey] ? 'active' : 'inactive'"><i class="fas fa-volume-mute"></i></a>
					</td>
					<td v-for="i in pattern.length*pattern.time + pattern.upbeat" class="stroke" :class="getStrokeClass(i-1, instrumentKey)" :title="config.strokesDescription[pattern[instrumentKey][i-1]]" v-b-tooltip.hover>
						<span v-if="readonly" class="stroke-inner" :title="config.strokesDescription[pattern[instrumentKey][i-1]]" v-b-tooltip>{{config.strokes[pattern[instrumentKey][i-1]] || ' '}}</span>
						<a v-if="!readonly"
							href="javascript:" class="stroke-inner"
							:id="`bb-pattern-editor-stroke-${instrumentKey}-${i-1}`"
							@click="clickStroke(instrumentKey, i-1)"
						>
							{{config.strokes[pattern[instrumentKey][i-1]] || ' '}}
						</a>
						<b-popover v-if="currentStrokeDropdown && currentStrokeDropdown.instr == instrumentKey && currentStrokeDropdown.i == i-1" :target="`bb-pattern-editor-stroke-${instrumentKey}-${i-1}`" placement="bottom">
							<StrokeDropdown :instrument="instrumentKey" :value="pattern[instrumentKey][i-1] || ' '" @change="onStrokeChange($event, false)" @change-prev="onStrokeChange($event, true)" @prev="onStrokePrevNext(true)" @next="onStrokePrevNext(false)" @close="onStrokeClose()" />
						</b-popover>
					</td>
				</tr>
			</tbody>
		</table>
		<div class="position-marker" :class="{'player-stopped': !playerRef || !playerRef.playing && playerInst.getPosition() == 0}"></div>
	</div>
</div>