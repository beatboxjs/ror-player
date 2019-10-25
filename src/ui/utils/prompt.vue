<b-form @submit.prevent="submit()">
	<b-form-group :invalid-feedback="invalidFeedback" :state="invalidFeedback ? 'invalid' : 'valid'">
		<b-form-input v-model="value" :state="invalidFeedback ? 'invalid' : 'valid'" autofocus />
	</b-form-group>
</b-form>