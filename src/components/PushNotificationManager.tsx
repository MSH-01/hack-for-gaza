"use client";

import { useEffect, useState } from "react";
import { subscribeUser, unsubscribeUser } from "../app/actions";

export default function PushNotificationManager() {
	const [isSubscribed, setIsSubscribed] = useState(false);
	const [subscription, setSubscription] = useState<PushSubscription | null>(
		null,
	);
	const [registration, setRegistration] =
		useState<ServiceWorkerRegistration | null>(null);

	useEffect(() => {
		if (typeof window !== "undefined" && "serviceWorker" in navigator) {
			const subscribe = async () => {
				try {
					const result = await navigator.serviceWorker.ready;
					setRegistration(result);
					const sub = await result.pushManager.getSubscription();
					setSubscription(sub);
					setIsSubscribed(
						!!(
							sub &&
							!(
								sub.expirationTime &&
								Date.now() > sub.expirationTime - 5 * 60 * 1000
							)
						),
					);
				} catch (error) {
					console.error("Service Worker registration failed:", error);
				}
			};
			subscribe();
		}
	}, []);

	const subscribeButtonOnClick = async (
		event: React.MouseEvent<HTMLButtonElement>,
	) => {
		event.preventDefault();
		if (!registration) return;

		try {
			const sub = await registration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
			});
			await subscribeUser(sub);
			setSubscription(sub);
			setIsSubscribed(true);
		} catch (error) {
			console.error("Failed to subscribe the user: ", error);
		}
	};

	const unsubscribeButtonOnClick = async (
		event: React.MouseEvent<HTMLButtonElement>,
	) => {
		event.preventDefault();
		if (!subscription) return;

		try {
			await subscription.unsubscribe();
			await unsubscribeUser();
			setSubscription(null);
			setIsSubscribed(false);
		} catch (error) {
			console.error("Error unsubscribing", error);
		}
	};

	if (!registration) {
		return null;
	}

	return (
		<div className="p-4 bg-gray-100 rounded-lg">
			<h3 className="text-lg font-semibold mb-2">Push Notifications</h3>
			<p className="text-sm text-gray-600 mb-4">
				Get notified about emergency alerts and patient updates.
			</p>
			{isSubscribed ? (
				<button
					type="button"
					onClick={unsubscribeButtonOnClick}
					className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
				>
					Unsubscribe from Notifications
				</button>
			) : (
				<button
					type="button"
					onClick={subscribeButtonOnClick}
					className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
				>
					Subscribe to Notifications
				</button>
			)}
		</div>
	);
}
