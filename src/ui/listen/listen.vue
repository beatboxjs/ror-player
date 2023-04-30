<div class="bb-listen">
	<div class="bb-listen-tunes" v-touch:start="handleTouchStart" v-touch:moving="handleTouchMove" v-touch:end="handleTouchEnd" ref="tunes">
		<PatternListFilter v-model="filter" :show-custom="false" />

		<hr />

		<b-nav vertical pills class="flex-nowrap">
			<router-link custom v-slot="{ isActive,href }" 
				v-for="tuneName in tuneList"
				:to="{name: 'listen', params: { tuneName }}"
				:key="tuneName">
				<b-nav-item	:active="isActive" :href="href">
					{{state.tunes[tuneName].displayName || tuneName}}
				</b-nav-item>
			</router-link>
		</b-nav>
	</div>

	<div class="bb-listen-info">
		<router-view></router-view>
	</div>
</div>