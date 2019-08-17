<b-collapse @show="shown = true" @hidden="shown = false" @input="$emit('input', $event)" ref="ref" :id="id" :visible="visible">
	<div v-if="!shown" :style="`height: ${height}px`" />
	<slot v-if="shown" />
</b-collapse>