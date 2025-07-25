import {
	PDFDocument,
	rgb,
	StandardFonts,
	type PDFFont,
	type PDFPage,
} from "pdf-lib";
import type { TriageResult } from "@/interfaces";

type PDFManager = {
	currentPage: number;
	currentXPosition: number;
	currentYPosition: number;
	pageWidth: number;
	pageHeight: number;
	currentPageDocument: PDFPage | null;
	pdfDoc: PDFDocument;
	horizontalPadding: number;
	horizontalVerticalPadding: number;
	paragraphSpace: number;
};

type TextComponent = {
	text: string;
	size: number;
	color: string;
	font?: PDFFont;
};

const addHorizontalLine = (
	manager: PDFManager,
	thickness = 1,
	color = "rgb(0,0,0)",
) => {
	// Default to current Y position if not provided
	const y = getCurrentYPosition(manager);

	// Parse color string "rgb(r,g,b)" to rgb() for pdf-lib
	let rgbColor = rgb(0, 0, 0);
	const match = color.match(/rgb\(([\d.]+),\s*([\d.]+),\s*([\d.]+)\)/);
	if (match) {
		rgbColor = rgb(
			Number.parseFloat(match[1]) / 255,
			Number.parseFloat(match[2]) / 255,
			Number.parseFloat(match[3]) / 255,
		);
	}

	manager.currentPageDocument?.drawLine({
		start: { x: manager.horizontalPadding, y },
		end: { x: manager.pageWidth - manager.horizontalPadding, y },
		thickness,
		color: rgbColor,
	});

	// Optionally, move Y position down by thickness + some spacing if desired
	manager.currentYPosition += thickness + 20;
};

const getDate = () => {
	const now = new Date();

	// Get date components for Israel timezone
	const options: Intl.DateTimeFormatOptions = {
		timeZone: "Asia/Gaza",
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit",
		hour12: true,
	};

	const formatter = new Intl.DateTimeFormat("en-GB", options);
	const parts = formatter.formatToParts(now);

	// Extract parts
	const weekday = parts.find((p) => p.type === "weekday")?.value;
	const day = parts.find((p) => p.type === "day")?.value;
	const month = parts.find((p) => p.type === "month")?.value;
	const year = parts.find((p) => p.type === "year")?.value;
	const hour = parts.find((p) => p.type === "hour")?.value;
	const minute = parts.find((p) => p.type === "minute")?.value;
	const dayPeriod = parts.find((p) => p.type === "dayPeriod")?.value;

	// Add ordinal suffix to day
	function getOrdinalSuffix(day: string) {
		const dayNum = Number.parseInt(day);
		if (dayNum >= 11 && dayNum <= 13) return "th";
		switch (dayNum % 10) {
			case 1:
				return "st";
			case 2:
				return "nd";
			case 3:
				return "rd";
			default:
				return "th";
		}
	}

	const ordinalDay = day + getOrdinalSuffix(day || "");
	const formattedTime = dayPeriod?.toLowerCase();

	return `${weekday} ${ordinalDay} ${month} ${year} ${hour}:${minute}${formattedTime}`;
};

const identifyIndex = (index: number) => {
	if (index < 9) {
		return `0${index + 1}`;
	}
	return `${index + 1}`;
};

function pointsToMillimeters(font: PDFFont, text: string, size: number) {
	const POINTS_PER_INCH = 72;
	const MM_PER_INCH = 25.4;
	const widthInPoints = font.widthOfTextAtSize(text, size) as number;
	//   return widthInPoints
	//   * (MM_PER_INCH/POINTS_PER_INCH)
	//   return widthInPoints / 12
	return (widthInPoints / POINTS_PER_INCH) * MM_PER_INCH;
}

const getTextLines = async (
	manager: PDFManager,
	textComponent: TextComponent,
	boxWidth: number,
) => {
	const font = (await manager.pdfDoc.embedFont(
		textComponent.font?.name || StandardFonts.Helvetica,
	)) as PDFFont;

	const textWidth = pointsToMillimeters(
		font,
		textComponent.text,
		textComponent.size,
	);
	const textHeight = font.heightAtSize(textComponent.size);

	if (textWidth <= boxWidth) {
		return {
			texts: [textComponent.text],
			eachLineHeight: textHeight,
			totalLineHeight: textHeight,
		};
	}

	const allWords = textComponent.text
		.split(" ")
		.filter((word) => word.length > 0);
	let startPointer = 0;
	// add 1 word at a time
	const incrimentor = 1;

	const lines = [];

	while (startPointer < allWords.length) {
		let currentWidth = 0;
		const startIndex = startPointer;
		let lastIndex = startPointer;
		let prevSentence = "";

		while (currentWidth < boxWidth && startPointer < allWords.length) {
			const endPointer = startPointer + incrimentor;
			const currentLine = allWords.slice(startIndex, endPointer).join(" ");
			const latestWidth =
				currentWidth +
				pointsToMillimeters(font, currentLine, textComponent.size);
			if (latestWidth > boxWidth) {
				console.table({
					prev: prevSentence,
					currentLine,
					latestWidth,
					boxWidth,
					currentWidth,
				});
				break;
			}

			currentWidth = latestWidth;
			startPointer = endPointer;
			lastIndex = endPointer;
			prevSentence = currentLine;
		}

		const completeLine = allWords.slice(startIndex, lastIndex).join(" ");
		console.log("dimensions", completeLine, currentWidth);
		lines.push(completeLine);
		startPointer = lastIndex;
	}

	return {
		texts: lines,
		eachLineHeight: textHeight,
		totalLineHeight: lines.length * textHeight,
	};
};

