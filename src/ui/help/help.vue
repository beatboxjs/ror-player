<div>
	<b-dropdown variant="dark" right>
		<template slot="button-content">
			<fa icon="info-circle"/>
		</template>
		<b-dropdown-item href="https://player-docs.rhythms-of-resistance.org/" target="_blank"><fa icon="question-circle" fixed-width/> User manual</b-dropdown-item>
		<b-dropdown-item href="https://github.com/xrrhythmsuk/xruk-player" target="_blank"><fa icon="exclamation-circle" fixed-width/> Report a problem</b-dropdown-item>
		<b-dropdown-item href="?" :download="downloadFilename"><fa icon="download" fixed-width/> Download {{appName}}</b-dropdown-item>
		<b-dropdown-item v-b-modal.bb-app><fa icon="mobile-alt" fixed-width/> XR Rhythms Player app</b-dropdown-item>
		<b-dropdown-item href="https://github.com/xrrhythmsuk/xruk-player" target="_blank"><fa icon="code" fixed-width/> Source code on GitHub</b-dropdown-item>
	</b-dropdown>

	<b-modal id="bb-app" title="XR Rhythms Player app" ok-only>
		<div v-html="appDescription"></div>
	</b-modal>
</div>