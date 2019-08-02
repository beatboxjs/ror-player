<div class="bb-listen">
	<div class="bb-listen-tunes">
		<PatternListFilter v-model="filter" />

		<hr />

		<b-nav vertical pills class="flex-nowrap">
			<b-nav-item
				v-for="thisTuneName in tuneList"
				:key="thisTuneName"
				:active="thisTuneName == tuneName"
				href="javascript:"
				@click="selectTune(thisTuneName)"
			>
				{{state.tunes[thisTuneName].displayName || thisTuneName}}
			</b-nav-item>
		</b-nav>
	</div>

	<div class="bb-listen-info">
		<TuneInfo v-if="tuneName" :tune-name="tuneName" />
	</div>
</div>