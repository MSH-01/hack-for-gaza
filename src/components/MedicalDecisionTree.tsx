"use client";
import type React from "react";
import { useState, useEffect } from "react";
import {
	ChevronRight,
	AlertTriangle,
	Heart,
	Users,
	Clock,
	CheckCircle,
	QrCode,
	Camera,
} from "lucide-react";
import * as yaml from "js-yaml"; // Import the YAML parser
import { downloadPDF, sharePDFViaWhatsApp } from "@/app/managePdf";
// Import all your interfaces from interfaces.ts
import type {
	PatientData,
	TriageRule,
	AssessmentStep,
	TriageResult,
	TriageConfig,
} from "../interfaces";
import QRCodeGenerator from "./QRCodeGenerator";
import QRCodeReader from "./QRCodeReader";

// TriageEngine Class (updated to load from YAML)
class TriageEngine {
	private rules: TriageRule[] = [];
	private assessmentFlow: AssessmentStep[] = [];
	private criticalRulesMap: Set<string> = new Set();

	// Constructor now accepts the YAML content as a string
	constructor(yamlContent: string) {
		this.loadConfig(yamlContent);
	}

	private loadConfig(yamlContent: string): void {
		try {
			const config = yaml.load(yamlContent) as TriageConfig;

			this.rules = config.triageRules.map((rule) => {
				// Safely create a function from the condition string using new Function()
				// The 'patient' parameter will be the PatientData object at runtime
				const conditionFn = new Function(
					"patient",
					`return ${rule.condition};`,
				) as (patient: PatientData) => boolean;

				// Populate the criticalRulesMap based on the 'isCritical' flag from YAML
				if (rule.isCritical) {
					this.criticalRulesMap.add(rule.id);
				}

				return {
					...rule,
					condition: conditionFn, // Assign the created function
				};
			});

			this.assessmentFlow = config.assessmentFlow.map((step) => {
				let skipIfFn: ((patient: Partial<PatientData>) => boolean) | undefined;
				if (step.skip_if) {
					// Safely create a function for skip_if as well
					skipIfFn = new Function("patient", `return ${step.skip_if};`) as (
						patient: Partial<PatientData>,
					) => boolean;
				}
				return {
					...step,
					skip_if: skipIfFn, // Assign the created function or undefined
				};
			});
		} catch (e) {
			console.error("Error loading triage config:", e);
			// Re-throw the error so the React component can catch and display it
			throw new Error(
				"Failed to load triage rules. Please check the YAML syntax.",
			);
		}
	}

	evaluatePatient(patientData: PatientData): TriageResult {
		const matchedRules = this.rules
			.filter((rule) => {
				try {
					// Execute the dynamically created condition function
					return rule.condition(patientData);
				} catch (e) {
					console.error(`Error evaluating condition for rule ${rule.id}:`, e);
					return false; // If condition evaluation fails, don't match
				}
			})
			.sort(
				(a, b) =>
					this.getPriorityWeight(a.priority) -
					this.getPriorityWeight(b.priority),
			);

		if (matchedRules.length === 0) {
			return {
				priority: "GREEN",
				matchedRules: [],
				confidence: 0.5,
				actions: ["Standard assessment", "Basic care as needed"],
			};
		}

		const primaryRule = matchedRules[0];
		// Use a Set to ensure unique actions
		const allActions = [...new Set(matchedRules.flatMap((r) => r.actions))];
		const avgConfidence =
			matchedRules.reduce((sum, r) => sum + r.confidence, 0) /
			matchedRules.length;

		return {
			priority: primaryRule.priority,
			matchedRules,
			confidence: avgConfidence,
			actions: allActions,
			reassessTime: primaryRule.reassess_time,
		};
	}

	private getPriorityWeight(priority: string): number {
		const weights = { BLACK: 0, RED: 1, YELLOW: 2, GREEN: 3 };
		return weights[priority as keyof typeof weights] || 4;
	}

	getNextStep(patientData: Partial<PatientData>): AssessmentStep | null {
		return (
			this.assessmentFlow.find((step) => {
				// If a skip_if function exists, execute it
				if (step.skip_if?.(patientData)) return false;
				// Otherwise, check if the step is required and its field is undefined
				return step.required && patientData[step.field] === undefined;
			}) || null
		);
	}

	getStepIndex(stepId: string): number {
		return this.assessmentFlow.findIndex((s) => s.id === stepId);
	}

	getTotalSteps(): number {
		return this.assessmentFlow.length;
	}

