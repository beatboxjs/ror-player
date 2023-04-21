<div class="bb-overview">

	<Compatibility />
	<Update />

	<div class="d-flex flex-column h-100">
		<div class="header-nav">
			<span class="navbar-light d-inline-block d-md-none" @click="togglePatternList()">
				<b-button class="navbar-toggler"><span class="navbar-toggler-icon" /></b-button>
			</span>
			<a class="logo" href="https://xrrhythms.uk">
					<img src="../../../assets/img/XRR-logo.webp" alt="XR Rhythms UK">
			</a>
			<a class="heading" href="https://xrrhythms.uk">
				<img src="../../../assets/img/XRR-header.webp" class="d-none d-md-inline">
			</a>
			</span>
			<span class="d-flex flex-row flex-grow-1 gap-2">
				<span class="tab">
					<router-link to="/">About</router-link>
				</span>
				<span class="tab">
					<router-link to="/listen" class="with-child-links">Listen</router-link>
				</span>
				<span class="tab">
					<router-link to="/compose" class="with-child-links">Compose</router-link>
				</span>
				<Help />
			</span>
		</div>

		<router-view class="flex-grow-1" />
	</div>

	<div class="bb-cover" @click="togglePatternList()"></div>
</div>