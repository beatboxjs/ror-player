<b-dropdown v-if="historicStates.length > 1" class="bb-history" variant="secondary" right>
	<template slot="button-content">
		<span :id="popoverId" v-b-popover.bottom="popoverMessage"><i class="fas fa-clock"></i> History</span>
	</template>
	<b-dropdown-item v-for="historicState in historicStates" :key="historicState.key" :active="historicState.isCurrent" @click="loadHistoricState(historicState.key)" :title="historicState.isoDate">{{historicState.readableDate}}</b-dropdown-item>
	<b-dropdown-divider />
	<b-dropdown-item href="javascript:" @click="clearHistory()">Clear</b-dropdown-item>
</b-dropdown>