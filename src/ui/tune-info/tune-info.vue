<div class="bb-tune-info" v-if="tune">
	<h1 v-if="tune.description || tune.sheet" class="d-flex align-items-center">
		<span class="flex-grow-1">{{tune.displayName || tuneName}}</span>
		<PlaybackSettings :playback-settings="playbackSettings" :default-speed="tune.speed" v-if="tune.exampleSong" />
	</h1>

<ExampleSongPlayer
	v-if="tune.exampleSong"
	:tune-name="tuneName"
	:song="tune.exampleSong"
	:settings="playbackSettings"
/>

<p><em>Tap on the <fa icon="pen"></fa> below to see the notes.</em></p>
	
<PatternPlaceholder
	:tune-name="tuneName"
	:pattern-name="patternName"
	:readonly="true"
	v-for="(pattern, patternName) in tune.patterns"
	:key="patternName"
	:settings="playbackSettings"
	v-slot="slotProps"
>
	<PatternPlaceholderItem><a href="javascript:" title="Download as MP3" v-b-tooltip.hover @click="slotProps.downloadMp3()"><fa icon="download"/></a></PatternPlaceholderItem>
</PatternPlaceholder>

<p v-if="tune.sheet"><a :href="tune.sheet" target="_blank">Tune sheet with mnemonics (PDF)</a></p>

	<h2>About</h2>
	<div v-html="tuneDescription"></div>


	<div v-if="tune.video">
		<h2>Video</h2>
		<div class="bb-tune-info-video">
			<iframe sandbox="allow-same-origin allow-scripts" :src="tune.video" frameborder="0" allowfullscreen></iframe>
		</div>
	</div>
</div>
