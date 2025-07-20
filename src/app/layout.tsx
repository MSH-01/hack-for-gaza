import type { Metadata, Viewport } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { ServiceWorkerRegistration } from "../components/ServiceWorkerRegistration";

const geistSans = GeistSans;
const geistMono = GeistMono;

export const metadata: Metadata = {
	title: "Shifa - Medical Triage App",
	description:
		"Quickly triage patients with our medical decision support system.",
	manifest: "/manifest.webmanifest",
	appleWebApp: {
		capable: true,
		statusBarStyle: "default",
		title: "Shifa",
		startupImage: ["/icon-192x192.svg"],
	},
	icons: {
		icon: [
			{ url: "/icon-192x192.svg", sizes: "192x192", type: "image/svg+xml" },
			{ url: "/icon-512x512.svg", sizes: "512x512", type: "image/svg+xml" },
		],
		apple: [
			{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
		],
	},
	other: {
		"mobile-web-app-capable": "yes",
	},
};

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	maximumScale: 1,
	userScalable: false,
	themeColor: "#000000",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				<link rel="manifest" href="/manifest.webmanifest" />
				<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
				<link
					rel="apple-touch-icon-precomposed"
					href="/apple-touch-icon-precomposed.png"
				/>
				<link
					rel="apple-touch-icon"
					sizes="120x120"
					href="/apple-touch-icon-120x120.png"
				/>
				<link
					rel="apple-touch-icon"
					sizes="120x120"
					href="/apple-touch-icon-120x120-precomposed.png"
				/>
				<link
					rel="apple-touch-icon"
					sizes="152x152"
					href="/apple-touch-icon-152x152.png"
				/>
				<link
					rel="apple-touch-icon"
					sizes="180x180"
					href="/apple-touch-icon-180x180.png"
				/>
				<link
					rel="apple-touch-icon"
					sizes="167x167"
					href="/apple-touch-icon-167x167.png"
				/>
				<meta name="apple-mobile-web-app-capable" content="yes" />
				<meta name="apple-mobile-web-app-status-bar-style" content="default" />
				<meta name="apple-mobile-web-app-title" content="Shifa" />
				<meta name="mobile-web-app-capable" content="yes" />
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				{children}
				<ServiceWorkerRegistration />
			</body>
		</html>
	);
}
