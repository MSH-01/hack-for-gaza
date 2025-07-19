"use client";
import type React from "react";
import { useState, useEffect } from "react";
import yaml from "js-yaml";
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


const TriageDecisionTree = ({
		role
	}: {role:string|null}) => {

	const [currentNode, setCurrentNode] = useState<string>("start");
	const [path, setPath] = useState<PathStep[]>([]);
	const [nodes, setNodes] = useState<Record<string, Node>>({});
	const [invalidRole, setInvalidRole] = useState<boolean>(false);
	const [loadingData, setLoadingData] = useState<boolean>(true);

	useEffect(() => {
		const fetchTriageData = async () => {

			if (!role) {
				setInvalidRole(true);
				setLoadingData(false);
				return;
			}

			const res = await fetch("/data/triage.yaml");
			const text = await res.text();
			const data = yaml.load(text) as Record<string, Record<string, Node>>;
			
			if (!data[role]) {
				setInvalidRole(true);
			}else {
				setNodes(data[role]);
			}
			setLoadingData(false);
		};
		fetchTriageData();
	}, []);
	
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
	};

	const currentNodeData: Node = nodes[currentNode];

	const getPriorityIcon = (priority?: string): React.JSX.Element | null => {
		if (priority?.includes("RED")) return <AlertTriangle className="w-6 h-6" />;
		if (priority?.includes("YELLOW")) return <Clock className="w-6 h-6" />;
		if (priority?.includes("GREEN")) return <Heart className="w-6 h-6" />;
		if (priority?.includes("BLACK")) return <Users className="w-6 h-6" />;
		return null;
	};

	if (loadingData) {
		return <div>Loading data...</div>;
	}

	if (invalidRole) {
		return <div>The following role is not supported: {role}</div>;
	}

	return (
		<div className="max-w-4xl mx-auto p-6 bg-white min-h-screen">
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-800 mb-2">
					Medical Triage Decision Tree ({role})
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
