<div class="bb-example-song">
	<div class="song" @click="setPosition($event)">
		<div class="position-marker" v-show="playerRef && playerRef.customPosition"></div>

		<b-card v-for="(part, i) in normalizedSong" :key="i" :style="{ width: `${2.5 * part.length }em` }">
			<span class="tune-name">{{state.tunes[part.tuneName].displayName || part.tuneName}}</span>
			<br>
			<span class="pattern-name">{{state.tunes[part.tuneName].patterns[part.patternName].displayName || part.patternName}}</span>
		</b-card>
	</div>
	<ul class="actions icon-list">
		<li><a href="javascript:" title="Listen" v-b-tooltip.hover @click="playStop()"><fa :icon="playerRef && playerRef.playing ? 'stop' : 'play-circle'"/></a></li>
		<li><a href="javascript:" title="Download as MP3" v-b-tooltip.hover @click="downloadMP3()"><fa icon="download"/></a></li>
	</ul>
	<Progress :progress="loading" @cancel="cancelExport()"/>
</div>
