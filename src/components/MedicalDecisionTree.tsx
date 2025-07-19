"use client";
import type React from "react";
import { useState } from "react";
import {
	ChevronRight,
	ChevronLeft,
	AlertTriangle,
	Heart,
	Users,
	Clock,
} from "lucide-react";

interface Answer {
	text: string;
	next: string;
	color: string;
}

interface Node {
	question: string;
	type: "question" | "result";
	answers?: Answer[];
	priority?: string;
	color?: string;
	actions?: string[];
}

interface PathStep {
	node: string;
	answer: string;
}

const TriageDecisionTree: React.FC = () => {
	const [currentNode, setCurrentNode] = useState<string>("start");
	const [path, setPath] = useState<PathStep[]>([]);
	const [patientInfo, setPatientInfo] = useState<Record<string, unknown>>({});

	const nodes: Record<string, Node> = {
		start: {
			question: "Patient Assessment - Can you hear me? Are you responsive?",
			type: "question",
			answers: [
				{
					text: "Yes, responsive and alert",
					next: "breathing_check",
					color: "bg-green-100",
				},
				{
					text: "Responds to voice/touch but confused",
					next: "altered_consciousness",
					color: "bg-yellow-100",
				},
				{
					text: "No response/unconscious",
					next: "unconscious_check",
					color: "bg-red-100",
				},
			],
		},

		breathing_check: {
			question: "Are you having any trouble breathing right now?",
			type: "question",
			answers: [
				{
					text: "Normal breathing, no distress",
					next: "circulation_check",
					color: "bg-green-100",
				},
				{
					text: "Some difficulty, but talking in full sentences",
					next: "moderate_breathing",
					color: "bg-yellow-100",
				},
				{
					text: "Severe difficulty, can't speak full sentences",
					next: "severe_breathing",
					color: "bg-red-100",
				},
			],
		},

		circulation_check: {
			question: "Any visible bleeding or signs of shock?",
			type: "question",
			answers: [
				{
					text: "No bleeding, normal skin color",
					next: "mobility_check",
					color: "bg-green-100",
				},
				{
					text: "Minor bleeding, controlled easily",
					next: "minor_bleeding",
					color: "bg-yellow-100",
				},
				{
					text: "Severe bleeding, pale/cold skin",
					next: "severe_bleeding",
					color: "bg-red-100",
				},
			],
		},

		mobility_check: {
			question: "Can you walk without assistance?",
			type: "question",
			answers: [
				{
					text: "Yes, can walk normally",
					next: "pain_assessment",
					color: "bg-green-100",
				},
				{
					text: "Can walk with some help",
					next: "limited_mobility",
					color: "bg-yellow-100",
				},
				{
					text: "Cannot walk/move legs",
					next: "mobility_concern",
					color: "bg-red-100",
				},
			],
		},

		pain_assessment: {
			question:
				"Rate your pain from 1-10, where 10 is the worst pain imaginable",
			type: "question",
			answers: [
				{
					text: "1-3 (Mild pain)",
					next: "green_triage",
					color: "bg-green-100",
				},
				{
					text: "4-6 (Moderate pain)",
					next: "yellow_triage_pain",
					color: "bg-yellow-100",
				},
				{
					text: "7-10 (Severe pain)",
					next: "pain_location",
					color: "bg-orange-100",
				},
			],
		},

		pain_location: {
			question: "Where is the severe pain located?",
			type: "question",
			answers: [
				{
					text: "Chest, abdomen, or head",
					next: "red_triage",
					color: "bg-red-100",
				},
				{
					text: "Back, neck, or spine",
					next: "red_triage",
					color: "bg-red-100",
				},
				{
					text: "Arms, legs, or other extremities",
					next: "yellow_triage",
					color: "bg-yellow-100",
				},
			],
		},

		unconscious_check: {
			question: "Check pulse and breathing",
			type: "question",
			answers: [
				{
					text: "Has pulse and breathing",
					next: "red_triage",
					color: "bg-red-100",
				},
				{
					text: "No pulse or breathing",
					next: "black_triage",
					color: "bg-gray-800 text-white",
				},
			],
		},

		altered_consciousness: {
			question:
				"Can they follow simple commands? (Squeeze my hand, open your eyes)",
			type: "question",
			answers: [
				{
					text: "Yes, follows commands",
					next: "breathing_check",
					color: "bg-yellow-100",
				},
				{
					text: "No, cannot follow commands",
					next: "red_triage",
					color: "bg-red-100",
				},
			],
		},

		severe_breathing: {
			question: "Emergency airway assessment needed",
			type: "result",
			priority: "RED - IMMEDIATE",
			color: "bg-red-500 text-white",
			actions: [
				"Check airway obstruction",
				"Position for optimal breathing",
				"Consider assisted ventilation",
				"Immediate medical attention required",
			],
		},

		severe_bleeding: {
			question: "Emergency hemorrhage control needed",
			type: "result",
			priority: "RED - IMMEDIATE",
			color: "bg-red-500 text-white",
			actions: [
				"Apply direct pressure",
				"Elevate if possible",
				"Consider tourniquet if limb bleeding",
				"Monitor for shock signs",
			],
		},

		red_triage: {
			question: "Immediate Priority Patient",
			type: "result",
			priority: "RED - IMMEDIATE",
			color: "bg-red-500 text-white",
			actions: [
				"Life-threatening condition present",
				"Requires immediate medical attention",
				"Continuous monitoring needed",
				"Prepare for rapid transport",
			],
		},

		yellow_triage: {
			question: "Urgent Priority Patient",
			type: "result",
			priority: "YELLOW - URGENT",
			color: "bg-yellow-500 text-white",
			actions: [
				"Stable but requires medical attention",
				"Monitor for deterioration",
				"Can wait for available resources",
				"Document injury details",
			],
		},

		yellow_triage_pain: {
			question: "Urgent Priority Patient",
			type: "result",
			priority: "YELLOW - URGENT",
			color: "bg-yellow-500 text-white",
			actions: [
				"Moderate pain requires assessment",
				"Monitor pain progression",
				"Consider pain management",
				"Schedule for medical evaluation",
			],
		},

		green_triage: {
			question: "Minor Priority Patient",
			type: "result",
			priority: "GREEN - MINOR",
			color: "bg-green-500 text-white",
			actions: [
				"Minor injury or illness",
				"Can wait for treatment",
				"Provide basic first aid",
				"Self-care instructions appropriate",
			],
		},

		black_triage: {
			question: "Deceased/Expectant",
			type: "result",
			priority: "BLACK - DECEASED",
			color: "bg-gray-800 text-white",
			actions: [
				"No vital signs present",
				"Confirm with medical authority",
				"Document time and circumstances",
				"Notify appropriate personnel",
			],
		},

		moderate_breathing: {
			question: "Any chest pain or tightness?",
			type: "question",
			answers: [
				{
					text: "Yes, chest pain present",
					next: "red_triage",
					color: "bg-red-100",
				},
				{
					text: "No chest pain",
					next: "yellow_triage",
					color: "bg-yellow-100",
				},
			],
		},

		minor_bleeding: {
			question: "Is bleeding from head/neck/torso area?",
			type: "question",
			answers: [
				{
					text: "Yes, bleeding from head/neck/torso",
					next: "yellow_triage",
					color: "bg-yellow-100",
				},
				{
					text: "No, bleeding from extremities only",
					next: "circulation_check",
					color: "bg-green-100",
				},
			],
		},

		limited_mobility: {
			question: "Any back or neck pain?",
			type: "question",
			answers: [
				{
					text: "Yes, back or neck pain",
					next: "red_triage",
					color: "bg-red-100",
				},
				{
					text: "No spinal pain",
					next: "yellow_triage",
					color: "bg-yellow-100",
				},
			],
		},

		mobility_concern: {
			question: "Potential spinal injury - exercise extreme caution",
			type: "result",
			priority: "RED - IMMEDIATE",
			color: "bg-red-500 text-white",
			actions: [
				"Do not move patient unnecessarily",
				"Maintain spinal immobilization",
				"Check sensation in extremities",
				"Immediate medical evaluation required",
			],
		},
	};

	const handleAnswer = (answer: Answer): void => {
		setPath([...path, { node: currentNode, answer: answer.text }]);
		setCurrentNode(answer.next);
	};

	const goBack = (): void => {
		if (path.length > 0) {
			const newPath = [...path];
			const lastStep = newPath.pop();
			setPath(newPath);
			if (lastStep) {
				setCurrentNode(lastStep.node);
			}
		}
	};

	const restart = (): void => {
		setCurrentNode("start");
		setPath([]);
		setPatientInfo({});
	};

	const currentNodeData: Node = nodes[currentNode];

	const getPriorityIcon = (priority?: string): React.JSX.Element | null => {
		if (priority?.includes("RED")) return <AlertTriangle className="w-6 h-6" />;
		if (priority?.includes("YELLOW")) return <Clock className="w-6 h-6" />;
		if (priority?.includes("GREEN")) return <Heart className="w-6 h-6" />;
		if (priority?.includes("BLACK")) return <Users className="w-6 h-6" />;
		return null;
	};

	return (
		<div className="max-w-4xl mx-auto p-6 bg-white min-h-screen">
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-800 mb-2">
					Medical Triage Decision Tree
				</h1>
				<p className="text-gray-600">
					Follow the questions to determine patient priority level
				</p>
			</div>

			{/* Progress indicator */}
			<div className="mb-6 p-4 bg-gray-50 rounded-lg">
				<div className="text-sm text-gray-600 mb-2">Assessment Progress:</div>
				<div className="text-xs text-gray-500">
					{path.map((step: PathStep, index: number) => (
						<span key={`step-${step.node}-${index}`} className="mr-2">
							{index + 1}. {step.answer} →
						</span>
					))}
				</div>
			</div>

			<div className="bg-white border-2 border-gray-200 rounded-xl p-8 shadow-lg">
				{currentNodeData.type === "question" ? (
					<div>
						<div className="flex items-center mb-6">
							<div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
								<span className="text-blue-600 font-bold text-xl">
									{path.length + 1}
								</span>
							</div>
							<h2 className="text-2xl font-semibold text-gray-800">
								{currentNodeData.question}
							</h2>
						</div>

						<div className="space-y-4">
							{currentNodeData.answers?.map((answer: Answer, index: number) => (
								<button
									type="button"
									key={`answer-${answer.text}`}
									onClick={() => handleAnswer(answer)}
									className={`w-full p-4 text-left rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md ${answer.color}`}
								>
									<div className="flex items-center justify-between">
										<span className="text-lg font-medium text-gray-700">
											{answer.text}
										</span>
										<ChevronRight className="w-5 h-5 text-gray-400" />
									</div>
								</button>
							))}
						</div>
					</div>
				) : (
					<div className="text-center">
						<div
							className={`inline-flex items-center px-6 py-3 rounded-full text-xl font-bold mb-6 ${currentNodeData.color}`}
						>
							{getPriorityIcon(currentNodeData.priority)}
							<span className="ml-2">{currentNodeData.priority}</span>
						</div>

						<h2 className="text-2xl font-semibold text-gray-800 mb-6">
							{currentNodeData.question}
						</h2>

						<div className="bg-gray-50 rounded-lg p-6 mb-6">
							<h3 className="text-lg font-semibold text-gray-700 mb-4">
								Immediate Actions:
							</h3>
							<ul className="space-y-2 text-left">
								{currentNodeData.actions?.map((action: string) => (
									<li key={`action-${action}`} className="flex items-start">
										<span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0" />
										<span className="text-gray-600">{action}</span>
									</li>
								))}
							</ul>
						</div>
					</div>
				)}

				{/* Navigation buttons */}
				<div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
					<button
						type="button"
						onClick={goBack}
						disabled={path.length === 0}
						className="flex items-center px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<ChevronLeft className="w-4 h-4 mr-2" />
						Back
					</button>

					<button
						type="button"
						onClick={restart}
						className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
					>
						Start Over
					</button>
				</div>
			</div>

			{/* Quick reference */}
			<div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
				<div className="bg-red-100 p-3 rounded-lg">
					<div className="font-semibold text-red-800">RED - Immediate</div>
					<div className="text-red-600">Life-threatening</div>
				</div>
				<div className="bg-yellow-100 p-3 rounded-lg">
					<div className="font-semibold text-yellow-800">YELLOW - Urgent</div>
					<div className="text-yellow-600">Stable, needs care</div>
				</div>
				<div className="bg-green-100 p-3 rounded-lg">
					<div className="font-semibold text-green-800">GREEN - Minor</div>
					<div className="text-green-600">Walking wounded</div>
				</div>
				<div className="bg-gray-200 p-3 rounded-lg">
					<div className="font-semibold text-gray-800">BLACK - Deceased</div>
					<div className="text-gray-600">No vital signs</div>
				</div>
			</div>
		</div>
	);
};

export default TriageDecisionTree;
