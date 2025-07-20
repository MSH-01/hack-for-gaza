"use client";

import { useEffect, useState } from "react";

export function ServiceWorkerRegistration() {
	const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
	const [isOffline, setIsOffline] = useState(false);

	useEffect(() => {
		// Only register service worker in production
		if (process.env.NODE_ENV === "development") {
			console.log("Service worker disabled in development mode");
			return;
		}

		// Check if service worker is supported
		if ("serviceWorker" in navigator) {
			// Register service worker
			navigator.serviceWorker
				.register("/sw.js")
				.then((registration) => {
					console.log("SW registered: ", registration);

					// Check for updates
					registration.addEventListener("updatefound", () => {
						const newWorker = registration.installing;
						if (newWorker) {
							newWorker.addEventListener("statechange", () => {
								if (
									newWorker.state === "installed" &&
									navigator.serviceWorker.controller
								) {
									setIsUpdateAvailable(true);
								}
							});
						}
					});

					// Handle controller change
					navigator.serviceWorker.addEventListener("controllerchange", () => {
						console.log("New service worker activated");
						setIsUpdateAvailable(false);
						// Reload the page to use the new service worker
						window.location.reload();
					});
				})
				.catch((registrationError) => {
					console.log("SW registration failed: ", registrationError);
				});
		}

		// Handle online/offline status
		const handleOnline = () => setIsOffline(false);
		const handleOffline = () => setIsOffline(true);

		window.addEventListener("online", handleOnline);
		window.addEventListener("offline", handleOffline);

		// Set initial offline status
		setIsOffline(!navigator.onLine);

		return () => {
			window.removeEventListener("online", handleOnline);
			window.removeEventListener("offline", handleOffline);
		};
	}, []);

	const handleUpdate = () => {
		if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
			navigator.serviceWorker.controller.postMessage({ type: "SKIP_WAITING" });
		}
	};

	return (
		<>
			{isUpdateAvailable && (
				<div className="fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg z-50">
					<div className="flex items-center space-x-4">
						<span>New version available!</span>
						<button
							type="button"
							onClick={handleUpdate}
							className="bg-white text-blue-500 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
						>
							Update
						</button>
					</div>
				</div>
			)}
		</>
	);
}
