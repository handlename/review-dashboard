import { defineConfig } from "vitest/config";
import type { Plugin } from "vite";
import react from "@vitejs/plugin-react";

const CSP =
	"default-src 'self'; connect-src https://api.github.com; img-src 'self' https://avatars.githubusercontent.com; style-src 'self'";

// The dev server relies on inline scripts and styles for HMR, so the CSP is injected only into the production build.
function cspPlugin(): Plugin {
	return {
		name: "csp",
		apply: "build",
		// Replace the string instead of returning a tag descriptor, which would escape the quotes as &#39;.
		transformIndexHtml(html) {
			if (!html.includes("<head>")) {
				throw new Error("cspPlugin: <head> not found in index.html");
			}
			return html.replace(
				"<head>",
				`<head>\n    <meta http-equiv="Content-Security-Policy" content="${CSP}">`,
			);
		},
	};
}

export default defineConfig({
	base: "/review-dashboard/",
	plugins: [react(), cspPlugin()],
	test: {
		passWithNoTests: true,
	},
});
