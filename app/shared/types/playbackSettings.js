import app from "../../app";

app.factory("bbPlaybackSettings", function(bbConfig, $) {
	class bbPlaybackSettings {
		constructor(data) {
			this.reset(data);
		}

		reset(data) {
			this.speed = 100;
			this.headphones = null;
			this.mute = { };
			this.volume = 1;
			this.volumes = bbConfig.defaultVolumes;
			this.loop = false;
			this.length = null; // Cut off after a certain amount of beats

			Object.assign(this, data);

			this.mute = Object.assign({ }, this.mute);
			this.volumes = Object.assign({ }, this.volumes);
		}
	}

	return bbPlaybackSettings;
});