<div>
    <div class="banner"><h1>Player</h1></div>
    <div class="content">
        <div v-html="content"></div>
        <h1>The Tunes</h1>
        <div class="styled-links">
            <router-link 
                v-for="(tuneName, i) in tuneList"
                :to="{name: 'listen', params: { tuneName }}"
                :key="tuneName">
                {{state.tunes[tuneName].displayName || tuneName}}
            </router-link>
        </div>
    </div>
</div>

