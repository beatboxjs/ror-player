<b-dropdown variant="link" right>
	<template slot="button-content">
		<i class="fas fa-info-circle"></i>
	</template>
	<b-dropdown-item href="?" :download="downloadFilename"><i class="fas fa-download"></i> Download {{appName}}</b-dropdown-item>
	<b-dropdown-item href="https://github.com/beatboxjs/angular-beatbox" target="_blank"><i class="fas fa-code"></i> Source code on GitHub</b-dropdown-item>
</b-dropdown>