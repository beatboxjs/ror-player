<div class="bb-example-song">
	<div class="song" @click="setPosition($event)">
		<div class="position-marker" v-show="playerRef && playerRef.customPosition"></div>
		<b-card style="width: 10em;">
			<span class="tune-name">General Breaks</span>
			<br>
			<span class="pattern-name">Whistle in</span>
		</b-card>
		<b-card v-for="(patternName, i) in song" :key="i" :style="{ width: `${2.5 * state.tunes[tuneName].patterns[patternName].length }em` }">
			<span class="tune-name">{{state.tunes[tuneName].displayName || tuneName}}</span>
			<br>
			<span class="pattern-name">{{state.tunes[tuneName].patterns[patternName].displayName || patternName}}</span>
		</b-card>
	</div>
	<ul class="actions icon-list">
		<li><a href="javascript:" title="Listen" v-b-tooltip.hover @click="playStop()"><fa :icon="playerRef && playerRef.playing ? 'stop' : 'play-circle'"/></a></li>
		<li><a href="javascript:" title="Download as MP3" v-b-tooltip.hover @click="downloadMP3()"><fa icon="download"/></a></li>
	</ul>
	<Progress :progress="loading" @cancel="cancelExport()"/>
</div>