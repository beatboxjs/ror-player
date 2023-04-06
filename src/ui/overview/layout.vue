<div class="bb-overview">

	<Compatibility />
	<Update />

	<div class="d-flex flex-column h-100">
		<div class="header-nav">
			<a class="logo" href="https://xrrhythms.uk">
					<img src="../../../assets/img/XRR-logo.webp" alt="XR Rhythms UK">
			</a>
			<a class="heading" href="https://xrrhythms.uk">
				<img src="../../../assets/img/XRR-header.webp" class="d-none d-md-inline">
			</a>
			</span>
			<span class="tab"">
				<router-link to="/">About</router-link>
			</span>
			<span class="tab">
				<router-link to="/listen" class="with-child-links">Listen</router-link>
			</span>
			<span class="tab">
				<router-link to="/compose" class="with-child-links">Compose</router-link>
			</span>
			<Help />
		</div>

		<router-view class="flex-grow-1" />
	</div>

	<div class="bb-cover" @click="togglePatternList()"></div>
</div>