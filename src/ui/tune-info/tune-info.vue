<div class="bb-tune-info" v-if="tune">
	<h1>{{tune.displayName || tuneName}}</h1>

	<div v-html="tuneDescription"></div>

	<h2>Notation</h2>
	<p><em>Click on the <span class="glyphicon glyphicon-pencil"></span> on the breaks below to see the notes.</em></p>
	<p v-if="tune.sheet"><a :href="tune.sheet" target="_blank">Tune sheet (PDF)</a></p>

	<div v-if="tune.video">
		<h2>Video</h2>
		<div class="bb-tune-info-video">
			<iframe sandbox="allow-same-origin allow-scripts" :src="tune.video" frameborder="0" allowfullscreen></iframe>
		</div>
	</div>

	<h2 v-if="tune.description || tune.sheet" class="d-flex align-items-center">
		<span class="flex-grow-1">Sounds</span>
		<PlaybackSettings :playback-settings="playbackSettings" :default-speed="tune.speed" />
	</h2>

	<ExampleSong
		v-if="tune.exampleSong"
		:tune-name="tuneName"
		:song="tune.exampleSong"
		:settings="playbackSettings"
	/>
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
</div>