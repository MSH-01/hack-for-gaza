"use client";
import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";
import {
	ArrowLeft,
	AlertTriangle,
	Heart,
	Users,
	Clock,
	CheckCircle,
	Upload,
	Camera,
} from "lucide-react";
import type { PatientData } from "../interfaces";

interface QRCodeReaderProps {
	onBack: () => void;
}

interface ScannedData {
	timestamp: string;
	triageResult: {
		priority: "RED" | "YELLOW" | "GREEN" | "BLACK";
		confidence: number;
		actions: string[];
		reassessTime?: number;
		matchedRules: Array<{
			id: string;
			name: string;
			confidence: number;
		}>;
	};
	patientData: PatientData;
	version: string;
}

const QRCodeReader: React.FC<QRCodeReaderProps> = ({ onBack }) => {
	const scannerRef = useRef<Html5QrcodeScanner | null>(null);
	const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [scannedData, setScannedData] = useState<ScannedData | null>(null);
	const [isScanning, setIsScanning] = useState(true);
	const [scanMode, setScanMode] = useState<"camera" | "image">("camera");
	const [error, setError] = useState<string | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);

	useEffect(() => {
		if (!isScanning || scanMode !== "camera") return;

		scannerRef.current = new Html5QrcodeScanner(
			"qr-reader",
			{
				qrbox: {
					width: 250,
					height: 250,
				},
				fps: 10,
			},
			false,
		);

		scannerRef.current.render(
			(decodedText) => {
				try {
					const data: ScannedData = JSON.parse(decodedText);
					setScannedData(data);
					setIsScanning(false);
					if (scannerRef.current) {
						scannerRef.current.clear();
					}
				} catch (parseError) {
					setError("Invalid QR code format");
					console.error("Error parsing QR code data:", parseError);
				}
			},
			(error) => {
				console.error("QR Code scanning error:", error);
			},
		);

		return () => {
			if (scannerRef.current) {
				scannerRef.current.clear();
			}
		};
	}, [isScanning, scanMode]);

	const getPriorityIcon = (priority: string) => {
		switch (priority) {
			case "RED":
				return <AlertTriangle className="w-6 h-6" />;
			case "YELLOW":
				return <Clock className="w-6 h-6" />;
			case "GREEN":
				return <Heart className="w-6 h-6" />;
			case "BLACK":
				return <Users className="w-6 h-6" />;
			default:
				return <CheckCircle className="w-6 h-6" />;
		}
	};

	const getPriorityColor = (priority: string): string => {
		switch (priority) {
			case "RED":
				return "bg-red-500 text-white";
			case "YELLOW":
				return "bg-yellow-500 text-white";
			case "GREEN":
				return "bg-green-500 text-white";
			case "BLACK":
				return "bg-gray-800 text-white";
			default:
				return "bg-blue-500 text-white";
		}
	};

	const formatTimestamp = (timestamp: string) => {
		return new Date(timestamp).toLocaleString();
	};

	const handleImageUpload = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		if (!file) return;

		setIsProcessing(true);
		setError(null);

		try {
			// Initialize Html5Qrcode for image processing
			if (!html5QrCodeRef.current) {
				html5QrCodeRef.current = new Html5Qrcode("qr-reader");
			}

			// Decode QR code from image file
			if (html5QrCodeRef.current) {
				const decodedText = await html5QrCodeRef.current.scanFile(file, true);

				// Parse the decoded data
				const data: ScannedData = JSON.parse(decodedText);
				setScannedData(data);
				setIsScanning(false);
			}
		} catch (parseError) {
			setError("No QR code found in the image or invalid format");
			console.error("Error processing image:", parseError);
		} finally {
			setIsProcessing(false);
		}
	};

	const handleModeSwitch = (mode: "camera" | "image") => {
		setScanMode(mode);
		setError(null);
		setIsScanning(true);

		// Clear existing scanner
		if (scannerRef.current) {
			scannerRef.current.clear();
		}
		if (html5QrCodeRef.current) {
			html5QrCodeRef.current.clear();
		}
	};

	if (scannedData) {
		return (
			<div className="w-full min-h-screen bg-white p-6">
				<div className="max-w-4xl mx-auto">
					<div className="flex items-center mb-6">
						<button
							type="button"
							onClick={onBack}
							className="flex items-center text-blue-600 hover:text-blue-700 mr-4"
						>
							<ArrowLeft className="w-5 h-5 mr-2" />
							Back to Scanner
						</button>
					</div>

					<div className="text-center mb-8">
						<div
							className={`inline-flex items-center px-6 py-3 rounded-full text-2xl font-bold mb-4 ${getPriorityColor(scannedData.triageResult.priority)}`}
						>
							{getPriorityIcon(scannedData.triageResult.priority)}
							<span className="ml-2">
								{scannedData.triageResult.priority} -{" "}
								{scannedData.triageResult.priority === "RED"
									? "IMMEDIATE"
									: scannedData.triageResult.priority === "YELLOW"
										? "URGENT"
										: scannedData.triageResult.priority === "GREEN"
											? "MINOR"
											: "DECEASED"}
							</span>
						</div>

						<div className="mb-6">
							<div className="text-lg text-gray-600 mb-2">
								Confidence Level:{" "}
								{Math.round(scannedData.triageResult.confidence * 100)}%
							</div>
							{scannedData.triageResult.reassessTime && (
								<div className="text-sm text-orange-600 font-medium">
									⚠️ Reassess in {scannedData.triageResult.reassessTime} minutes
								</div>
							)}
							<div className="text-sm text-gray-500 mt-2">
								Scanned at: {formatTimestamp(scannedData.timestamp)}
							</div>
						</div>
					</div>

					<div className="bg-gray-50 rounded-lg p-6 mb-6">
						<h3 className="text-xl font-semibold text-gray-800 mb-4">
							Immediate Actions Required:
						</h3>
						<ul className="space-y-3">
							{scannedData.triageResult.actions.map((action, index) => (
								<li key={`action-${action}`} className="flex items-start">
									<span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">
										{index + 1}
									</span>
									<span className="text-gray-700">{action}</span>
								</li>
							))}
						</ul>
					</div>

					{scannedData.triageResult.matchedRules.length > 0 && (
						<div className="bg-blue-50 rounded-lg p-6 mb-6">
							<h3 className="text-lg font-semibold text-blue-800 mb-3">
								Medical Reasoning:
							</h3>
							<div className="space-y-2">
								{scannedData.triageResult.matchedRules.map((rule) => (
									<div key={rule.id} className="text-sm">
										<span className="font-medium text-blue-700">
											{rule.name}
										</span>
										<span className="text-blue-600 ml-2">
											({Math.round(rule.confidence * 100)}% confidence)
										</span>
									</div>
								))}
							</div>
						</div>
					)}

					<div className="bg-white border border-gray-200 rounded-lg p-6">
						<h3 className="text-lg font-semibold text-gray-800 mb-3">
							Assessment Summary:
						</h3>
						<div className="grid md:grid-cols-2 gap-4 text-sm">
							{Object.entries(scannedData.patientData).map(([key, value]) => (
								<div key={key} className="flex justify-between">
									<span className="font-medium capitalize text-gray-600">
										{key}:
									</span>
									<span className="text-gray-800">
										{value?.toString() || "Not assessed"}
									</span>
								</div>
							))}
						</div>
					</div>

					<div className="text-center mt-8">
						<button
							type="button"
							onClick={() => {
								setScannedData(null);
								setIsScanning(true);
								setError(null);
							}}
							className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
						>
							Scan Another QR Code
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full min-h-screen bg-white p-6">
			<div className="max-w-2xl mx-auto">
				<div className="flex items-center mb-6">
					<button
						type="button"
						onClick={onBack}
						className="flex items-center text-blue-600 hover:text-blue-700 mr-4"
					>
						<ArrowLeft className="w-5 h-5 mr-2" />
						Back to Triage
					</button>
				</div>

				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-gray-800 mb-4">
						QR Code Scanner
					</h1>
					<p className="text-gray-600 mb-6">
						Scan QR codes using your camera or upload an image
					</p>

					{/* Mode switching buttons */}
					<div className="flex justify-center space-x-4 mb-6">
						<button
							type="button"
							onClick={() => handleModeSwitch("camera")}
							className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
								scanMode === "camera"
									? "bg-blue-600 text-white"
									: "bg-gray-200 text-gray-700 hover:bg-gray-300"
							}`}
						>
							<Camera className="w-4 h-4 mr-2" />
							Camera
						</button>
						<button
							type="button"
							onClick={() => handleModeSwitch("image")}
							className={`px-4 py-2 rounded-lg transition-colors flex items-center ${
								scanMode === "image"
									? "bg-blue-600 text-white"
									: "bg-gray-200 text-gray-700 hover:bg-gray-300"
							}`}
						>
							<Upload className="w-4 h-4 mr-2" />
							Upload Image
						</button>
					</div>
				</div>

				{error && (
					<div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
						<div className="flex items-center">
							<AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
							<span className="text-red-700">{error}</span>
						</div>
						<button
							type="button"
							onClick={() => setError(null)}
							className="mt-2 text-sm text-red-600 hover:text-red-700"
						>
							Dismiss
						</button>
					</div>
				)}

				<div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg">
					{scanMode === "camera" ? (
						<div>
							<div id="qr-reader" className="w-full" />
							<div className="mt-6 text-center text-sm text-gray-500">
								<p>Make sure the QR code is clearly visible and well-lit</p>
								<p>Hold your device steady for best results</p>
							</div>
						</div>
					) : (
						<div className="text-center">
							<div className="mb-6">
								<Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
								<h3 className="text-lg font-semibold text-gray-800 mb-2">
									Upload QR Code Image
								</h3>
								<p className="text-gray-600 mb-4">
									Select an image file containing a QR code
								</p>
							</div>

							<input
								ref={fileInputRef}
								type="file"
								accept="image/*"
								onChange={handleImageUpload}
								className="hidden"
							/>

							<button
								type="button"
								onClick={() => fileInputRef.current?.click()}
								disabled={isProcessing}
								className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
							>
								{isProcessing ? "Processing..." : "Choose Image"}
							</button>

							<div className="mt-4 text-sm text-gray-500">
								<p>Supported formats: JPG, PNG, GIF, WebP</p>
								<p>Maximum file size: 10MB</p>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default QRCodeReader;