	hasCriticalCondition(patientData: Partial<PatientData>): boolean {
		// Iterate through all rules, but only check the condition if the rule is marked as critical
		return this.rules.some((rule) => {
			if (this.criticalRulesMap.has(rule.id)) {
				try {
					return rule.condition(patientData as PatientData);
				} catch (e) {
					console.error(
						`Error evaluating critical condition for rule ${rule.id}:`,
						e,
					);
					return false;
				}
			}
			return false;
		});
	}
}

// SmartTriageApp React Component
const SmartTriageApp: React.FC = () => {
	// State to hold the TriageEngine instance, initially null
	const [engine, setEngine] = useState<TriageEngine | null>(null);
	const [patientData, setPatientData] = useState<PatientData>({});
	const [currentStep, setCurrentStep] = useState<AssessmentStep | null>(null);
	const [triageResult, setTriageResult] = useState<TriageResult | null>(null);
	const [isComplete, setIsComplete] = useState(false);
	const [assessmentStarted, setAssessmentStarted] = useState(false);
	const [role, setRole] = useState<string | null>(null);
	// New state for loading and errors
	const [isLoadingRules, setIsLoadingRules] = useState(true);
	const [errorLoadingRules, setErrorLoadingRules] = useState<string | null>(
		null,
	);
	const [showQRGenerator, setShowQRGenerator] = useState(false);
	const [showQRReader, setShowQRReader] = useState(false);

	// Effect to load rules when the component mounts
	useEffect(() => {
		const loadRules = async () => {
			try {
				// Fetch the YAML file from the public directory
				const response = await fetch("/rules.yaml");
				if (!response.ok) {
					throw new Error(`HTTP error! Status: ${response.status}`);
				}
				const yamlContent = await response.text();
				// Initialize the TriageEngine with the fetched YAML content
				const newEngine = new TriageEngine(yamlContent);
				setEngine(newEngine);
			} catch (error: unknown) {
				console.error("Failed to load triage rules:", error);
				setErrorLoadingRules(
					`Failed to load triage rules: ${(error as Error).message}`,
				);
			} finally {
				setIsLoadingRules(false); // Set loading to false regardless of success or failure
			}
		};

		loadRules(); // Execute the loading function
	}, []); // Empty dependency array means this effect runs only once on mount

	// Effect to manage assessment flow based on patient data and engine availability
	useEffect(() => {
		// Only run if assessment has started and the engine is loaded
		if (assessmentStarted && engine) {
			const nextStep = engine.getNextStep(patientData);
			setCurrentStep(nextStep);

			if (!nextStep) {
				// If no more steps, evaluate the final result
				const result = engine.evaluatePatient(patientData);
				setTriageResult(result);
				setIsComplete(true);
			}
		}
	}, [patientData, assessmentStarted, engine]); // Depend on patientData, assessmentStarted, and engine

	const handleAnswer = (field: keyof PatientData, value: unknown): void => {
		// Ensure engine is loaded before handling answers
		if (!engine) return;

		const updatedData = { ...patientData, [field]: value };
		setPatientData(updatedData);

		// Check for critical conditions immediately after each answer
		if (engine.hasCriticalCondition(updatedData)) {
			const result = engine.evaluatePatient(updatedData);
			setTriageResult(result);
			setIsComplete(true);
		}
	};

	const startAssessment = (): void => {
		// Ensure engine is loaded before starting
		if (!engine) return;

		setAssessmentStarted(true);
		setPatientData({}); // Clear previous patient data
		setTriageResult(null); // Clear previous result
		setIsComplete(false); // Reset completion status
	};

	const restart = (): void => {
		setAssessmentStarted(false);
		setPatientData({});
		setTriageResult(null);
		setIsComplete(false);
		setCurrentStep(null);
	};

	// Helper functions for displaying priority icons and colors
	const getPriorityIcon = (priority: string): React.JSX.Element => {
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

	// Helper function to convert human-readable colors to CSS classes
	const getColorClasses = (color: string): string => {
		switch (color) {
			case "green":
				return "bg-green-100 border-green-300 hover:bg-green-200";
			case "yellow":
				return "bg-yellow-100 border-yellow-300 hover:bg-yellow-200";
			case "orange":
				return "bg-orange-100 border-orange-300 hover:bg-orange-200";
			case "red":
				return "bg-red-100 border-red-300 hover:bg-red-200";
			case "gray":
				return "bg-gray-100 border-gray-300 hover:bg-gray-200";
			case "blue":
				return "bg-blue-100 border-blue-300 hover:bg-blue-200";
			default:
				// Handle legacy CSS color strings for backward compatibility
				if (color.includes("bg-")) {
					return color;
				}
				return "bg-gray-100 border-gray-300 hover:bg-gray-200";
		}
	};

	// --- Render Logic based on loading/error/assessment state ---

	// 1. Show loading state while rules are being fetched
	if (isLoadingRules) {
		return (
			<div className="w-full h-screen text-center text-xl flex items-center justify-center">
				<Clock className="w-8 h-8 animate-spin mr-3 text-blue-600" />
				Loading triage rules...
			</div>
		);
	}

	// 2. Show error state if rules failed to load
	if (errorLoadingRules) {
		return (
			<div className="w-full h-screen text-center text-xl text-red-600 flex flex-col items-center justify-center">
				<AlertTriangle className="w-12 h-12 mb-4" />
				<p className="mb-4">Error: {errorLoadingRules}</p>
				<button
					type="button"
					onClick={() => window.location.reload()} // Simple retry by reloading
					className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
				>
					Retry Loading
				</button>
			</div>
		);
	}

	// 3. Show initial welcome screen if assessment hasn't started
	if (!assessmentStarted) {
		// Show QR Code Reader if requested
		if (showQRReader) {
			return <QRCodeReader onBack={() => setShowQRReader(false)} />;
		}

		return (
			<div className="w-full h-screen bg-white flex items-center justify-center">
				<div className="text-center max-w-4xl px-6">
					<h1 className="text-4xl font-bold text-gray-800 mb-4">
						Smart Medical Triage System
					</h1>
					<p className="text-xl text-gray-600 mb-8">
						AI-powered decision support for rapid patient assessment
					</p>

					<div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
						<h2 className="text-lg font-semibold text-blue-800 mb-4">
							System Features:
						</h2>
						<div className="grid md:grid-cols-2 gap-4 text-sm text-blue-700">
							<div className="flex items-center">
								<CheckCircle className="w-4 h-4 mr-2" />
								Rule-based decision engine
							</div>
							<div className="flex items-center">
								<CheckCircle className="w-4 h-4 mr-2" />
								Immediate critical condition detection
							</div>
							<div className="flex items-center">
								<CheckCircle className="w-4 h-4 mr-2" />
								Confidence scoring for decisions
							</div>
							<div className="flex items-center">
								<CheckCircle className="w-4 h-4 mr-2" />
								Specific action recommendations
							</div>
							<div className="flex items-center">
								<CheckCircle className="w-4 h-4 mr-2" />
								**Rules easily modifiable in YAML**
							</div>
							<div className="flex items-center">
								<CheckCircle className="w-4 h-4 mr-2" />
								Dynamic assessment flow
							</div>
						</div>
					</div>

					<div className="mb-8">
						<div className="bg-gray-100 border border-gray-200 rounded-lg p-4 mb-4">
							<fieldset>
								<legend className="block text-md font-semibold text-gray-700 mb-2">
									What is your role?
								</legend>
								<div className="flex justify-center space-x-6">
									<label className="inline-flex items-center text-gray-600">
										<input
											type="radio"
											name="patient"
											value="A"
											className="form-radio text-blue-600"
											onChange={(e) =>
												setRole(e.target.value.toLocaleLowerCase())
											}
										/>
										<span className="ml-2">Doctor</span>
									</label>
									<label className="inline-flex items-center text-gray-600">
										<input
											type="radio"
											name="patient"
											value="B"
											className="form-radio text-blue-600"
											onChange={(e) =>
												setRole(e.target.value.toLocaleLowerCase())
											}
										/>
										<span className="ml-2">Volunteer</span>
									</label>
									<label className="inline-flex items-center text-gray-600">
										<input
											type="radio"
											name="patient"
											value="C"
											className="form-radio text-blue-600"
											onChange={(e) =>
												setRole(e.target.value.toLocaleLowerCase())
											}
										/>
										<span className="ml-2">Patient</span>
									</label>
								</div>
							</fieldset>
						</div>
					</div>

					<div className="flex flex-col sm:flex-row gap-4 justify-center">
						<button
							type="button"
							onClick={startAssessment}
							className={`px-8 py-4 text-white text-lg font-semibold rounded-lg transition-colors ${
								role === null
									? "bg-gray-400 cursor-not-allowed"
									: "bg-blue-600 hover:bg-blue-700"
							}`}
							disabled={role === null}
						>
							Start Patient Assessment
						</button>
						<button
							type="button"
							onClick={() => setShowQRReader(true)}
							className="px-8 py-4 bg-green-600 text-white text-lg font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
						>
							<Camera className="w-5 h-5 mr-2" />
							Scan QR Code
						</button>
					</div>
				</div>
			</div>
		);
	}

	// 4. Show triage result if assessment is complete
	if (isComplete && triageResult) {
		// Show QR Code Generator Modal if requested
		if (showQRGenerator) {
			return (
				<QRCodeGenerator
					triageResult={triageResult}
					patientData={patientData}
					onClose={() => setShowQRGenerator(false)}
				/>
			);
		}

		return (
			<div className="w-full min-h-screen bg-white p-6">
				<div className="max-w-4xl mx-auto">
					<div className="text-center mb-8">
						<div
							className={`inline-flex items-center px-6 py-3 rounded-full text-2xl font-bold mb-4 ${getPriorityColor(triageResult.priority)}`}
						>
							{getPriorityIcon(triageResult.priority)}
							<span className="ml-2">
								{triageResult.priority} -{" "}
								{triageResult.priority === "RED"
									? "IMMEDIATE"
									: triageResult.priority === "YELLOW"
										? "URGENT"
										: triageResult.priority === "GREEN"
											? "MINOR"
											: "DECEASED"}
							</span>
						</div>

						<div className="mb-6">
							<div className="text-lg text-gray-600 mb-2">
								Confidence Level: {Math.round(triageResult.confidence * 100)}%
							</div>
							{triageResult.reassessTime && (
								<div className="text-sm text-orange-600 font-medium">
									⚠️ Reassess in {triageResult.reassessTime} minutes
								</div>
							)}
						</div>
					</div>

					<div className="bg-gray-50 rounded-lg p-6 mb-6">
						<h3 className="text-xl font-semibold text-gray-800 mb-4">
							Immediate Actions Required:
						</h3>
						<ul className="space-y-3">
							{triageResult.actions.map((action, index) => (
								<li key={`action-${action}`} className="flex items-start">
									<span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">
										{index + 1}
									</span>
									<span className="text-gray-700">{action}</span>
								</li>
							))}
						</ul>
					</div>

					{triageResult.matchedRules.length > 0 && (
						<div className="bg-blue-50 rounded-lg p-6 mb-6">
							<h3 className="text-lg font-semibold text-blue-800 mb-3">
								Medical Reasoning:
							</h3>
							<div className="space-y-2">
								{triageResult.matchedRules.map((rule) => (
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
							{Object.entries(patientData).map(([key, value]) => (
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

					<div className="text-center mt-8 flex gap-4 justify-center items-center">
						<button
							type="button"
							onClick={restart}
							className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
						>
							Start New Assessment
						</button>
							<button
								type="button"
								onClick={() => setShowQRGenerator(true)}
								className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
							>
								<QrCode className="w-5 h-5 mr-2" />
								Generate QR Code
							</button>						
						<button
							type="button"
							onClick={async () => await downloadPDF(triageResult as TriageResult)}
							className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
						>
							Download PDF
						</button>
						<button
							type="button"
							onClick={async () => await sharePDFViaWhatsApp(triageResult as TriageResult)}
							className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
						>
							Share via WhatsApp
						</button>
					</div>
				</div>
			</div>
		);
	}

	// 5. Show current assessment step
	// If currentStep is null here, it means the assessment flow might be exhausted
	// or an unexpected state. A defensive check is good.
	if (!currentStep) {
		return (
			<div className="w-full h-screen text-center text-xl flex items-center justify-center">
				<AlertTriangle className="w-8 h-8 mr-2 text-yellow-600" />
				No assessment steps found or an issue occurred. Please restart.
				<button
					type="button"
					onClick={restart}
					className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
				>
					Restart
				</button>
			</div>
		);
	}

	return (
		<div className="w-full min-h-screen bg-white p-6">
			<div className="max-w-4xl mx-auto">
				<div className="mb-6">
					<div className="flex items-center justify-between mb-4">
						<h1 className="text-2xl font-bold text-gray-800">
							Patient Assessment
						</h1>
						<div className="text-sm text-gray-500">
							Step {engine ? engine.getStepIndex(currentStep.id) + 1 : 0} of{" "}
							{engine?.getTotalSteps() || 0}
						</div>
					</div>

					{/* Progress bar */}
					<div className="w-full bg-gray-200 rounded-full h-2">
						<div
							className="bg-blue-600 h-2 rounded-full transition-all duration-300"
							style={{
								width: `${
									engine
										? (
												(engine.getStepIndex(currentStep.id) + 1) /
													engine.getTotalSteps()
											) * 100
										: 0
								}%`,
							}}
						/>
					</div>
				</div>

				<div className="bg-white border-2 border-gray-200 rounded-xl p-8 shadow-lg">
					<h2 className="text-xl font-semibold text-gray-800 mb-6">
						{currentStep.question}
					</h2>

					{currentStep.type === "single" && currentStep.options && (
						<div className="space-y-3">
							{currentStep.options.map((option) => (
								<button
									type="button"
									key={`option-${option.value as string}`}
									onClick={() => handleAnswer(currentStep.field, option.value)}
									className={`w-full p-4 text-left rounded-lg border-2 hover:shadow-md transition-all duration-200 ${getColorClasses(option.color)} ${option.critical ? "ring-2 ring-red-300" : ""}`}
								>
									<div className="flex items-center justify-between">
										<div className="flex-1">
											<span className="text-lg font-bold text-gray-700">
												{option.label}
											</span>
											{option.description && (
												<p className="text-sm text-gray-600 mt-1">
													{option.description}
												</p>
											)}
										</div>
										<div className="flex items-center">
											{option.critical && (
												<AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
											)}
											<ChevronRight className="w-5 h-5 text-gray-400" />
										</div>
									</div>
								</button>
							))}
						</div>
					)}

					{currentStep.type === "scale" && (
						<div className="space-y-4">
							<div className="flex justify-between text-sm text-gray-500">
								<span>No pain (1)</span>
								<span>Worst possible (10)</span>
							</div>
							<div className="grid grid-cols-10 gap-2">
								{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
									<button
										type="button"
										key={num}
										onClick={() => handleAnswer(currentStep.field, num)}
										className={`h-12 rounded-lg font-semibold text-white transition-all duration-200 hover:scale-105 ${
											num <= 3
												? "bg-green-500 hover:bg-green-600"
												: num <= 6
													? "bg-yellow-500 hover:bg-yellow-600"
													: "bg-red-500 hover:bg-red-600"
										}`}
									>
										{num}
									</button>
								))}
							</div>
						</div>
					)}

					{currentStep.type === "multi" && currentStep.options && (
						<div className="space-y-3">
							{currentStep.help_text && (
								<p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
									💡 {currentStep.help_text}
								</p>
							)}
							<div className="space-y-2">
								{currentStep.options.map((option) => (
									<label
										key={`multi-${option.value as string}`}
										className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${getColorClasses(option.color)}`}
									>
										<input
											type="checkbox"
											className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
											onChange={(e) => {
												const currentValues =
													(patientData[currentStep.field] as string[]) || [];
												if (e.target.checked) {
													handleAnswer(currentStep.field, [
														...currentValues,
														option.value,
													]);
												} else {
													handleAnswer(
														currentStep.field,
														currentValues.filter((v) => v !== option.value),
													);
												}
											}}
										/>
										<div className="flex-1">
											<span className="text-lg font-bold text-gray-700">
												{option.label}
											</span>
											{option.description && (
												<p className="text-sm text-gray-600 mt-1">
													{option.description}
												</p>
											)}
										</div>
									</label>
								))}
							</div>
							<button
								type="button"
								onClick={() => {
									const currentValues =
										(patientData[currentStep.field] as string[]) || [];
									if (currentValues.length > 0) {
										// Move to next step
										const nextStep = engine?.getNextStep(patientData);
										if (nextStep) {
											setCurrentStep(nextStep);
										}
									}
								}}
								className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
							>
								Continue
							</button>
						</div>
					)}

					{currentStep.description && (
						<div className="mt-4 p-3 bg-gray-50 rounded-lg">
							<p className="text-sm text-gray-600">{currentStep.description}</p>
						</div>
					)}

					<div className="mt-8 pt-6 border-t border-gray-200">
						<button
							type="button"
							onClick={restart}
							className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
						>
							Start Over
						</button>
					</div>
				</div>

				{/* Current assessment data */}
				{Object.keys(patientData).length > 0 && (
					<div className="mt-6 bg-gray-50 rounded-lg p-4">
						<h3 className="text-sm font-semibold text-gray-600 mb-2">
							Current Assessment:
						</h3>
						<div className="flex flex-wrap gap-2">
							{Object.entries(patientData).map(([key, value]) => (
								<span
									key={key}
									className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
								>
									{key}: {value?.toString()}
								</span>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default SmartTriageApp;
