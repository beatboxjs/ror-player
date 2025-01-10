<script setup lang="ts">
	import { copyPattern, getPatternFromState, getSortedTuneList, movePattern } from "../../state/state";
	import defaultTunes from "../../defaultTunes";
	import { injectStateRequired } from "../../services/state";
	import { computed, ref } from "vue";
	import { useModal } from "../utils/modal";
	import { generateId } from "../../utils";
	import vValidity from "../utils/validity";
	import { useI18n } from "../../services/i18n";

	const state = injectStateRequired();

	const props = defineProps<{
		tuneName: string;
		patternName: string;
	}>();

	const emit = defineEmits<{
		hidden: [];
	}>();

	const i18n = useI18n();

	const id = `bb-rename-pattern-dialog-${generateId()}`;

	const newTuneName = ref(props.tuneName);
	const newPatternName = ref(props.patternName);
	const copy = ref(true);

	const formRef = ref<HTMLFormElement>();
	const formTouched = ref(false);
	const formSubmitted = ref(false);
	const nameTouched = ref(false);
	const nameError = computed(() => {
		if (formSubmitted.value) {
			return undefined;
		} else if (!changed.value) {
			return i18n.t("rename-pattern-dialog.empty-name-error");
		} else if (exists.value) {
			return i18n.t("rename-pattern-dialog.duplicate-name-error");
		} else {
			return undefined;
		}
	});

	const modalRef = ref<HTMLElement>();
	const modal = useModal(modalRef, {
		onHidden: () => {
			emit("hidden");
		}
	});

	const exists = computed(() => !!getPatternFromState(state.value, newTuneName.value, newPatternName.value));

	const changed = computed(() => (props.tuneName !== newTuneName.value.trim() || props.patternName !== newPatternName.value.trim()) && newPatternName.value.trim() != "");

	const title = computed(() => copy.value ? i18n.t("rename-pattern-dialog.title-copy") : props.tuneName === newTuneName.value ? i18n.t("rename-pattern-dialog.title-rename") : i18n.t("rename-pattern-dialog.title-move"));

	const isCustom = computed(() => !defaultTunes.getPattern(props.tuneName, props.patternName));

	const targetTuneOptions = computed(() => getSortedTuneList(state.value));

	const submit = () => {
		if (formRef.value!.checkValidity()) {
			formSubmitted.value = true;

			if(copy.value)
				copyPattern(state.value, [ props.tuneName, props.patternName ], [ newTuneName.value.trim(), newPatternName.value.trim() ]);
			else
				movePattern(state.value, [ props.tuneName, props.patternName ], [ newTuneName.value.trim(), newPatternName.value.trim() ]);

			modal.hide();
		} else {
			formTouched.value = true;
		}
	};
</script>

<template>
	<Teleport to="body">
		<div class="modal fade bb-pattern-editor-dialog" tabindex="-1" aria-hidden="true" ref="modalRef">
			<div class="modal-dialog">
				<form class="modal-content" @submit.prevent="submit()" novalidate ref="formRef" :class="{ 'was-validated': formTouched }">
					<div class="modal-header">
						<h1 class="modal-title fs-5">{{title}}</h1>
						<button type="button" class="btn-close" data-bs-dismiss="modal" :aria-label="i18n.t('general.dialog-close')"></button>
					</div>
					<div class="modal-body">
						<div class="row mb-3" :class="{ 'was-validated': nameTouched }">
							<label :for="`${id}-name`" class="col-sm-4 col-form-label">{{i18n.t("rename-pattern-dialog.new-name")}}</label>
							<div class="col-sm-8 position-relative">
								<input :id="`${id}-name`" class="form-control" type="text" v-model="newPatternName" autofocus v-validity="nameError" @input="nameTouched = true" @blur="nameTouched = true">
								<div v-if="nameError" class="invalid-tooltip">
									{{nameError}}
								</div>
							</div>
						</div>

						<div class="row mb-3">
							<label :for="`${id}-tune`" class="col-sm-4 col-form-label">{{copy ? i18n.t("rename-pattern-dialog.different-tune-copy") : i18n.t("rename-pattern-dialog.different-tune-move")}}</label>
							<div class="col-sm-8">
								<select :id="`${id}-tune`" class="form-select" v-model="newTuneName">
									<option v-for="tuneName in targetTuneOptions" :key="tuneName">{{tuneName}}</option>
								</select>
							</div>
						</div>

						<div class="row mb-3">
							<label :for="`${id}-copy`" class="col-sm-4 col-form-label">{{i18n.t("rename-pattern-dialog.mode")}}</label>
							<div class="col-sm-8">
								<select :id="`${id}-copy`" class="form-select" v-model="copy" :disabled="!isCustom">
									<option :value="false">{{tuneName == newTuneName ? i18n.t("rename-pattern-dialog.mode-rename") : i18n.t("rename-pattern-dialog.mode-move")}}</option>
									<option :value="true">{{i18n.t("rename-pattern-dialog.mode-copy")}}</option>
								</select>
							</div>
						</div>
					</div>
					<div class="modal-footer">
						<button type="button" class="btn btn-secondary" @click="modal.hide()">{{i18n.t("general.dialog-cancel")}}</button>
						<button type="submit" class="btn btn-primary" @click="submit()">{{i18n.t("general.dialog-ok")}}</button>
					</div>
				</form>
			</div>
		</div>
	</Teleport>
</template>