const moveToNewPage = (manager: PDFManager, newElementHeight = 0) => {
	if (
		manager.currentPageDocument != null &&
		manager.currentYPosition + newElementHeight < manager.pageHeight
	) {
		return;
	}
	manager.currentYPosition = 30 + manager.horizontalVerticalPadding;
	manager.currentPageDocument = manager.pdfDoc.addPage([
		manager.pageWidth,
		manager.pageHeight,
	]);
};

const getCurrentYPosition = (manager: PDFManager) => {
	return manager.pageHeight - manager.currentYPosition;
};

const getCurrentXPosition = (manager: PDFManager) => {
	return manager.horizontalPadding;
};

const addTextToFile = (
	manager: PDFManager,
	textComponent: TextComponent,
	textHeight: number,
) => {
	moveToNewPage(manager, textHeight);

	manager.currentPageDocument?.drawText(textComponent.text, {
		x: getCurrentXPosition(manager),
		y: getCurrentYPosition(manager),
		size: textComponent.size,
	});

	manager.currentYPosition += textHeight + manager.paragraphSpace;
};

const addParagraph = async (
	manager: PDFManager,
	textComponent: TextComponent,
) => {
	const { texts, eachLineHeight } = await getTextLines(
		manager,
		textComponent,
		595.28,
	);

	for (const textIndex in texts) {
		const text = texts[textIndex];
		addTextToFile(manager, { ...textComponent, text }, eachLineHeight);
	}
};

const determinePriorityMessage = (priority: string) => {
	switch (priority) {
		case "RED": {
			return "IMMEDIATE";
		}
		case "YELLOW": {
			return "URGENT";
		}
		case "GREEN": {
			return "MINOR";
		}
		case "BLACK": {
			return "DECEASED";
		}
	}
};

export const producePDF = async (results: TriageResult) => {
	const pdfDoc = await PDFDocument.create();

	const greyHorizontalLineColour = "rgb(128,128,128)";

	const manager: PDFManager = {
		currentPage: 0,
		currentXPosition: 0,
		currentYPosition: 0,
		pageHeight: 841.89,
		pageWidth: 595.28,
		paragraphSpace: 2,
		currentPageDocument: null,
		pdfDoc: pdfDoc,
		horizontalPadding: 25,
		horizontalVerticalPadding: 20,
	};

	moveToNewPage(manager);

	await addParagraph(manager, {
		text: "Immediate Actions Required",
		size: 24,
		color: "rgb(0, 0.53, 0.71)",
	});

	addHorizontalLine(manager, 1, greyHorizontalLineColour);

	await addParagraph(manager, {
		text: `Priority: ${determinePriorityMessage(results.priority)}`,
		size: 12,
		color: "rgb(0, 0.53, 0.71)",
	});

	addHorizontalLine(manager, 1, greyHorizontalLineColour);

	await addParagraph(manager, {
		text: `Confidence: ${Math.floor(results.confidence * 1000) / 10}%`,
		size: 12,
		color: "rgb(0, 0.53, 0.71)",
	});

	addHorizontalLine(manager, 1, greyHorizontalLineColour);

	await addParagraph(manager, {
		text: `Reasses: ${results.reassessTime} minutes`,
		size: 12,
		color: "rgb(0, 0.53, 0.71)",
	});

	addHorizontalLine(manager, 1, greyHorizontalLineColour);

	for (let k = 0; k < results.actions.length; k++) {
		const currentAction = results.actions[k];
		await addParagraph(manager, {
			text: `${identifyIndex(k)}) ${currentAction}`,
			size: 12,
			color: "rgb(0, 0.53, 0.71)",
		});
	}

	addHorizontalLine(manager, 1, greyHorizontalLineColour);

	const date = getDate();
	await addParagraph(manager, {
		text: date,
		size: 12,
		color: "rgb(0, 0.53, 0.71)",
	});

	const pdfBytes = await manager.pdfDoc.save();

	return pdfBytes;
};

export const downloadPDF = async (results: TriageResult) => {
	const pdfBytes = await producePDF(results);

	const blob = new Blob([pdfBytes], { type: "application/pdf" });
	const url = URL.createObjectURL(blob);

	const link = document.createElement("a");
	link.href = url;
	link.download = "triage-report.pdf";
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);

	URL.revokeObjectURL(url);
};

export const sharePDFViaWhatsApp = async (results: TriageResult) => {
	const pdfBytes = await producePDF(results);

	// Create a Blob and a File object for sharing
	const blob = new Blob([pdfBytes], { type: "application/pdf" });
	const file = new File([blob], "triage-report.pdf", {
		type: "application/pdf",
	});

	// Check if the Web Share API with files is available
	if (navigator.canShare?.({ files: [file] })) {
		try {
			await navigator.share({
				files: [file],
				title: "Triage Report",
				text: "Here is the triage report PDF.",
			});
		} catch (error) {
			alert(`Sharing failed: ${(error as Error).message}`);
		}
	} else {
		alert("Sharing failed: WhatsApp is not supported on this device.");
	}
};
