<b-form>
	<b-form-group :invalid-feedback="invalidFeedback" :state="invalidFeedback ? 'invalid' : 'valid'">
		<b-form-input v-model="value" :state="invalidFeedback ? 'invalid' : 'valid'" />
	</b-form-group>
</b-form>