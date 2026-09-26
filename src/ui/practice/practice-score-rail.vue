<script setup lang="ts">
	import { ref, computed } from "vue";
	import { useI18n } from "../../services/i18n";
	import { type SessionStats, type Verdict, type Difficulty, deltaToPosition, toleranceForDifficulty } from "../../services/practiceScorer";
	import type { PracticeState } from "../../services/practiceEngine";

	const props = defineProps<{
		stats: SessionStats;
		recentHits?: { delta: number; verdict: Verdict }[];
		micActive: boolean;
		latencyMs: number;
		state: PracticeState;
		difficulty: Difficulty;
		speedBpm: number;
		disabledReason?: string;
	}>();

	const i18n = useI18n();
	const detailsOpen = ref(false);
	const isIdle = computed(() => props.state === "idle" && !props.disabledReason);

	const tolerance = computed(() => toleranceForDifficulty(props.difficulty));

	// Oldest → newest; age 0 = newest (brightest + pulses).
	const markers = computed(() => {
		const hits = props.recentHits ?? [];
		return hits.map((h, i) => {
			// Both position and colour scale with difficulty: position uses the tolerance
			// so the marker lands correctly within the meter, and colour uses the scorer's
			// authoritative verdict so it matches the partition and stays correct.
			const { percent } = deltaToPosition(h.delta, tolerance.value);
			const age = hits.length - 1 - i;
			return { percent, verdict: h.verdict, age, opacity: age === 0 ? 1 : Math.max(0.18, 0.7 - age * 0.14) };
		});
	});

	// The good zone as a fraction of the ±off meter. good and off scale by the same difficulty
	// factor, so the ratio is ≈0.4 in practice (exactly 0.4 for normal/hard; 105/263 ≈ 0.399 for
	// easy after integer rounding — a sub-pixel difference) — deriving it keeps the band aligned with
	// the markers if a future difficulty changes the ratio meaningfully.
	const meterZoneStyle = computed(() => {
		const ratio = tolerance.value.good / tolerance.value.off;
		return { left: (50 - ratio * 50) + "%", width: (ratio * 100) + "%" };
	});
</script>

<template>
	<aside class="bb-practice-score-rail">
		<div v-if="props.disabledReason" class="bb-practice-disabled-reason">{{ props.disabledReason }}</div>
		<template v-else>
			<div v-if="isIdle" class="bb-practice-headline idle">{{ i18n.t("practice.score.idle") }}</div>
			<div v-else class="bb-practice-headline">{{ props.stats.headlineScore }}</div>

			<div class="bb-practice-meter" :class="{ idle: isIdle }">
				<div class="bb-practice-meter-zone" :style="meterZoneStyle"></div>
				<div class="bb-practice-meter-center"></div>
				<div
					v-for="(m, idx) in markers"
					:key="idx"
					class="bb-practice-meter-marker"
					:class="[`verdict-${m.verdict}`, { newest: m.age === 0 }]"
					:style="{ left: m.percent + '%', opacity: m.opacity }"
				>
					<span v-if="m.age === 0" class="bb-practice-meter-pulse" :class="`verdict-${m.verdict}`"></span>
				</div>
			</div>
			<div class="bb-practice-meter-labels">
				<span>{{ i18n.t("practice.score.behind") }}</span>
				<span>{{ i18n.t("practice.score.early") }}</span>
			</div>

			<div class="bb-practice-spacer"></div>

			<button type="button" class="bb-practice-details-toggle" :aria-expanded="detailsOpen" @click="detailsOpen = !detailsOpen">
				<fa icon="caret-down" class="caret" :class="{ open: detailsOpen }" /> {{ i18n.t("practice.score.sessionTotals") }}
			</button>
			<div v-if="detailsOpen" class="bb-practice-details">
				<div class="bb-practice-stat"><span>{{ i18n.t("practice.score.avgDelta") }}</span><strong>±{{ Math.round(props.stats.meanAbsDelta) }} ms</strong></div>
				<div class="bb-practice-stat"><span>{{ i18n.t("practice.score.drift") }}</span><strong>{{ props.stats.drift > 0 ? "+" : "" }}{{ Math.round(props.stats.drift) }} ms</strong></div>
				<div class="bb-practice-stat"><span>{{ i18n.t("practice.score.hits") }}</span><strong>{{ props.stats.hits }}</strong></div>
				<div class="bb-practice-stat"><span>{{ i18n.t("practice.score.misses") }}</span><strong>{{ props.stats.misses }}</strong></div>
				<div class="bb-practice-stat"><span>{{ i18n.t("practice.score.extras") }}</span><strong>{{ props.stats.extras }}</strong></div>
			</div>

			<hr>

			<div class="bb-practice-status">
				<div class="bb-practice-status-row">
					<fa :icon="props.micActive ? 'microphone' : 'microphone-slash'" :class="{ 'text-danger': props.micActive }" />
					{{ props.micActive ? i18n.t("practice.mic.listening") : i18n.t("practice.mic.stopped") }}
				</div>
				<div class="bb-practice-status-row split">
					<span>{{ i18n.t(`practice.difficulty.${props.difficulty}`) }}</span>
					<span>{{ props.speedBpm }} BPM</span>
				</div>
				<div class="bb-practice-status-row split">
					<span class="text-muted">{{ i18n.t("practice.latency.label") }}</span>
					<span>{{ props.latencyMs }} ms</span>
				</div>
			</div>
		</template>
	</aside>
