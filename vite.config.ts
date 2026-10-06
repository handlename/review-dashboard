import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
	base: "/review-dashboard/",
	plugins: [react()],
	test: {
		passWithNoTests: true,
	},
});
