<script lang="ts">
	/**
	 * Renders a button that opens a dropdown with links to the documentation and several other external help resources or modal dialogs.
	 */
	export default {};
</script>

<script lang="ts" setup>
	import { computed, ref } from "vue";
	import config from "../../config";
	import { useModal } from "../utils/modal";
	import { getAppInstructionsHtml, LANGUAGES, useI18n } from "../../services/i18n";
	import { reactiveLocalStorage } from "../../services/localStorage";

	const i18n = useI18n();

	const showAppModal = ref(false);
	const appModalRef = ref<HTMLElement>();
	useModal(appModalRef, {
		onHidden: () => {
			showAppModal.value = false;
		}
	});

	const downloadFilename = config.appName.toLowerCase().replace(/[-_ ]+/g, "-") + '.html';

	const selectLanguage = (lang: string) => {
		i18n.changeLanguage(lang);
		reactiveLocalStorage.lang = lang;
	};

	const appInstructionsHtml = computed(() => getAppInstructionsHtml());
</script>

<template>
	<div class="bb-help">
		<div class="dropdown">
			<button class="btn btn-link dropdown-toggle" type="button" data-bs-toggle="dropdown">
				<fa icon="info-circle"/>
			</button>
			<ul class="dropdown-menu dropdown-menu-end">
				<li><a class="dropdown-item" href="https://player-docs.rhythms-of-resistance.org/" target="_blank"><fa icon="question-circle" fixed-width/>{{" "}}{{i18n.t("help.user-manual")}}</a></li>
				<li><a class="dropdown-item" href="https://github.com/beatboxjs/ror-player/issues" target="_blank"><fa icon="exclamation-circle" fixed-width/>{{" "}}{{i18n.t("help.report-problem")}}</a></li>
				<li><a class="dropdown-item" href="?" :download="downloadFilename"><fa icon="download" fixed-width/>{{" "}}{{i18n.t("help.download", { appName: config.appName })}}</a></li>
				<li><a class="dropdown-item" href="javascript:" @click="showAppModal = true"><fa icon="mobile-alt" fixed-width/>{{" "}}{{i18n.t("help.app", { appName: config.appName })}}</a></li>
				<li><a class="dropdown-item" href="https://github.com/beatboxjs/ror-player" target="_blank"><fa icon="code" fixed-width/>{{" "}}{{i18n.t("help.source-code")}}</a></li>
				<li><hr class="dropdown-divider"></li>
				<li><h6 class="dropdown-header">{{i18n.t("help.language")}}</h6></li>
				<li class="bb-language-picker">
					<a
						v-for="lang in LANGUAGES"
						:key="lang"
						class="dropdown-item"
						:class="{ active: lang === i18n.currentLanguage }"
						href="javascript:"
						@click.stop="selectLanguage(lang)"
					>{{lang}}</a>
				</li>
			</ul>
		</div>

		<Teleport to="body">
			<div v-if="showAppModal" class="modal fade" tabindex="-1" aria-hidden="true" ref="appModalRef">
				<div class="modal-dialog modal-dialog-scrollable">
					<div class="modal-content">
						<div class="modal-header">
							<h1 class="modal-title fs-5">{{i18n.t("help.app", { appName: config.appName })}}</h1>
							<button type="button" class="btn-close" data-bs-dismiss="modal" :aria-label="i18n.t('general.dialog-close')"></button>
						</div>
						<div class="modal-body" v-html="appInstructionsHtml"></div>
						<div class="modal-footer">
							<button type="button" class="btn btn-primary" data-bs-dismiss="modal">{{i18n.t("general.dialog-ok")}}</button>
						</div>
					</div>
				</div>
			</div>
		</Teleport>
	</div>
</template>

<style lang="scss">
	.bb-help {
		.bb-language-picker {
			display: grid;
			grid-template-columns: repeat(auto-fill, 50px);

			> .dropdown-item {
				text-align: center;
			}
		}
	}
</style>