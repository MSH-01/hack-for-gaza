import MedicalDecisionTree from "@/components/MedicalDecisionTree";
import PushNotificationManager from "@/components/PushNotificationManager";
import InstallPrompt from "@/components/InstallPrompt";

export default function Home() {
	return (
		<div className="container mx-auto p-4">
			<MedicalDecisionTree />
			<div className="mt-8 space-y-4">
				<PushNotificationManager />
				<InstallPrompt />
			</div>
		</div>
	);
}
