<div :class="`bb-song-player ${dragging ? 'dragging' : ''} ${resizing ? 'resizing' : ''}`">
	<div class="control-panel">
		<b-button :variant="playerRef.playing ? 'info' : 'success'" @click="playPause()"><fa :icon="playerRef.playing ? 'pause' : 'play'" /><span class="d-none d-sm-inline"> {{playerRef.playing ? 'Pause' : 'Play'}}</span></b-button>
		<b-button variant="danger" @click="stop()"><fa icon="stop"/><span class="d-none d-sm-inline"> Stop</span></b-button>
		<PlaybackSettings :playback-settings="state.playbackSettings" tooltip-placement="bottom" />

		<div class="divider"></div>

		<b-dropdown class="song-dropdown" variant="secondary">
			<template slot="button-content">
				<fa icon="music"/><span class="d-none d-sm-inline"> {{getSongName()}}</span>
			</template>
			<b-dropdown-group v-for="(thisSong, idx) in state.songs" :key="idx" :active="idx == state.songIdx">
				<b-dropdown-item href="javascript:" class="song-name flex-grow-1" @click="selectSong(idx)">{{getSongName(idx)}}</b-dropdown-item>
				<b-dropdown-item href="javascript:" @click="renameSong(idx)" title="Rename" v-b-tooltip.hover class="rename"><fa icon="pencil-alt"/></b-dropdown-item>
				<b-dropdown-item href="javascript:" @click="copySong(idx)" title="Copy" v-b-tooltip.hover class="copy"><fa icon="copy"/></b-dropdown-item>
				<b-dropdown-item href="javascript:" @click="removeSong(idx)" title="Remove" v-b-tooltip.hover class="remove"><fa icon="trash"/></b-dropdown-item>
			</b-dropdown-group>
			<b-dropdown-divider/>
			<b-dropdown-item href="javascript:" @click="createSong()">New song</b-dropdown-item>
		</b-dropdown>

		<b-dropdown variant="secondary">
			<template slot="button-content">
				<fa icon="cog"/><span class="d-none d-sm-inline"> Tools</span>
			</template>
			<b-dropdown-item href="javascript:" @click="clearSong()"><fa icon="trash" fixed-width/> Clear song</b-dropdown-item>
			<b-dropdown-item href="javascript:" @click="downloadMP3()"><fa icon="file-export" fixed-width/> Export MP3</b-dropdown-item>
			<b-dropdown-item href="javascript:" @click="downloadWAV()"><fa icon="file-export" fixed-width/> Export WAV</b-dropdown-item>
			<b-dropdown-item href="javascript:" @click="openShareDialog()"><fa icon="share" fixed-width/> Share</b-dropdown-item>
			<b-dropdown-item href="javascript:" @click="openImportDialog()"><fa icon="file-import" fixed-width/> Import</b-dropdown-item>
		</b-dropdown>
		<div
			class="btn-group trash-drop"
			:class="getDragOverClass('trash')"
			@dragenter="handleDragEnter($event, 'trash')"
			@dragover="$event.preventDefault()"
			@dragleave="handleDragLeave($event, 'trash')"
			@drop="handleDrop($event)"
		>
			<fa icon="trash"/>
		</div>

		<div class="flex-grow-1"></div>

		<slot>
			<History/>
		</slot>
	</div>

	<div class="song-player-container">
		<div class="bb-col instruments">
			<div class="timeline"></div>
			<div class="field heading-type" v-for="instrumentKey in config.instrumentKeys" :key="instrumentKey">
				{{config.instruments[instrumentKey].name}}
			</div>
			<div class="field heading-type all-drop">All</div>
		</div><div class="bb-col instrument-actions">
			<div class="timeline">
				<a href="javascript:" @click="muteAll()" :class="allMuted ? 'active' : 'inactive'" :title="`${allMuted ? 'Unmute' : 'Mute'} all instruments`" v-b-tooltip.hover><fa icon="volume-mute"/></a>
			</div>
			<div class="field heading-type" v-for="instrumentKey of config.instrumentKeys" :key="instrumentKey">
				<ul class="icon-list">
					<li v-if="!isHiddenSurdoHeadphone(instrumentKey)"><a href="javascript:" @click="headphones([ instrumentKey ], $event.ctrlKey || $event.shiftKey)" :class="state.playbackSettings.headphones.includes(instrumentKey) ? 'active' : 'inactive'"><fa icon="headphones"/></a></li>
					<li v-if="isHiddenSurdoHeadphone(instrumentKey) && instrumentKey == 'ms'"><a href="javascript:" @click="headphones([ 'ls', 'ms', 'hs' ], $event.ctrlKey || $event.shiftKey)" class="inactive"><fa icon="headphones"/></a></li>
					<li><a href="javascript:" @click="mute(instrumentKey)" :class="state.playbackSettings.mute[instrumentKey] ? 'active' : 'inactive'"><fa icon="volume-mute"/></a></li>
				</ul>
			</div>
			<div class="field heading-type all-drop"></div>
		</div><div class="song-container"><div class="bb-col song" v-for="i in length">
			<div class="timeline">
				<span v-for="i2 in 4" class="beat" :class="'beat-i-'+((i-1)*4+i2-1)" @click="setPosition((i-1)*4+i2-1, $event)">{{(i-1)*4+i2}}</span>
			</div>
			<div
				:class="`field song-field-${instrumentKey}-${i-1} ${getDragOverClass({ instr: instrumentKey, idx: i-1 })}`"
				v-for="instrumentKey of config.instrumentKeys"
				:key="instrumentKey"
				@dragenter="handleDragEnter($event, { instr: instrumentKey, idx: i-1 })"
				@dragover="$event.preventDefault()"
				@dragleave="handleDragLeave($event, { instr: instrumentKey, idx: i-1 })"
				@drop="handleDrop($event)"
			>
				<div :class="`pattern-container colspan-${getColSpan(instrumentKey, i-1)} rowspan-${getRowSpan(instrumentKey, i-1)}`" v-if="song[i-1] && song[i-1][instrumentKey] && shouldDisplay(instrumentKey, i-1)">
					<PatternPlaceholder :tune-name="song[i-1][instrumentKey][0]" :pattern-name="song[i-1][instrumentKey][1]" :draggable="{ instr: instrumentKey, idx: i-1 }" dragEffect="move" :settings="getPreviewPlaybackSettings(instrumentKey, i-1)">
						<PatternPlaceholderItem>
							<b-dropdown variant="link" toggle-class="text-decoration-none" no-caret>
								<template slot="button-content">
									<fa icon="hand-point-right" title="Pick instruments" v-b-tooltip.hover/>
								</template>
								<b-dropdown-item v-for="instrumentKey2 in config.instrumentKeys" :key="instrumentKey2" href="javascript:" @click="toggleInstrument(instrumentKey2, i-1, song[i-1][instrumentKey])"><fa icon="check" :style="{visibility: isEqual(song[i-1][instrumentKey2], song[i-1][instrumentKey]) ? 'visible' : 'hidden'}"></fa> {{config.instruments[instrumentKey2].name}}</b-dropdown-item>
							</b-dropdown>
						</PatternPlaceholderItem>
						<PatternPlaceholderItem>
							<a href="javascript:" @click="removePatternFromSong(instrumentKey, i-1)" title="Remove" v-b-tooltip.hover><fa icon="trash" /></a>
						</PatternPlaceholderItem>
					</PatternPlaceholder>
					<span class="placeholder-drag-handle" draggable="true" @dragstart="handleResizeDragStart($event, instrumentKey, i-1)" @dragend="handleResizeDragEnd($event)"><span class="caret-se"></span></span>
				</div>
			</div>
			<div
				class="field heading-type all-drop"
				:class="getDragOverClass({ idx: i-1 })"
				@dragenter="handleDragEnter($event, { idx: i-1 })"
				@dragover="$event.preventDefault()"
				@dragleave="handleDragLeave($event, { idx: i-1 })"
				@drop="handleDrop($event)"
			>
				(All)
			</div>
		</div></div>
		<div class="song-position-marker"></div>
		<Progress :progress="loading" @cancel="cancelExport()"/>
	</div>
	<ShareDialog :id="shareDialogId"/>
	<ImportDialog :id="importDialogId"/>
</div>