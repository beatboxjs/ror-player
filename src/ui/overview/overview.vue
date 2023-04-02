<div class="bb-overview">

	<Compatibility />
	<Update />

	<div class="d-flex flex-column h-100">
		<div class="header-nav">
			<span class="navbar-light d-inline-block d-md-none" @click="togglePatternList()">
				<b-button class="navbar-toggler"><span class="navbar-toggler-icon" /></b-button>
			</span>
			<a class="logo" href="https://xrrhythms.uk">
					<img src="../../../assets/img/XRR-logo.webp" alt="XR Rhythms UK">
			</a>
			<a class="heading" href="https://xrrhythms.uk">
					<img src="../../../assets/img/XRR-header.webp" class="d-none d-md-inline">
				</a>
			</span>
			<span class="tab" 
				:class="{active: activeTab==0}"
				><a type="button" @click="home">About</a>
			</span>
			<span class="tab" 
				:class="{active: activeTab==1}"
				><a type="button" 
				@click="listen()"
			>Listen</a></span>
			<span class="tab"
				:class="{active: activeTab==2}"
				><a type="button" 
				@click="compose()">Compose</a>
			</span>
			<span class="tab"
				:class="{active: activeTab==3}"
				><a type="button"
				v-if="editorTab"
				@click="edit()"
			>{{editorTab.title}}
			</a></span>
			<Help />
		</div>
		<div v-if="activeTab == 0" class="flex-grow-1">
			<About/>
		</div>
		<div v-show="activeTab == 1" class="flex-grow-1">
			<Listen />
		</div>
		<div v-if="activeTab == 2" class="flex-grow-1">
			<StateProvider>
				<Compose />
			</StateProvider>
		</div>
		<div v-if="activeTab == 3 && editorTab" class="container-fluid flex-grow-1">
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