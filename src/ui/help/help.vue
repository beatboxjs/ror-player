<b-dropdown variant="link" right>
	<template slot="button-content">
		<fa icon="info-circle"/>
	</template>
	<b-dropdown-item href="?" :download="downloadFilename"><fa icon="download"/> Download {{appName}}</b-dropdown-item>
	<b-dropdown-item href="https://github.com/beatboxjs/angular-beatbox" target="_blank"><fa icon="code"/> Source code on GitHub</b-dropdown-item>
</b-dropdown>