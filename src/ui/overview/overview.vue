<div class="bb-overview">
	<Compatibility />
	<Update />

	<span class="bb-overview-help">
		<Help />
	</span>

	<div class="container-fluid d-flex flex-column h-100">
		<div class="row m-2 g-5">
			<span class="navbar-light d-inline-block d-md-none" @click="togglePatternList()">
				<b-button class="navbar-toggler"><span class="navbar-toggler-icon" /></b-button>
			</span>
			<button type="button" class="btn btn-light"
				:class="{active: activeTab==0}"
				@click="activeTab=0"
			>Listen</button> 
			<button type="button" class="btn btn-light"
				:class="{active: activeTab==1}"
				@click="activeTab=1">Compose</button>
			<button type="button" class="btn btn-light"
				v-if="editorTab"
				:class="{active: activeTab==2}"
				@click="activeTab=2"
			>{{editorTab.title}}
			<a href="" @click="closeTab()">×</a>
			</button>
		</div>

		<div v-if="activeTab == 0" class="flex-grow-1">
			<Listen />
		</div>
		<div v-if="activeTab == 1" class="flex-grow-1">
			<StateProvider>
				<Compose />
			</StateProvider>
		</div>
		<div v-if="activeTab == 2" class="flex-grow-1">
			<StateProvider>
				<PatternPlayer class="m-4"
					:tuneName="editorTab.content.tuneName" 
					:pattern-name="editorTab.content.patternName" 
					:readonly="true" />	
			</StateProvider>
		</div>
	</div>

	<div class="bb-cover" @click="togglePatternList()"></div>
</div>