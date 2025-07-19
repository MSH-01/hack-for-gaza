import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

// Use a stable revision instead of random UUID to prevent infinite rebuilds
const revision = "1.0.0";

const withSerwist = withSerwistInit({
	cacheOnNavigation: true,
	swSrc: "src/app/sw.ts",
	swDest: "public/sw.js",
	additionalPrecacheEntries: [{ url: "/~offline", revision }],
	// Disable service worker in development to prevent infinite loops
	disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
	/* config options here */
	allowedDevOrigins: ["*"],
	async headers() {
		return [
			{
				source: "/(.*)",
				headers: [
					{
						key: "X-Content-Type-Options",
						value: "nosniff",
					},
					{
						key: "X-Frame-Options",
						value: "DENY",
					},
					{
						key: "Referrer-Policy",
						value: "strict-origin-when-cross-origin",
					},
				],
			},
			{
				source: "/sw.js",
				headers: [
					{
						key: "Content-Type",
						value: "application/javascript; charset=utf-8",
					},
					{
						key: "Cache-Control",
						value: "no-cache, no-store, must-revalidate",
					},
					{
						key: "Content-Security-Policy",
						value: "default-src 'self'; script-src 'self'",
					},
				],
			},
		];
	},
};

export default withSerwist(nextConfig);
