This folder contains the tune descriptions that are displayed in “Listen” mode of the player.

The descriptions are written in Markdown and are stored under the paths `${tune}/${lang}.md`, where `${tune}` represents the tune name (and is referenced as `descriptionFilename` in the `defaultTunes.ts` config file), and `${lang}` represents the language of each translation.

Translations are managed on [Weblate](https://hosted.weblate.org/projects/ror-player/) using the [support for Markdown files](https://docs.weblate.org/en/latest/formats/markdown.html). This requires one component per Markdown file and automatically splits up its content into reasonable translation strings. The “Component discovery” add-on ([configured](https://hosted.weblate.org/addons/ror-player/tune-description-afoxe/) on the “Tune description: afoxe” component) automatically creates one component per tune description.

Because of the way Weblate handles Markdown files, changes to the original language (English) must be made here in the repository, while changes to all other languages must be made on Weblate. Do not modify the other languages here in the repository!