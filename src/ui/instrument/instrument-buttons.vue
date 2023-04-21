<div class="bb-instr-buttons d-flex align-items-center">
    <fa icon="headphones" class="pr-2" />
    <div class="btn-group">
        <button data-toggle="button" class="btn btn-outline-secondary" :class="{active: active('ls')}" @click="onClick('ls')">Low</button>
        <button data-toggle="button" class="btn btn-outline-secondary" :class="{active: active('ms')}" @click="onClick('ms')">Mid</button>
        <button data-toggle="button" class="btn btn-outline-secondary" :class="{active: active('hs')}" @click="onClick('hs')">High</button>
        <button data-toggle="button" class="btn btn-outline-secondary" :class="{active: active('sn')}" @click="onClick('sn')">Snare</button>
        <button data-toggle="button" class="btn btn-outline-secondary" :class="{active: active('re')}" @click="onClick('re')">Repi</button>
        <button data-toggle="button" class="btn btn-outline-secondary" :class="{active: active('ta')}" @click="onClick('ta')">Tam</button>
        <button data-toggle="button" class="btn btn-outline-secondary" :class="{active: active('ag')}" @click="onClick('ag')">Agogô</button>
    	<PlaybackSettings :playback-settings="playbackSettings" :default-speed="tune.speed" />

    </div>
</div>