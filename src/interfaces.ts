export interface PatientData {
	consciousness?: "alert" | "verbal" | "pain" | "unresponsive";
	breathing?: "normal" | "difficulty" | "severe" | "absent";
	circulation?: "normal" | "weak" | "absent";
	mobility?: "normal" | "limited" | "none";
	pain?: number;
	bleeding?: "none" | "minor" | "moderate" | "severe";
	injuries?: string[];
	// New detailed assessment fields
	age?: number;
	gender?: "male" | "female" | "other";
	chief_complaint?: string;
	mechanism_of_injury?:
		| "blunt"
		| "penetrating"
		| "burn"
		| "fall"
		| "mva"
		| "other"
		| "none";
	time_since_injury?: number; // in minutes
	allergies?: string[];
	medications?: string[];
	medical_history?: string[];
	vital_signs?: {
		heart_rate?: number;
		blood_pressure_systolic?: number;
		blood_pressure_diastolic?: number;
		temperature?: number;
		oxygen_saturation?: number;
		respiratory_rate?: number;
	};
	neurological?: {
		pupils?: "normal" | "dilated" | "constricted" | "unequal" | "non-reactive";
		gcs_eye?: number; // Glasgow Coma Scale components
		gcs_verbal?: number;
		gcs_motor?: number;
	};
	cardiac?: {
		chest_pain?: "none" | "mild" | "moderate" | "severe";
		rhythm?: "regular" | "irregular" | "unknown";
	};
	respiratory?: {
		breath_sounds?: "normal" | "decreased" | "absent" | "wheezing" | "crackles";
		chest_movement?: "normal" | "asymmetric" | "paradoxical";
	};
	abdominal?: {
		tenderness?: "none" | "mild" | "moderate" | "severe";
		rigidity?: boolean;
		distention?: boolean;
	};
	extremities?: {
		pulses?: "normal" | "weak" | "absent";
		capillary_refill?: "normal" | "delayed" | "absent";
		sensation?: "normal" | "decreased" | "absent";
		movement?: "normal" | "decreased" | "absent";
	};
	skin?: {
		color?: "normal" | "pale" | "cyanotic" | "jaundiced" | "flushed";
		temperature?: "warm" | "cool" | "cold";
		moisture?: "normal" | "dry" | "clammy";
	};
}

export interface TriageRule {
	id: string;
	name: string;
	condition: (patient: PatientData) => boolean; // This is a function in the runtime version
	priority: "RED" | "YELLOW" | "GREEN" | "BLACK";
	confidence: number;
	actions: string[];
	reassess_time?: number;
}

export interface AssessmentStep {
	id: string;
	question: string;
	type: "single" | "scale" | "multi";
	field: keyof PatientData;
	options?: Array<{
		value: unknown;
		label: string;
		color: "green" | "yellow" | "orange" | "red" | "gray" | "blue";
		critical?: boolean;
		description?: string;
	}>;
	required: boolean;
	skip_if?: (patient: Partial<PatientData>) => boolean; // This is a function in the runtime version
	description?: string;
	help_text?: string;
}

export interface TriageResult {
	priority: "RED" | "YELLOW" | "GREEN" | "BLACK";
	matchedRules: TriageRule[];
	confidence: number;
	actions: string[];
	reassessTime?: number;
}

// New interfaces to represent rules as loaded from YAML
export interface YamlTriageRule {
	id: string;
	name: string;
	condition: string; // Condition is now a string in YAML
	priority: "RED" | "YELLOW" | "GREEN" | "BLACK";
	confidence: number;
	actions: string[];
	reassess_time?: number;
	isCritical?: boolean; // Flag to mark critical rules in YAML
}

export interface YamlAssessmentStep {
	id: string;
	question: string;
	type: "single" | "scale" | "multi";
	field: keyof PatientData;
	options?: Array<{
		value: unknown;
		label: string;
		color: "green" | "yellow" | "orange" | "red" | "gray" | "blue";
		critical?: boolean;
		description?: string;
	}>;
	required: boolean;
	skip_if?: string; // skip_if is now a string in YAML
	description?: string;
	help_text?: string;
}

// Interface for the overall YAML structure
export interface TriageConfig {
	triageRules: YamlTriageRule[];
	assessmentFlow: YamlAssessmentStep[];
}
