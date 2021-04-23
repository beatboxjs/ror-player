<div>
	<b-dropdown variant="link" right>
		<template slot="button-content">
			<fa icon="info-circle"/>
		</template>
		<b-dropdown-item href="?" :download="downloadFilename"><fa icon="download" fixed-width/> Download {{appName}}</b-dropdown-item>
		<b-dropdown-item v-b-modal.bb-app><fa icon="mobile-alt" fixed-width/> RoR Player app</b-dropdown-item>
		<b-dropdown-item href="https://github.com/beatboxjs/ror-player" target="_blank"><fa icon="code" fixed-width/> Source code on GitHub</b-dropdown-item>
	</b-dropdown>

	<b-modal id="bb-app" title="RoR Player app" ok-only>
		<div v-html="appDescription"></div>
	</b-modal>
</div>