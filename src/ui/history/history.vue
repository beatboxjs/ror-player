<b-dropdown v-if="historicStates.length > 1" class="bb-history" variant="secondary" right>
	<template slot="button-content">
		<span :id="popoverId"><fa icon="clock"/><span class="d-none d-sm-inline"> History</span></span>
	</template>
	<b-dropdown-item v-for="historicState in historicStates" :key="historicState.key" :active="historicState.isCurrent" @click="loadHistoricState(historicState.key)" :title="historicState.isoDate" draggable="false">{{historicState.readableDate}}</b-dropdown-item>
	<b-dropdown-divider />
	<b-dropdown-item href="javascript:" @click="clearHistory()" draggable="false">Clear</b-dropdown-item>
	<b-popover :target="popoverId" content="You have opened a shared view. Your previous songs and tunes can be restored here." placement="bottom" :show="!!showPopover" triggers="manual"/>
</b-dropdown>