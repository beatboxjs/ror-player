import app from "../../app";

app.factory("bbPlaybackSettings", function() {
	class bbPlaybackSettings {
		constructor(data) {
			this.speed = 100;
			this.headphones = null;
			this.mute = { };
			this.volume = 1;
			this.volumes = { };
			this.loop = false;

			Object.assign(this, data);
		}
	}

	return bbPlaybackSettings;
});