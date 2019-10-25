<div class="bb-progress" v-if="progress != null">
	<b-progress height="26px">
		<b-progress-bar animated :value="progress" variant="success">{{progress}} %</b-progress-bar>
	</b-progress>
	<a href="javascript:" @click="$emit('cancel')"><fa icon="window-close"/></a>
</div>