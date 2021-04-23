<b-modal :title="title" hide-footer ref="modal" :id="id" modal-class="bb-pattern-editor-dialog" @hidden="$emit('hidden', $event)">
	<PatternPlayer :tuneName="tuneName" :patternName="patternName" :readonly="readonly" :player="playerRef">
		<b-button variant="info" v-if="hasChanged" @click="share()"><fa icon="share"/> Share</b-button>
	</PatternPlayer>
	<ShareDialog :id="shareDialogId" :link-pattern="[tuneName, patternName]" />
</b-modal>