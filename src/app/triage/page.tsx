import MedicalDecisionTree from "@/components/MedicalDecisionTree";
import PushNotificationManager from "@/components/PushNotificationManager";
import InstallPrompt from "@/components/InstallPrompt";
import Image from "next/image";

export default function TriageHome() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-green-100 via-white to-red-100 flex flex-col">
			{/* Hero Section */}
			<section className="relative py-10 px-4 flex flex-col items-center text-center">
				{/* Palestinian Flag */}
				<div className="absolute top-4 left-4 flex items-center gap-2 z-10">
					<span className="inline-block w-8 h-5">
						<svg
							viewBox="0 0 48 30"
							width="32"
							height="20"
							xmlns="http://www.w3.org/2000/svg"
						>
							<title>Palestinian Flag</title>
							<rect width="48" height="10" y="0" fill="#000" />
							<rect width="48" height="10" y="10" fill="#fff" />
							<rect width="48" height="10" y="20" fill="#007A3D" />
							<polygon points="0,0 0,30 18,15" fill="#D30000" />
						</svg>
					</span>
					<span className="text-xs font-semibold text-gray-700 bg-white/80 px-2 py-0.5 rounded shadow">
						Support Gaza
					</span>
				</div>
				<Image
					src="/logo.jpeg"
					alt="Shifa Logo"
					width={64}
					height={64}
					className="mx-auto mb-4 drop-shadow-lg rounded-lg"
				/>
				<h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-red-600 to-green-600 bg-clip-text text-transparent mb-2 tracking-tight">
					Shifa Triage
				</h1>
				<p className="text-lg sm:text-xl text-gray-700 max-w-xl mx-auto mb-6">
					Rapid, offline-first medical triage for crisis zones. Prioritize care,
					save lives, and support Gaza’s resilience.
				</p>
			</section>

			{/* Main Card Section */}
			<main className="flex-1 flex flex-col items-center justify-center px-2">
				<div className="w-full max-w-xl bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-200 p-6 md:p-10 relative z-10">
					<h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
						Start Triage
					</h2>
					<MedicalDecisionTree />
					<div className="mt-8 flex flex-col gap-4 items-center">
						<PushNotificationManager />
						<InstallPrompt />
					</div>
				</div>
			</main>

			{/* Footer */}
			<footer className="mt-10 py-6 text-center text-gray-600 text-sm">
				<div className="flex flex-col items-center gap-2">
					<span className="font-semibold">Shifa &mdash; Hack for Gaza</span>
					<span className="opacity-70">
						Made with ❤️ for resilience and hope
					</span>
				</div>
			</footer>
		</div>
	);
}
