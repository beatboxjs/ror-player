<b-modal :title="title" @ok="submit()" :ok-disabled="exists || !changed" :id="id" @show="initialize()" @hidden="$emit('hidden', $event)">
	<b-form class="form-horizontal" @submit.prevent="submit(); $bvModal.hide(id)">
		<b-form-group label-cols-sm="4" label="New name" :state="changed && !exists" :invalid-feedback="!changed ? 'Please enter a new name for the break.' : exists ? 'This name is already taken. Please type in a different name.' : ''">
			<b-form-input v-model="newPatternName" :state="changed && !exists" autofocus />
		</b-form-group>
		<b-form-group label-cols-sm="4" :label="`${copy ? 'Copy' : 'Move'} to different tune?`">
			<b-form-select v-model="newTuneName" :options="targetTuneOptions"/>
		</b-form-group>
		<b-form-group label-cols-sm="4" label="Mode">
			<b-form-select v-model="copy" :disabled="!isCustom">
				<option :value="false">{{tuneName == newTuneName ? 'Rename' : 'Move'}}</option>
				<option :value="true">Copy</option>
			</b-form-select>
		</b-form-group>
	</b-form>
</b-modal>