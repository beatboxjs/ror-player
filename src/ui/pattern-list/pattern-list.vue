<div class="bb-pattern-list">
	<PatternListFilter v-model="filter" />

	<hr />

	<div class="bb-pattern-list-tunes">
		<b-card no-body v-for="tune in visibleTunes" :key="tune.tuneName">
			<b-card-header>
				<b-button block @click="toggleTune(tune.tuneName)" variant="link">
					{{tune.displayName}}
					<i v-if="tune.isCustom" class="fas fa-star" title="User-created tune" v-b-tooltip></i>
					<i class="fas fa-caret-down"></i>
				</b-button>
			</b-card-header>
			<Collapse v-model="isOpened[tune.tuneName]" :id="tune.collapseId" :height="tune.height">
				<b-card-body>
					<PatternPlaceholder v-for="pattern in tune.patterns" :key="pattern.patternName" :tune-name="tune.tuneName" :pattern-name="pattern.patternName" :draggable="true">
						<PatternPlaceholderItem><a href="javascript:" :title="`Copy${pattern.isCustom ? '/Move/Rename' : ''} break`" v-b-tooltip.hover @click="copyPattern(tune.tuneName, pattern.patternName)"><i class="fas fa-copy"></i></a></PatternPlaceholderItem>
						<PatternPlaceholderItem v-if="pattern.isCustom"><a href="javascript:" title="Remove" v-b-tooltip.hover @click="removePatternFromTune(tune.tuneName, pattern.patternName)"><i class="fas fa-trash"></i></a></PatternPlaceholderItem>
						<slot :tune-name="tune.tuneName" :pattern-name="pattern.patternName"/>
					</PatternPlaceholder>
					<div class="tune-actions">
						<a href="javascript:" @click="createPatternInTune(tune.tuneName)" title="New break" v-b-tooltip.hover><i class="fas fa-plus"></i></a>
						<a v-if="tune.isCustom" href="javascript:" @click="renameTune(tune.tuneName)" title="Rename tune" v-b-tooltip.hover><i class="fas fa-pen"></i></a>
						<a href="javascript:" @click="copyTune(tune.tuneName)" title="Copy tune" v-b-tooltip.hover><i class="fas fa-copy"></i></a>
						<a v-if="tune.isCustom" href="javascript:" @click="removeTune(tune.tuneName)" title="Remove tune" v-b-tooltip.hover><i class="fas fa-trash"></i></a>
					</div>
				</b-card-body>
			</Collapse>
		</b-card>
	</div>

	<div class="general-actions">
		<a href="javascript:" @click="createTune()"><i class="fas fa-plus"></i> New tune</a>
	</div>

	<PatternEditorDialog v-if="showPatternEditor" :id="showPatternEditor.id" :tune-name="showPatternEditor.tuneName" :pattern-name="showPatternEditor.patternName"/>
	<RenamePatternDialog v-if="showRename" :id="showRename.id" :tune-name="showRename.tuneName" :pattern-name="showRename.patternName"/>
</div>