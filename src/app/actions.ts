"use server";

import webpush from "web-push";

webpush.setVapidDetails(
	"mailto:shifa@example.com",
	process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
	process.env.VAPID_PRIVATE_KEY || "",
);

let subscription: PushSubscription | null = null;

export async function subscribeUser(sub: PushSubscription) {
	subscription = sub;
	// In a production environment, you would want to store the subscription in a database
	// For example: await db.subscriptions.create({ data: sub })
	return { success: true };
}

export async function unsubscribeUser() {
	subscription = null;
	// In a production environment, you would want to remove the subscription from the database
	// For example: await db.subscriptions.delete({ where: { ... } })
	return { success: true };
}

export async function sendNotification(message: string) {
	if (!subscription) {
		throw new Error("No subscription available");
	}

	try {
		const pushSubscription = {
			endpoint: subscription.endpoint,
			keys: {
				p256dh: subscription.toJSON().keys?.p256dh || "",
				auth: subscription.toJSON().keys?.auth || "",
			},
		};

		await webpush.sendNotification(
			pushSubscription,
			JSON.stringify({
				title: "Shifa Medical Alert",
				body: message,
				icon: "/icon-192x192.svg",
			}),
		);
		return { success: true };
	} catch (error) {
		console.error("Error sending push notification:", error);
		return { success: false, error: "Failed to send notification" };
	}
}
