"use client";

import { useState } from "react";

const Homescreen = ({
    callback
}: {callback:Function}) => {
	
    const [ selectedItem, setSelectedItem ] = useState<string | null>(null);
    
    return (
        <div className="flex flex-col gap-6 items-center">
            <div>Logo goes here</div>
            <h1 className="text-2xl font-bold text-gray-800">Medical Triage</h1>
            <p className="text-gray-600">Start by telling us what your role is</p>
            <ul className="flex flex-col gap-2">
                <li
                    className={`cursor-pointer px-4 py-2 rounded ${selectedItem === "doctor" ? "bg-blue-400 text-white" : "hover:bg-gray-100"}`}
                    onClick={() => setSelectedItem("doctor")}
                >
                    Doctor
                </li>
                <li
                    className={`cursor-pointer px-4 py-2 rounded ${selectedItem === "patient" ? "bg-blue-400 text-white" : "hover:bg-gray-100"}`}
                    onClick={() => setSelectedItem("patient")}
                >
                    Patient
                </li>
                <li
                    className={`cursor-pointer px-4 py-2 rounded ${selectedItem === "volunteer" ? "bg-blue-400 text-white" : "hover:bg-gray-100"}`}
                    onClick={() => setSelectedItem("volunteer")}
                >
                    Volunteer
                </li>
            </ul>
            <button
                className="px-6 py-2 bg-blue-600 text-white rounded disabled:bg-gray-300 cursor-pointer"
                disabled={selectedItem === null}
                onClick={() => callback(selectedItem)}
            >
                Start
            </button>
        </div>
    );
};

export default Homescreen;