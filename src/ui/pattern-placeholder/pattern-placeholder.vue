<div class="bb-pattern-placeholder" :class="[{ dragging }, `drag-effect-${dragEffect}`]" :draggable="draggable ? 'true' : 'false'" @dragstart="handleDragStart($event)" @dragend="handleDragEnd($event)">
	<b-card class="pattern-button">
		<span class="tune-name">{{state.tunes[tuneName].displayName || tuneName}}</span>
		<br>
		<span class="pattern-name">
			{{state.tunes[tuneName].patterns[patternName].displayName || patternName}}
			<fa v-if="isCustomPattern" icon="star" title="User-created break" v-b-tooltip/>
		</span>
	</b-card>
	<ul class="actions icon-list">
		<li><a href="javascript:" title="Listen" v-b-tooltip.hover @click="playPattern()" draggable="false"><fa :icon="playerRef && playerRef.playing ? 'stop' : 'play-circle'"></fa></a></li>
		<li><a href="javascript:" :title="readonly ? 'Show notes' : 'Edit notes'" v-b-tooltip.hover @click="editPattern()" draggable="false"><fa icon="pen"/></a></li>
		<li v-if="hasLocalChanges"><a href="javascript:" title="Revert modifications" v-b-tooltip.hover @click="restore()" draggable="false"><fa icon="eraser"/></a></li>
		<slot :download-mp3="this.downloadMP3"/>
	</ul>
	<div class="position-marker" v-show="playerRef && playerRef.playing"></div>
	<PatternEditorDialog v-if="editorId" :id="editorId" :readonly="readonly" :tune-name="tuneName" :pattern-name="patternName" :player-ref="playerRef" @hidden="editorId = null"/>
	<Progress :progress="loading" @cancel="cancelExport()"/>
</div>