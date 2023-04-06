<div class="bb-pattern-placeholder" :class="[{ dragging }, `drag-effect-${dragEffect}`]" :draggable="draggable ? 'true' : 'false'" @dragstart="handleDragStart($event)" @dragend="handleDragEnd($event)">
	<div class="pattern-button">
		<router-link class="pattern-name"
			:to="{ name: 'listen pattern', params: { tuneName, patternName } }">
			{{state.tunes[tuneName].patterns[patternName].displayName || patternName}}
			<fa v-if="isCustomPattern" icon="star" title="User-created break" v-b-tooltip/>
		</router-link>
	</div>
	<ul class="actions icon-list">
		<li><a href="javascript:" title="Listen" v-b-tooltip.hover @click="playPattern()"><fa :icon="playerRef && playerRef.playing ? 'stop' : 'play-circle'"></fa></a></li>
		<li v-if="!readonly"><router-link
			:to="{ name:  'edit pattern', params: { tuneName, patternName } }"
			:title="'Edit notes'" v-b-tooltip.hover><fa icon="pen"/></router-link>
		</li>
		<li v-if="hasLocalChanges"><a href="javascript:" title="Revert modifications" v-b-tooltip.hover @click="restore()"><fa icon="eraser"/></a></li>
		<slot :download-mp3="this.downloadMP3"/>
	</ul>
	<div class="position-marker" v-show="playerRef && playerRef.playing"></div>
	<PatternEditorDialog v-if="editorId" :id="editorId" :readonly="readonly" :tune-name="tuneName" :pattern-name="patternName" :player-ref="playerRef" @hidden="editorId = null"/>
	<Progress :progress="loading" @cancel="cancelExport()"/>
</div>