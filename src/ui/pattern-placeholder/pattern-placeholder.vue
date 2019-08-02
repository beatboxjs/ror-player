<div class="bb-pattern-placeholder" :draggable="draggable ? 'true' : 'false'" @dragstart="handleDragStart($event)" @dragend="handleDragEnd($event)">
	<b-card class="pattern-button">
		<span class="tune-name">{{state.tunes[tuneName].displayName || tuneName}}</span>
		<br>
		<span class="pattern-name">{{state.tunes[tuneName].patterns[patternName].displayName || patternName}}</span>
	</b-card>
	<ul class="actions icon-list">
		<li><a href="javascript:" title="Listen" v-b-tooltip @click="playPattern()"><i :class="`fas fa-${playerRef && playerRef.playing ? 'stop' : 'play-circle'}`"></i></a></li>
		<li><a href="javascript:" :title="readonly ? 'Show notes' : 'Edit notes'" v-b-tooltip @click="editPattern()"><i class="fas fa-pen"></i></a></li>
		<li v-if="hasLocalChanges"><a href="javascript:" title="Revert modifications" v-b-tooltip @click="restore()"><i class="fas fa-eraser"></i></a></li>
		<slot />
	</ul>
	<div class="position-marker" v-show="playerRef && playerRef.playing"></div>
	<PatternEditorDialog v-if="editorId" :id="editorId" :readonly="readonly" :tune-name="tuneName" :pattern-name="patternName" :player-ref="playerRef"/>
</div>