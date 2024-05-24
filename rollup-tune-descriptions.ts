import type { Plugin } from "rollup";
import glob from "fast-glob";

export default function tuneDescriptionsPlugin(): Plugin {
	return {
		name: 'virtual:tuneDescriptionsHtml',
		resolveId: (id) => {
			if (id === 'virtual:tuneDescriptionsHtml') {
				return id;
			}
		},
		load: async (id) => {
			if (id === 'virtual:tuneDescriptionsHtml') {
				const paths = await glob("./assets/tuneDescriptions/*.md");
				const descriptions = paths.map((path) => {
					const name = path.match(/\/([^/]*)\.md$/i)[1].replace(/-./g, (x) => x[1].toUpperCase());
					return { name, path };
				});

				const imports = descriptions.map(({ name, path }) => `import { html as ${name} } from ${JSON.stringify(path)};`).join("\n");
				const exp = `export default {\n\t${descriptions.map(({ name }) => name).join(",\n\t")}\n};`;
				return `${imports}\n\n${exp}`;
			}
		}
	}
}