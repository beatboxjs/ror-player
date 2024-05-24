<script lang="ts" setup>
	const props = defineProps<{
		progress?: number;
	}>();

	const emit = defineEmits<{
		cancel: [];
	}>();
</script>

<template>
	<Teleport to="body">
		<div class="bb-progress" v-if="props.progress != null">
			<div class="progress">
				<div class="progress-bar progress-bar-striped progress-bar-animated bg-success" :style="{ width: `${props.progress}%` }">{{Math.round(props.progress)}}&#x202f;%</div>
			</div>
			<a href="javascript:" @click="emit('cancel')" draggable="false"><fa icon="window-close"/></a>
		</div>
	</Teleport>
</template>

<style lang="scss">
	.bb-progress {
		position: fixed;
		top: 0; left: 0;
		height: 100%;
		width: 100%;
		z-index: 999999;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.85);

		> .progress {
			width: 400px;
			height: 26px;
		}

		> a {
			flex-shrink: 0;
			margin-left: 5px;
			font-size: 28px;
			line-height: 28px;
		}
	}
</style>