"use client";
import { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { Download, Share2 } from "lucide-react";
import type { TriageResult, PatientData } from "../interfaces";

interface QRCodeGeneratorProps {
	triageResult: TriageResult;
	patientData: PatientData;
	onClose: () => void;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
	triageResult,
	patientData,
	onClose,
}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const generateQRCode = async () => {
			if (!canvasRef.current) return;

			try {
				// Create a comprehensive data object for the QR code
				const qrData = {
					timestamp: new Date().toISOString(),
					triageResult: {
						priority: triageResult.priority,
						confidence: triageResult.confidence,
						actions: triageResult.actions,
						reassessTime: triageResult.reassessTime,
						matchedRules: triageResult.matchedRules.map((rule) => ({
							id: rule.id,
							name: rule.name,
							confidence: rule.confidence,
						})),
					},
					patientData: patientData,
					version: "1.0",
				};

				// Generate QR code with the data
				await QRCode.toCanvas(canvasRef.current, JSON.stringify(qrData), {
					width: 300,
					margin: 2,
					color: {
						dark: "#000000",
						light: "#FFFFFF",
					},
				});
			} catch (error) {
				console.error("Error generating QR code:", error);
			}
		};

		generateQRCode();
	}, [triageResult, patientData]);

	const downloadQRCode = async () => {
		if (!canvasRef.current) return;

		try {
			const canvas = canvasRef.current;
			const link = document.createElement("a");
			link.download = `triage-result-${triageResult.priority}-${Date.now()}.png`;
			link.href = canvas.toDataURL();
			link.click();
		} catch (error) {
			console.error("Error downloading QR code:", error);
		}
	};

	const shareQRCode = async () => {
		if (!canvasRef.current) return;

		try {
			const canvas = canvasRef.current;
			const blob = await new Promise<Blob>((resolve) => {
				canvas.toBlob((blob) => {
					if (blob) resolve(blob);
				}, "image/png");
			});

			if (navigator.share) {
				await navigator.share({
					title: "Triage Result",
					text: `Patient triage result: ${triageResult.priority} priority`,
					files: [new File([blob], "triage-result.png", { type: "image/png" })],
				});
			} else {
				// Fallback for browsers that don't support Web Share API
				const link = document.createElement("a");
				link.href = canvas.toDataURL();
				link.download = `triage-result-${triageResult.priority}-${Date.now()}.png`;
				link.click();
			}
		} catch (error) {
			console.error("Error sharing QR code:", error);
		}
	};

	const getPriorityColor = (priority: string): string => {
		switch (priority) {
			case "RED":
				return "text-red-600";
			case "YELLOW":
				return "text-yellow-600";
			case "GREEN":
				return "text-green-600";
			case "BLACK":
				return "text-gray-800";
			default:
				return "text-blue-600";
		}
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-lg p-6 max-w-md w-full">
				<div className="text-center mb-6">
					<h2 className="text-2xl font-bold text-gray-800 mb-2">
						Triage Result QR Code
					</h2>
					<p className="text-gray-600">
						Scan this QR code to view the complete triage assessment
					</p>
				</div>

				<div className="flex justify-center mb-6">
					<div className="bg-white p-4 rounded-lg border-2 border-gray-200">
						<canvas ref={canvasRef} className="block" />
					</div>
				</div>

				<div className="mb-6">
					<div
						className={`text-center text-lg font-semibold ${getPriorityColor(triageResult.priority)} mb-2`}
					>
						Priority: {triageResult.priority}
					</div>
					<div className="text-center text-sm text-gray-600">
						Confidence: {Math.round(triageResult.confidence * 100)}%
					</div>
				</div>

				<div className="flex space-x-3 mb-6">
					<button
						type="button"
						onClick={downloadQRCode}
						className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
					>
						<Download className="w-4 h-4 mr-2" />
						Download
					</button>
					<button
						type="button"
						onClick={shareQRCode}
						className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
					>
						<Share2 className="w-4 h-4 mr-2" />
						Share
					</button>
				</div>

				<div className="text-center">
					<button
						type="button"
						onClick={onClose}
						className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
					>
						Close
					</button>
				</div>
			</div>
		</div>
	);
};

export default QRCodeGenerator;
