import app from "../app";

app.factory("bbPlaybackSettings", function(bbConfig, $) {
	class bbPlaybackSettings {
		constructor(data) {
			this.reset(data);
		}

		reset(data) {
			this.speed = bbConfig.defaultSpeed;
			this.headphones = [ ];
			this.mute = { };
			this.volume = 1;
			this.volumes = bbConfig.volumePresets[Object.keys(bbConfig.volumePresets)[0]];
			this.loop = false;
			this.length = null; // Cut off after a certain amount of beats
			this.whistle = false; // 1: Whistle on one, 2: whistle on all beats

			Object.assign(this, data);

			this.headphones = [].concat(this.headphones || []);
			this.mute = Object.assign({ }, this.mute);
			this.volumes = Object.assign({ }, this.volumes);
		}
	}

	return bbPlaybackSettings;
});