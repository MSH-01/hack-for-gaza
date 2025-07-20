import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Play, Globe, Zap, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function TriageLanding() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-green-100 via-white to-red-100 flex flex-col">
			{/* Header - Mobile First */}
			<header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
				<div className="px-4 py-3 max-w-7xl mx-auto flex justify-between items-center relative">
					{/* Palestinian Flag */}
					<div className="absolute left-0 flex items-center gap-2 z-10">
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
					<div className="flex items-center gap-2 mx-auto">
						<Image
							src="/logo.jpeg"
							alt="Shifa Logo"
							width={32}
							height={32}
							className="w-7 h-7 rounded-lg object-contain"
						/>
						<h1 className="text-xl font-bold bg-gradient-to-r from-red-600 to-green-600 bg-clip-text text-transparent">
							Shifa
						</h1>
					</div>
					<div className="flex items-center gap-2">
						<Button
							size="sm"
							className="bg-gradient-to-r from-red-600 to-green-600 text-white px-4 py-2 shadow-md hover:scale-105 transition-transform duration-200"
						>
							<Link href="/triage">Get Started</Link>
						</Button>
					</div>
				</div>
			</header>

			{/* Title Section - Mobile First */}
			<section className="px-4 py-10 text-center bg-green-300/60 backdrop-blur-md shadow-inner">
				<div className="max-w-7xl mx-auto">
					<h2 className="text-4xl font-extrabold mb-4 leading-tight sm:text-5xl bg-gradient-to-r from-red-600 to-green-600 bg-clip-text text-transparent drop-shadow-lg">
						Shifa
					</h2>

					<p className="text-lg text-gray-800 mb-8 leading-relaxed sm:text-xl max-w-2xl mx-auto">
						A lightweight, offline-first triage system for crisis response.
						Prioritize care, save lives, and support Gaza’s resilience.
					</p>

					{/* User types - Mobile First (Stacked) */}
					<div className="space-y-4 mb-8 sm:flex sm:space-y-0 sm:space-x-8 sm:justify-center">
						<div className="flex items-center justify-center gap-3">
							<div className="w-4 h-4 rounded-full bg-red-500 animate-pulse" />
							<span className="text-lg text-gray-800 font-semibold">
								Doctors
							</span>
						</div>
						<div className="flex items-center justify-center gap-3">
							<div className="w-4 h-4 rounded-full bg-yellow-500 animate-pulse" />
							<span className="text-lg text-gray-800 font-semibold">
								Patients
							</span>
						</div>
						<div className="flex items-center justify-center gap-3">
							<div className="w-4 h-4 rounded-full bg-green-500 animate-pulse" />
							<span className="text-lg text-gray-800 font-semibold">
								Volunteers
							</span>
						</div>
					</div>
				</div>
			</section>

			{/* Hero Section - Mobile First */}
			<section className="px-4 py-12 bg-white/80 backdrop-blur-md">
				<div className="max-w-7xl mx-auto">
					<div className="flex flex-col-reverse lg:flex-row items-center gap-12">
						{/* Left: Headline, Value Prop, Features, CTAs */}
						<div className="flex-1 text-center lg:text-left">
							<h3 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-red-600 to-green-600 bg-clip-text text-transparent mb-4 drop-shadow-lg">
								Transform Emergency Care
							</h3>
							<p className="text-lg text-gray-700 mb-6 max-w-xl mx-auto lg:mx-0">
								Shifa is a rapid, offline-first triage platform for crisis
								zones. Prioritize care, save lives, and support Gaza’s
								resilience with modern, device-friendly tools.
							</p>

							{/* Feature Highlights */}
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 max-w-md mx-auto lg:mx-0">
								<div className="flex items-center gap-3 p-3 rounded-xl bg-green-100/60 shadow">
									<Globe className="h-6 w-6 text-green-600" />
									<div>
										<div className="font-semibold text-gray-900">
											Works Offline
										</div>
										<div className="text-xs text-gray-600">
											No internet? No problem.
										</div>
									</div>
								</div>
								<div className="flex items-center gap-3 p-3 rounded-xl bg-yellow-100/60 shadow">
									<Zap className="h-6 w-6 text-yellow-600" />
									<div>
										<div className="font-semibold text-gray-900">
											Rapid Triage
										</div>
										<div className="text-xs text-gray-600">
											Fast, intelligent decision support.
										</div>
									</div>
								</div>
								<div className="flex items-center gap-3 p-3 rounded-xl bg-blue-100/60 shadow">
									<Users className="h-6 w-6 text-blue-600" />
									<div>
										<div className="font-semibold text-gray-900">
											Device Friendly
										</div>
										<div className="text-xs text-gray-600">
											Mobile, tablet, desktop ready.
										</div>
									</div>
								</div>
								<div className="flex items-center gap-3 p-3 rounded-xl bg-red-100/60 shadow">
									<Play className="h-6 w-6 text-red-600" />
									<div>
										<div className="font-semibold text-gray-900">
											Push Notifications
										</div>
										<div className="text-xs text-gray-600">
											Stay updated in real time.
										</div>
									</div>
								</div>
							</div>

							{/* CTAs */}
							<div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mt-6">
								<Button className="bg-gradient-to-r from-red-600 to-green-600 text-white py-3 px-8 text-base font-medium shadow-lg hover:scale-105 hover:shadow-emerald-200 transition-all duration-200">
									Get Started
									<ArrowRight className="ml-2 h-4 w-4 animate-bounce-x" />
								</Button>
								<Button
									variant="outline"
									className="border-gray-700 text-gray-700 hover:bg-gray-700 hover:text-white py-3 px-8 text-base font-medium bg-transparent shadow hover:scale-105 transition-all duration-200"
								>
									<Play className="mr-2 h-4 w-4 animate-pulse" />
									Watch Demo
								</Button>
							</div>
						</div>

						{/* Right: Illustration or Logo */}
						<div className="flex-1 flex justify-center items-center mb-8 lg:mb-0">
							<div className="relative bg-white/90 rounded-2xl shadow-2xl p-6 border border-gray-200 flex flex-col items-center justify-center">
								<Image
									src="/dashboard.png"
									alt="Shifa Dashboard Preview"
									width={300}
									height={300}
									className="rounded-xl drop-shadow-xl mb-4 w-full h-auto max-w-sm"
								/>
								<div className="absolute -top-3 -right-3 bg-gradient-to-r from-red-500 to-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow">
									Live System
								</div>
								<div className="flex items-center gap-2 mt-2">
									<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
									<span className="text-xs font-medium text-black">Online</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Features Section - Mobile First */}
			<section className="px-4 py-16 bg-green-500/90 backdrop-blur-md">
				<div className="max-w-7xl mx-auto">
					<div className="text-center mb-10">
						<h3 className="text-2xl font-bold text-black mb-3 sm:text-3xl">
							Built for Medical Environments
						</h3>
						<p className="text-base text-gray-800 leading-relaxed sm:text-lg max-w-xl mx-auto">
							Essential features designed for healthcare efficiency and
							reliability.
						</p>
					</div>

					{/* Mobile: Single column, Tablet: 2 columns, Desktop: 3 columns */}
					<div className="space-y-6 sm:grid sm:grid-cols-2 sm:gap-6 sm:space-y-0 lg:grid-cols-3 max-w-4xl mx-auto">
						<Card className="bg-white/90 border border-gray-200 shadow-xl hover:shadow-emerald-200 transition-shadow duration-300">
							<CardContent className="p-6 text-center">
								<div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow">
									<Globe className="h-6 w-6 text-white" />
								</div>
								<h4 className="text-lg font-semibold mb-2 text-black">
									Works Offline
								</h4>
								<p className="text-sm text-gray-600 leading-relaxed">
									Continue working seamlessly even without internet connection.
									Your data stays accessible.
								</p>
							</CardContent>
						</Card>

						<Card className="bg-white/90 border border-gray-200 shadow-xl hover:shadow-emerald-200 transition-shadow duration-300">
							<CardContent className="p-6 text-center">
								<div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow">
									<Zap className="h-6 w-6 text-white" />
								</div>
								<h4 className="text-lg font-semibold mb-2 text-black">
									Faster & Lightweight
								</h4>
								<p className="text-sm text-gray-600 leading-relaxed">
									Optimized performance with minimal resource usage.
									Lightning-fast response times.
								</p>
							</CardContent>
						</Card>

						<Card className="bg-white/90 border border-gray-200 shadow-xl hover:shadow-emerald-200 transition-shadow duration-300">
							<CardContent className="p-6 text-center">
								<div className="w-12 h-12 bg-gradient-to-br from-red-500 to-green-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow">
									<Users className="h-6 w-6 text-white" />
								</div>
								<h4 className="text-lg font-semibold mb-2 text-black">
									Device Friendly
								</h4>
								<p className="text-sm text-gray-600 leading-relaxed">
									Works perfectly across all devices - desktop, tablet, and
									mobile. Responsive design.
								</p>
							</CardContent>
						</Card>
					</div>
				</div>
			</section>

			{/* Footer - Mobile First */}
			<footer className="bg-red-600 text-white py-8 mt-10 shadow-inner">
				<div className="px-4 max-w-7xl mx-auto">
					<div className="flex flex-col items-center gap-2">
						<div className="flex items-center gap-2">
							<Image
								src="/logo.jpeg"
								alt="Shifa Logo"
								width={24}
								height={24}
								className="w-6 h-6 rounded-lg object-contain"
							/>
							<h4 className="text-lg font-bold">Shifa</h4>
						</div>
						<span className="opacity-80 text-sm">
							Made with ❤️ for resilience and hope &mdash; Hack for Gaza
						</span>
					</div>
				</div>
			</footer>
		</div>
	);
}
