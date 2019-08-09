<div class="bb-overview">
	<!--<button type="button" class="btn btn-default visible-xs-inline-block bb-overview-toggle-patternList" @click="togglePatternList()" uib-tooltip="Show tune list" tooltip-placement="bottom"><span class="glyphicon glyphicon-menu-hamburger"></span></button>-->

	<b-tabs v-model="activeTab">
		<b-tab title="Listen">
			<Listen/>
		</b-tab>
		<b-tab title="Compose">
			<StateProvider>
				<Compose/>
			</StateProvider>
		</b-tab>
	</b-tabs>

	<div class="bb-cover" @click="togglePatternList()"></div>
</div>