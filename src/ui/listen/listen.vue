<div class="bb-listen">
	<div class="bb-listen-tunes" v-touch:start="handleTouchStart" v-touch:moving="handleTouchMove" v-touch:end="handleTouchEnd" ref="tunes">
		<PatternListFilter v-model="filter" :show-custom="false" />

		<hr />

		<b-nav vertical pills class="flex-nowrap">
			<b-nav-item
				v-for="thisTuneName in tuneList"
				:key="thisTuneName"
				:active="thisTuneName == tuneName"
				href="javascript:"
				@click="selectTune(thisTuneName)"
				:link-attrs="{ draggable: 'false' }"
			>
				{{state.tunes[thisTuneName].displayName || thisTuneName}}
			</b-nav-item>
		</b-nav>
	</div>

	<div class="bb-listen-info">
		<TuneInfo v-if="tuneName" :tune-name="tuneName" />
	</div>
</div>