</template>

<style lang="scss">
	.bb-practice-score-rail {
		width: 150px;
		flex-shrink: 0;
		padding: 12px;
		background: var(--bs-tertiary-bg);
		border-right: 1px solid var(--bs-border-color);
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.bb-practice-headline {
		font-size: 36px;
		font-weight: bold;
		color: var(--bs-success);
		text-align: center;
		line-height: 1;

		&.idle {
			font-size: 14px;
			font-weight: normal;
			font-style: italic;
			color: var(--bs-secondary-color);
			padding-top: 8px;
		}
	}
	.bb-practice-meter {
		position: relative;
		height: 16px;
		border-radius: 8px;
		background: var(--bs-secondary-bg);
		margin-top: 2px;

		&.idle { opacity: 0.35; }

		.bb-practice-meter-zone {
			position: absolute;
			top: 0; bottom: 0;
			background: color-mix(in srgb, var(--bs-success) 18%, transparent);
			border-left: 1px dashed var(--bs-success);
			border-right: 1px dashed var(--bs-success);
		}
		.bb-practice-meter-center {
			position: absolute; left: 50%; top: -3px; bottom: -3px; width: 2px;
			background: var(--bs-secondary-color); transform: translateX(-50%);
		}
		.bb-practice-meter-marker {
			position: absolute; top: 50%; width: 14px; height: 14px; border-radius: 50%;
			border: 2px solid var(--bs-body-bg); transform: translate(-50%, -50%); z-index: 2;
			&.verdict-good { background: var(--bs-success); }
			&.verdict-off  { background: var(--bs-warning); }
			&.newest { box-shadow: 0 1px 3px rgba(0, 0, 0, .35); z-index: 3; }
		}
		.bb-practice-meter-pulse {
			position: absolute; left: 50%; top: 50%; width: 14px; height: 14px; border-radius: 50%;
			transform: translate(-50%, -50%);
			animation: bb-practice-pulse 1.1s ease-out infinite;
			&.verdict-good { background: var(--bs-success); }
			&.verdict-off  { background: var(--bs-warning); }
		}
	}
	@keyframes bb-practice-pulse {
		0%   { transform: translate(-50%, -50%) scale(.5); opacity: .8; }
		100% { transform: translate(-50%, -50%) scale(2.6); opacity: 0; }
	}
	.bb-practice-meter-labels {
		display: flex; justify-content: space-between;
		font-size: 10px; text-transform: uppercase; letter-spacing: .04em;
		color: var(--bs-secondary-color);
	}
	.bb-practice-spacer { flex-grow: 1; }
	.bb-practice-details-toggle {
		background: none; border: none; padding: 2px 0; text-align: left;
		font-size: 12px; color: var(--bs-secondary-color); cursor: pointer;
		.caret { transition: transform .15s; }
		.caret.open { transform: rotate(0deg); }
		.caret:not(.open) { transform: rotate(-90deg); }
	}
	.bb-practice-details { display: flex; flex-direction: column; gap: 4px; }
	.bb-practice-stat { display: flex; justify-content: space-between; font-size: 12px; }
	.bb-practice-status {
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-size: 12px;

		.bb-practice-status-row {
			display: flex;
			align-items: center;
			gap: 4px;

			&.split { justify-content: space-between; }
		}
	}
	.bb-practice-disabled-reason {
		font-size: 13px; color: var(--bs-secondary-color); font-style: italic; text-align: center;
	}
</style>
