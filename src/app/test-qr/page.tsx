"use client";
import { useState } from "react";
import Link from "next/link";
import QRCodeGenerator from "../../components/QRCodeGenerator";
import QRCodeReader from "../../components/QRCodeReader";
import { ArrowLeft } from "lucide-react";

export default function TestQRPage() {
	const [showGenerator, setShowGenerator] = useState(false);
	const [showReader, setShowReader] = useState(false);

	// Sample triage result for testing
	const sampleTriageResult = {
		priority: "RED" as const,
		matchedRules: [
			{
				id: "cardiac_arrest",
				name: "Cardiac Arrest",
				condition: () => true,
				priority: "RED" as const,
				confidence: 0.98,
				actions: ["Initiate CPR immediately", "Apply AED if available"],
				reassess_time: 1,
			},
		],
		confidence: 0.98,
		actions: ["Initiate CPR immediately", "Apply AED if available"],
		reassessTime: 1,
	};

	const samplePatientData = {
		consciousness: "unresponsive" as const,
		breathing: "absent" as const,
		circulation: "absent" as const,
		age: 45,
		gender: "male" as const,
		chief_complaint: "Chest pain",
	};

	return (
		<div className="w-full min-h-screen bg-white p-6">
			<div className="max-w-4xl mx-auto">
				<div className="flex items-center mb-8">
					<Link
						href="/"
						className="flex items-center text-blue-600 hover:text-blue-700 mr-4"
					>
						<ArrowLeft className="w-5 h-5 mr-2" />
						Back to Triage
					</Link>
				</div>

				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-gray-800 mb-4">
						QR Code Functionality Test
					</h1>
					<p className="text-gray-600">
						Test the QR code generation and scanning features
					</p>
				</div>

				<div className="grid md:grid-cols-2 gap-8">
					<div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
						<h2 className="text-xl font-semibold text-blue-800 mb-4">
							QR Code Generator
						</h2>
						<p className="text-blue-700 mb-4">
							Generate a QR code containing triage result data that can be
							shared or saved for later reference.
						</p>
						<button
							type="button"
							onClick={() => setShowGenerator(true)}
							className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
						>
							Test QR Code Generation
						</button>
					</div>

					<div className="bg-green-50 border border-green-200 rounded-lg p-6">
						<h2 className="text-xl font-semibold text-green-800 mb-4">
							QR Code Reader
						</h2>
						<p className="text-green-700 mb-4">
							Scan a QR code to view triage results and patient assessment data.
						</p>
						<button
							type="button"
							onClick={() => setShowReader(true)}
							className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
						>
							Test QR Code Scanning
						</button>
					</div>
				</div>

				<div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
					<h3 className="text-lg font-semibold text-gray-800 mb-4">
						Sample Data Used for Testing
					</h3>
					<div className="grid md:grid-cols-2 gap-4 text-sm">
						<div>
							<h4 className="font-medium text-gray-700 mb-2">Triage Result:</h4>
							<pre className="bg-white p-3 rounded border text-xs overflow-auto">
								{JSON.stringify(sampleTriageResult, null, 2)}
							</pre>
						</div>
						<div>
							<h4 className="font-medium text-gray-700 mb-2">Patient Data:</h4>
							<pre className="bg-white p-3 rounded border text-xs overflow-auto">
								{JSON.stringify(samplePatientData, null, 2)}
							</pre>
						</div>
					</div>
				</div>
			</div>

			{/* QR Code Generator Modal */}
			{showGenerator && (
				<QRCodeGenerator
					triageResult={sampleTriageResult}
					patientData={samplePatientData}
					onClose={() => setShowGenerator(false)}
				/>
			)}

			{/* QR Code Reader */}
			{showReader && <QRCodeReader onBack={() => setShowReader(false)} />}
		</div>
	);
}
