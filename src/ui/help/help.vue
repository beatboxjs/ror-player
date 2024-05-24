<script lang="ts">
	/**
	 * Renders a button that opens a dropdown with links to the documentation and several other external help resources or modal dialogs.
	 */
	export default {};
</script>

<script lang="ts" setup>
	import { ref } from "vue";
	import config from "../../config";
	import { useModal } from "../utils/modal";
	import { html as appDescriptionHtml } from "./app.md";

	const showAppModal = ref(false);
	const appModalRef = ref<HTMLElement>();
	useModal(appModalRef, {
		onHidden: () => {
			showAppModal.value = false;
		}
	});

	const downloadFilename = config.appName.toLowerCase().replace(/[-_ ]+/g, "-") + '.html';
</script>

<template>
	<div>
		<div class="dropdown">
			<button class="btn btn-link dropdown-toggle" type="button" data-bs-toggle="dropdown">
				<fa icon="info-circle"/>
			</button>
			<ul class="dropdown-menu dropdown-menu-end">
				<li><a class="dropdown-item" href="https://player-docs.rhythms-of-resistance.org/" target="_blank"><fa icon="question-circle" fixed-width/> User manual</a></li>
				<li><a class="dropdown-item" href="https://github.com/beatboxjs/ror-player/issues" target="_blank"><fa icon="exclamation-circle" fixed-width/> Report a problem</a></li>
				<li><a class="dropdown-item" href="?" :download="downloadFilename"><fa icon="download" fixed-width/> Download {{config.appName}}</a></li>
				<li><a class="dropdown-item" href="javascript:" @click="showAppModal = true"><fa icon="mobile-alt" fixed-width/> {{config.appName}} app</a></li>
				<li><a class="dropdown-item" href="https://github.com/beatboxjs/ror-player" target="_blank"><fa icon="code" fixed-width/> Source code on GitHub</a></li>
			</ul>
		</div>

		<Teleport to="body">
			<div v-if="showAppModal" class="modal fade" tabindex="-1" aria-hidden="true" ref="appModalRef">
				<div class="modal-dialog modal-dialog-scrollable">
					<div class="modal-content">
						<div class="modal-header">
							<h1 class="modal-title fs-5">{{config.appName}} app</h1>
							<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
						</div>
						<div class="modal-body" v-html="appDescriptionHtml"></div>
						<div class="modal-footer">
							<button type="button" class="btn btn-primary" data-bs-dismiss="modal">OK</button>
						</div>
					</div>
				</div>
			</div>
		</Teleport>
	</div>
</template>