<div class="bb-overview">
	<Compatibility />
	<Update />

	<span class="bb-overview-toggle-patternList navbar-light d-inline-block d-md-none" @click="togglePatternList()">
		<b-button class="navbar-toggler"><span class="navbar-toggler-icon" /></b-button>
	</span>

	<span class="bb-overview-help">
		<Help />
	</span>

{{activeTab}}
	<b-tabs v-model="activeTab">
		<b-tab title="Listen" key="1">
			<Listen />
		</b-tab>
		<b-tab title="Compose" key="2">
			<StateProvider>
				<Compose v-if="activeTab == 1" />
			</StateProvider>
		</b-tab>
		<b-tab v-if="editorTab" key="3">
			<template #title>{{editorTab.title}} <a href="" @click="closeTab()">×</a></template>
			<StateProvider>
				<PatternPlayer class="m-4"
					:tuneName="editorTab.content.tuneName" 
					:pattern-name="editorTab.content.patternName" 
					:readonly="true" />	
			</StateProvider>
		</b-tab>
	</b-tabs>

	<div class="bb-cover" @click="togglePatternList()"></div>
</div>