<b-list-group class="bb-pattern-player-stokes-dropdown-menu">
	<b-list-group-item :active="!sequence && (!value || value == ' ')" href="javascript:" @click="handleSelect(' ')" draggable="false"> </b-list-group-item>
	<b-list-group-item
		v-for="stroke in config.instruments[instrument].strokes"
		:key="stroke"
		:active="sequence ? getCurrentStrokeSequenceOptions().includes(stroke) : value == stroke"
		href="javascript:"
		@click="handleSelect(stroke)"
		:title="config.strokesDescription[stroke]"
		v-b-tooltip
		draggable="false"
	>
		{{config.strokes[stroke]}}
	</b-list-group-item>
</b-list-group>