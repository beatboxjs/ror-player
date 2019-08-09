<b-modal title="Share" hide-footer :id="id">
	<b-tabs>
		<b-tab title="Link">
			<textarea readonly="readonly" class="form-control" rows="5" :value="url"></textarea>
			<p><em>Opening this URL will open the songs selected below and have the selected tunes/breaks available in the list.</em></p>
		</b-tab>
		<b-tab title="Raw (compressed)">
			<textarea readonly="readonly" class="form-control" rows="10" :value="rawStringCompressed"></textarea>
			<p><em>Copy this data into the “Import” menu to make the songs and tunes/breaks selected below available in the player.</em></p>
		</b-tab>
		<b-tab title="Raw (uncompressed)">
			<textarea readonly="readonly" class="form-control" rows="10" :value="rawStringUncompressed"></textarea>
			<p><em>Copy this data into the “Import” menu to make the songs and tunes/breaks selected below available in the player.</em></p>
		</b-tab>
	</b-tabs>
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
						<b-list-group-item v-for="(song, idx) in state.songs" :key="idx" :active="shareSongs[idx]">
							<a href="javascript:" @click="shareSongs[idx] = !shareSongs[idx]">{{getSongName(idx)}}</a>
						</b-list-group-item>
					</b-list-group>
				</td>
				<td>
					<b-list-group>
						<b-list-group-item v-for="tuneName in sortedTuneList" :key="tuneName" :class="getTuneClass(tuneName)" v-if="getModifiedPatternNames(tuneName).length > 0">
							<a href="javascript:" @click="clickTune(tuneName)">{{state.tunes[tuneName].displayName || tuneName}}</a>
							<b-badge
								v-for="patternName in getModifiedPatternNames(tuneName)"
								:key="patternName"
								class="bb-inline-list-group-item"
								:active="!!shouldExportPattern(tuneName, patternName)"
								:disabled="!!shouldExportPattern(tuneName, patternName) > 1"
								@click="sharePatterns[tuneName][patternName] = !sharePatterns[tuneName][patternName]"
								:title="isUsedInSong(tuneName, patternName) ? 'Used in song, cannot be disabled' : ''"
								v-b-tooltip.bottom

							>
								{{state.tunes[tuneName].patterns[patternName].displayName || patternName}} <i class="fas fa-star" v-if="linkPattern && linkPattern[0] == tuneName && linkPattern[1] == patternName" />
							</b-badge>
						</b-list-group-item>
					</b-list-group>
				</td>
			</tr>
		</tbody>
	</table>
</b-modal>