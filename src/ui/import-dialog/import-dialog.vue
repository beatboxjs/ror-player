<b-modal title="Import" :id="id" size="lg" modal-class="bb-import-dialog">
	<b-form @submit.prevent>
		<b-form-group :invalid-feedback="error" :state="pasted.length == 0 ? null : !error">
			<b-form-textarea id="bb-import-dialog-paste" v-model="pasted" rows="5" placeholder="Paste link or raw data object…" :state="pasted.length == 0 ? null : !error" />
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
								<a v-if="!song.exists" href="javascript:" @click="clickSong(idx)" draggable="false">{{song.name}}</a>
								<span v-if="song.exists">{{song.name}} <fa icon="check"></fa></span>
							</b-list-group-item>
						</b-list-group>
					</td>
					<td>
						<b-list-group>
							<b-list-group-item v-for="tune in tunes" :key="tune.tuneName" :class="tune.className">
								<a href="javascript:" @click="clickTune(tune.tuneName)" draggable="false">{{tune.displayName}}</a>
								<div>
									<span
										v-for="pattern in tune.patterns"
										:key="pattern.patternName"
										:title="pattern.exists == 2 ? 'Pattern already exists.' : pattern.isUsed ? 'Pattern is used in song, cannot be disabled.' : pattern.exists ? 'Already exists. Local version will be overridden.' : ''"
										v-b-tooltip.hover.bottom
									>
										<b-badge
											:href="pattern.clickable ? 'javascript:' : undefined"
											class="bb-inline-list-group-item"
											:disabled="!pattern.clickable"
											:variant="pattern.shouldImport ? 'dark' : 'light'"
											@click="pattern.clickable && clickPattern(tune.tuneName, pattern.patternName)"
										>
											{{pattern.patternName}} <fa v-if="pattern.exists" :icon="pattern.exists == 2 ? 'check' : 'exclamation-circle'"></fa>
										</b-badge>
									</span>
								</div>
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