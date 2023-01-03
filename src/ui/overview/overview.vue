<div class="bb-overview">
	<Compatibility />
	<Update />

	<span class="bb-overview-help">
		<Help />
	</span>

	<div class="d-flex flex-column h-100">
		<div class="nav p-8 g-5">
			<span class="navbar-light d-inline-block d-md-none" @click="togglePatternList()">
				<b-button class="navbar-toggler"><span class="navbar-toggler-icon" /></b-button>
			</span>
			<button type="button" class="tab"
				:class="{active: activeTab==0}"
				@click="listen()"
			>Listen</button> 
			<button type="button" class="tab"
				:class="{active: activeTab==1}"
				@click="compose()">Compose</button>
			<button type="button" class="tab"
				v-if="editorTab"
				:class="{active: activeTab==2}"
				@click="edit()"
			>{{editorTab.title}}
			</button>
		</div>
		<div v-show="activeTab == 0" class="flex-grow-1">
			<Listen />
		</div>
		<div v-if="activeTab == 1" class="flex-grow-1">
			<StateProvider>
				<Compose />
			</StateProvider>
		</div>
		<div v-if="activeTab == 2 && editorTab" class="container-fluid flex-grow-1">
			<StateProvider>
				<h1>{{editorTab.title}} 		
				<a href="" @click.stop.prevent="closeTab()">×</a></h1>
				<PatternPlayer 
					:tuneName="editorTab.content.tuneName" 
					:pattern-name="editorTab.content.patternName" 
					:readonly="editorTab.content.readonly" />	
			</StateProvider>
		</div>
	</div>

	<div class="bb-cover" @click="togglePatternList()"></div>
</div>