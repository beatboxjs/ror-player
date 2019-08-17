<div class="bb-compose">
	<div class="bb-compose-tunes" v-touch:start="handleTouchStart" v-touch:moving="handleTouchMove" v-touch:end="handleTouchEnd" ref="tunes">
		<PatternList v-slot="slotProps">
			<PatternPlaceholderItem><a href="javascript:" v-b-tooltip.hover title="Add to song" @click="patternClick(slotProps.tuneName, slotProps.patternName)"><i class="fas fa-plus"></i></a></PatternPlaceholderItem>
		</PatternList>
	</div>
	<div class="bb-compose-song-player">
		<SongPlayer state="state">
			<History />
		</SongPlayer>
	</div>
</div>