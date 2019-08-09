<b-modal title="Import" :id="id">
	<b-form>
		<b-form-group :invalid-feedback="error">
			<b-form-textarea id="bb-import-dialog-paste" v-model="pasted" rows="5" placeholder="Paste link or raw data object…" />
		</b-form-group>
		<b-alert v-for="warning in warnings" :key="warning" variant="warning" show>{{warning}}</b-alert>
	</b-form>
	<div v-if="obj">
		<hr />
		<h3>Customise selection</h3>
		<table class="table table-sm">
			<thead>
				<tr>
					<th>Songs</th>
					<th>Tunes/Breaks</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>
						<b-list-group>
							<b-list-group-item v-for="(song, idx) in songs" :key="idx" :class="{active: song.shouldImport, disabled: song.exists}" :title="song.exists ? 'Song already exists.' : ''" v-b-tooltip.bottom>
								<a v-if="!song.exists" href="javascript:" @click="importSongs[idx] = !song.shouldImport">{{song.name}}</a>
								<span v-if="song.exists">{{song.name}} <span class="glyphicon glyphicon-ok"></span></span>
							</b-list-group-item>
						</b-list-group>
					</td>
					<td>
						<b-list-group>
							<b-list-group-item v-for="tune in tunes" :key="tune.tuneName" :class="tune.className">
								<a href="javascript:" @click="clickTune(tune.tuneName)">{{tune.displayName}}</a>
								<span v-for="pattern in tune.patterns" :key="pattern.patternName">
									<b-badge v-if="(!pattern.isUsed || pattern.exists) && pattern.exists != 2" href="javascript:" class="bb-inline-list-group-item" :active="pattern.shouldImport" @click="importPatterns[tune.tuneName][pattern.patternName] = !pattern.shouldImport" :title="pattern.exists ?  'Already exists. Local version will be overridden.' : ''" v-b-tooltip.hover.bottom>{{pattern.patternName}} <i v-if="pattern.exists" class="fas fa-exclamation-circle"></i></b-badge>
									<b-badge v-if="(pattern.isUsed && !pattern.exists) || pattern.exists == 2" class="bb-inline-list-group-item" disabled :active="pattern.shouldImport" :title="pattern.exists == 2 ? 'Pattern already exists.' : 'Pattern is used in song, cannot be disabled.'" v-b-tooltip.bottom>{{pattern.patternName}} <i v-if="pattern.exists == 2" class="fas fa-check"></i></b-badge>
								</span>
							</b-list-group-item>
						</b-list-group>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
	<div slot="modal-footer">
		<b-button @click="$bvModal.hide(id)">Cancel</b-button>
		<b-button variant="primary" @click="doImport()" :disabled="!obj">Import</b-button>
	</div>
</b-modal>