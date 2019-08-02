<b-modal id="bb-compatibility-error" title="Unsupported browser" ok-only :visible="!compatible || !mp3">
	<template v-if="!compatible">
		<p>Your browser does not support all the features needed to run {{appName}}. It will thus probably not work properly.</p>
		<p>{{appName}} works best in the current version of <strong>Chromium</strong> or <strong>Google Chrome</strong> and is also tested in <strong>Mozilla Firefox</strong>.</p>
		<p>It will most likely also work in the following browsers:</p>
		<ul>
			<li>Google Chrome 10 or newer</li>
			<li>Mozilla Firefox 25 or newer</li>
			<li>Opera 15 or newer</li>
			<li>Microsoft Edge</li>
			<li>Safari 6 or newer</li>
		</ul>
	</template>
	<template v-if="!mp3">
		<p>This player uses MP3 files. Your browser doesn't seem to support them.</p>
	</template>
</b-modal>