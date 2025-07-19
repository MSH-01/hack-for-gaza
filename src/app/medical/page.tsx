"use client";

import MedicalDecisionTree from "@/components/MedicalDecisionTree";

import { useSearchParams } from "next/navigation";

export default function MedicalPage() {
    const searchParams = useSearchParams();
    const role = searchParams.get("role");
	
    return (
		<div className="min-h-screen">
			<MedicalDecisionTree role={role}/>
		</div>
	);
} 