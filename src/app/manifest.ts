import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "Shifa - Medical Triage App",
		short_name: "Shifa",
		description:
			"Quickly triage patients with our medical decision support system.",
		start_url: "/",
		scope: "/",
		display: "standalone",
		background_color: "#ffffff",
		theme_color: "#000000",
		orientation: "portrait",
		lang: "en",
		icons: [
			{
				src: "/icon-192x192.svg",
				sizes: "192x192",
				type: "image/svg+xml",
				purpose: "maskable",
			},
			{
				src: "/icon-512x512.svg",
				sizes: "512x512",
				type: "image/svg+xml",
				purpose: "maskable",
			},
		],
	};
}
