<div class="bb-popover">
	<b-button :variant="variant" :id="`${id}-popover-button`" v-b-tooltip.bottom.hover="title" class="d-none d-sm-inline">
		<slot name="button"></slot>
	</b-button>

	<b-button :variant="variant" :id="`${id}-modal-button`" v-b-tooltip.bottom.hover="title" class="d-sm-none" v-b-modal="`${id}-modal`">
		<slot name="button"></slot>
	</b-button>

	<b-popover :custom-class="customClass" :target="`${id}-popover-button`" placement="bottom" title="Playback settings">
		<slot></slot>
	</b-popover>

	<b-modal :modal-class="customClass" scrollable :id="`${id}-modal`" title="Playback settings" ok-only>
		<slot></slot>
	</b-modal>
</div>