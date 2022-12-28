[XR Player](https://player.xrrhythms.uk/) is a browser-based player for
[XR Rhythms tunes](https://github.com/rhythms-of-resistance/sheetbook/tree/master/generated). It is based on [Rhythms of Resistance player](https://github.com/rhythms-of-resistance/).
It is written in TypeScript and relies heavily on beatbox.js, Vue.js and Bootstrap. The core features are:

* Read and play the notes of all XR Rhythms tunes and breaks
* Edit the notes, even while they are playing
* Compose own tunes and breaks and share them as a link. The notes are stored in the hash part of the link, nothing is stored on the server.
* Compose songs (sequences of tunes and breaks in different combinations)
* Export tunes, breaks and songs as MP3 or WAV
* Smartphone-friendly UI
* Can be used offline. Everything is packed in a single HTML file that is cached in the browser and can easily be downloaded for offline use.
* License: AGPL-3

More information can be found in the [documentation](https://player-docs.rhythms-of-resistance.org/).

Used technologies are:
* [TypeScript](https://www.typescriptlang.org/) and [SASS](https://sass-lang.com/) for cleaner code
* [Vue.js](https://vuejs.org/), [Bootstrap 4](https://getbootstrap.com/) and [Font Awesome](https://fontawesome.com/) for the UI
* [howler.js](https://howlerjs.com/) to play audio in the browser
* [wav-encoder](https://github.com/mohayonao/wav-encoder), [Aurora.js](https://github.com/audiocogs/aurora.js/),
  [audiolib.js](https://github.com/jussi-kalliokoski/audiolib.js/) and [libmp3lame.js](https://github.com/akrennmair/libmp3lame-js)
  for MP3/WAV export
* [pako](https://github.com/nodeca/pako) to compress shared links
* [Babel](https://babeljs.io/), [webpack](https://webpack.js.org/) and [gulp.js](https://gulpjs.com/) for building


Technical notes
===============

* The current state (modifications to tunes/breaks and own compositions) is stored in the local storage of the browser. The `bbState` item
  contains the current state, historical states are stored as `bbState-<timestamp>`.
* A service worker stores a copy of the `index.html` file in the application cache. When opening the player, it is loaded from the cache if
  it is available there (to speed up loading and to make offline access possible). Only after the player is loaded, the service worker
  downloads the most recent `index.html` from the server (if the connection is possible) and updates the cache. Once downloaded, if the file
  has changed, a notification is shown in the player, and the page has to be reloaded in order to show the updated version.


Build and host it yourself
==========================

Customise it
------------

The tunes are configured in [`assets/tunes`](./assets/tunes), along with tune descriptions. The format is very similar to the "Raw (uncompressed)" format that
can be generated in the Share dialog of the player.

All the parameters (such as the instruments, samples, time measurements) are configured in [`src/config.ts`](./src/config.ts).

The samples are available as MP3 files in [`assets/audio`](./assets/audio).

More details can be found in the [documentation](https://player-docs.rhythms-of-resistance.org/guide/technical/config.html).

Build it
--------

Once you have made your modifications, you can build the player to get a HTML file that you can use in your browser:
1. Make sure you have an up-to-date version of Node.js installed.
2. In a terminal, navigate to the main code directory of the player and run `npm install` to install the dependencies.
3. Run `npm run build` to build the project.
4. The file `build/index.html` is a self-sufficient build of the player that can be opened in the browser

While you are playing around with some changes and don't want to rebuild the whole project each time you made a small change,
after step 2 you can run `npm run dev-server` instead. This will start a webserver on http://localhost:8080/ that will serve
the built player. When you make any changes to a file, it detects that and rebuild just that file. Simply reload the page to
see the updated player.

Host it
-------

Information how to host XR Rhythms Player can be found in the [documentation](https://player-docs.rhythms-of-resistance.org/guide/technical/host.html).