<div class="bb-overview">
	<span class="bb-overview-toggle-patternList navbar-light d-inline-block d-md-none" @click="togglePatternList()">
		<b-button class="navbar-toggler"><span class="navbar-toggler-icon" /></b-button>
	</span>

	<b-tabs v-model="activeTab">
		<b-tab title="Listen">
			<Listen />
		</b-tab>
		<b-tab title="Compose">
			<StateProvider>
				<Compose v-if="activeTab == 1" />
			</StateProvider>
		</b-tab>
	</b-tabs>

	<div class="bb-cover" @click="togglePatternList()"></div>
</div>