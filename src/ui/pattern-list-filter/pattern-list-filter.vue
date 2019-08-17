<b-input-group class="bb-pattern-list-filter">
	<b-form-input v-model="value.text" :placeholder="`Filter: ${filterCats[value.cat]}`" autofocus />
	<b-input-group-append>
		<b-dropdown right variant="secondary">
			<b-dropdown-item v-for="(val, key) in filterCats" :key="key" :active="value.text.trim()=='' && value.cat==key" @click="value.cat = key">{{val}}</b-dropdown-item>
		</b-dropdown>
	</b-input-group-append>
</b-input-group>