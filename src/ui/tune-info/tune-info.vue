<div class="bb-tune-info" v-if="tune">
	<h2>{{tune.displayName || tuneName}}</h2>

	<div v-html="tuneDescription"></div>

	<div v-if="tune.sheet">
		<h3>Notation</h3>
		<p><em>Click on the <span class="glyphicon glyphicon-pencil"></span> on the breaks below to see the notes.</em></p>
		<p><a :href="tune.sheet" target="_blank">Tune sheet (PDF)</a></p>
	</div>

	<div class="text-right">
		<PlaybackSettings :playback-settings="playbackSettings" :default-speed="tune.speed" class="text-right" />
	</div>

	<h3 v-if="tune.description || tune.sheet">Sounds</h3>
	<PatternPlaceholder
		:tune-name="tuneName"
		:pattern-name="patternName"
		:readonly="true"
		v-for="(pattern, patternName) in tune.patterns"
		:key="patternName"
		:settings="playbackSettings"
	/>
</div>