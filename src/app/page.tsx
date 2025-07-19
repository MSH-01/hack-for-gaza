"use client";

import Homescreen from "@/components/Homescreen";

export default function Home() {
	
	const handleRole = (role:string) => {
        window.location.href = `/medical?role=${role}`;
    }
	
	return (
		<div className="flex flex-col items-center justify-center h-screen">
			<Homescreen callback={handleRole} />
		</div>
	);
}
