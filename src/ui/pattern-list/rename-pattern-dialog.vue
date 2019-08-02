<v-modal :title="title" @ok="submit()" :ok-disabled="exists || !changed" :id="id">
	<v-form class="form-horizontal">
		<v-form-group label-cols-sm="4" label="New name" :state="!changed || exists ? 'invalid' : 'valid'" :invalid-feedback="!changed ? 'Please enter a new name for the break.' : exists ? 'This name is already taken. Please type in a different name.' : ''">
			<v-form-input v-model="newPatternName" />
		</v-form-group>
		<v-form-group label-cols-sm="4" :label="`${copy ? 'Copy' : 'Move'} to different tune?`">
			<v-form-select v-model="newTuneName" :options="targetTuneOptions"/>
		</v-form-group>
		<v-form-group label-cols-sm="4" label="Mode">
			<v-form-select v-model="copy">
				<option :value="true">Copy</option>
				<option :value="false">{{tuneName == newTuneName ? 'Rename' : 'Move'}}</option>
			</v-form-select>
		</v-form-group>
	</v-form>
</v-modal>