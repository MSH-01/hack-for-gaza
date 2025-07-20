import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { TriageResult } from '@/interfaces';

type PDFManager = {
    currentPage: number;
    currentXPosition: number;
    currentYPosition: number;
    pageWidth: number;
    pageHeight: number;
    currentPageDocument: any;
    pdfDoc: any,
    horizontalPadding: number,
    horizontalVerticalPadding: number,  
    paragraphSpace: number,
}

type TextComponent = {
    text: string;
    size: number;
    color: string;
    font?: any;
}

const addHorizontalLine = (manager: PDFManager, thickness: number = 1, color: string = "rgb(0,0,0)") => {
    // Default to current Y position if not provided
    const y = getCurrentYPosition(manager);

    // Parse color string "rgb(r,g,b)" to rgb() for pdf-lib
    let rgbColor = rgb(0, 0, 0);
    const match = color.match(/rgb\(([\d.]+),\s*([\d.]+),\s*([\d.]+)\)/);
    if (match) {
        rgbColor = rgb(
            parseFloat(match[1]),
            parseFloat(match[2]),
            parseFloat(match[3])
        );
    }

    manager.currentPageDocument.drawLine({
        start: { x: manager.horizontalPadding, y },
        end: { x: manager.pageWidth - manager.horizontalPadding, y },
        thickness,
        color: rgbColor,
    });

    // Optionally, move Y position down by thickness + some spacing if desired
    manager.currentYPosition += (thickness + 20);
}


const getDate = () => {
    const now = new Date();
    
    // Get date components for Israel timezone
    const options = {
        timeZone: 'Asia/Gaza',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    } as any;
    
    const formatter = new Intl.DateTimeFormat('en-GB', options);
    const parts = formatter.formatToParts(now) as any[];
    
    // Extract parts
    const weekday = parts.find(p => p.type === 'weekday').value;
    const day = parts.find(p => p.type === 'day').value;
    const month = parts.find(p => p.type === 'month').value;
    const year = parts.find(p => p.type === 'year').value;
    const hour = parts.find(p => p.type === 'hour').value;
    const minute = parts.find(p => p.type === 'minute').value;
    const dayPeriod = parts.find(p => p.type === 'dayPeriod').value;
    
    // Add ordinal suffix to day
    function getOrdinalSuffix(day:string) {
        const dayNum = parseInt(day);
        if (dayNum >= 11 && dayNum <= 13) return 'th';
        switch (dayNum % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    }
    
    const ordinalDay = day + getOrdinalSuffix(day);
    const formattedTime = dayPeriod.toLowerCase();
    
    return `${weekday} ${ordinalDay} ${month} ${year} ${hour}:${minute}${formattedTime}`;
}

const identifyIndex = (index:number) => {
    if (index < 9) {
        return `0${index+1}`
    }
    return `${index+1}`
}

function pointsToMillimeters(font:any, text:string, size:number) {
    const POINTS_PER_INCH = 72;
    const MM_PER_INCH = 25.4;
    const widthInPoints = font.widthOfTextAtSize(text, size)
  //   return widthInPoints
  //   * (MM_PER_INCH/POINTS_PER_INCH)
  //   return widthInPoints / 12
    return (widthInPoints / POINTS_PER_INCH) * MM_PER_INCH;
  
  }
  
const getTextLines = async (manager:PDFManager, textComponent:TextComponent, boxWidth:number) => {
      const font = await manager.pdfDoc.embedFont(textComponent.font || StandardFonts.Helvetica);
  
      const textWidth = pointsToMillimeters(font, textComponent.text, textComponent.size);
      const textHeight = font.heightAtSize(textComponent.size);
  
      if (textWidth <= boxWidth) {
          return {
            texts: [textComponent.text],
            eachLineHeight: textHeight,
            totalLineHeight: textHeight
          };
      }
  
      let allWords = textComponent.text.split(" ").filter(word => word.length > 0);
      let startPointer = 0
      // add 1 word at a time
      let incrimentor = 1;
      
      let lines = []
  
      while (startPointer < allWords.length) {
  
        let currentWidth = 0
        let startIndex = startPointer
        let lastIndex = startPointer
         let prevSentence = ""
  
        while (currentWidth < boxWidth && startPointer < allWords.length) {
          
          let endPointer = startPointer + incrimentor
          let currentLine = allWords.slice(startIndex, endPointer).join(" ");
          let latestWidth = currentWidth + pointsToMillimeters(font, currentLine, textComponent.size);
          if (latestWidth > boxWidth) {          
              console.table({prev:prevSentence, currentLine, latestWidth, boxWidth, currentWidth})
              break
          }
          
          currentWidth = latestWidth
          startPointer = endPointer
          lastIndex = endPointer
          prevSentence = currentLine
  
        }
  
        let completeLine = allWords.slice(startIndex, lastIndex).join(" ");
        console.log("dimensions", completeLine, currentWidth)
        lines.push(completeLine)
        startPointer = lastIndex
  
      }
  
      return {
        texts: lines,
        eachLineHeight: textHeight,
        totalLineHeight: lines.length * textHeight
      };
      
  }
  
  const moveToNewPage = (manager:PDFManager, newElementHeight=0) => {
      if (manager.currentPageDocument != null && (manager.currentYPosition + newElementHeight < manager.pageHeight)) {
          return
      }
      manager.currentYPosition = 30 + manager.horizontalVerticalPadding
      manager.currentPageDocument = manager.pdfDoc.addPage([manager.pageWidth, manager.pageHeight]);
  }
  
  const getCurrentYPosition = (manager:PDFManager) => {
      return manager.pageHeight - manager.currentYPosition
  }
  
  const getCurrentXPosition = (manager:PDFManager) => {
      return manager.horizontalPadding
  }
  
  const addTextToFile = (manager:PDFManager, textComponent:TextComponent, textHeight:number) => {
  
      moveToNewPage(manager, textHeight)
      
      manager.currentPageDocument.drawText(textComponent.text, {
          x: getCurrentXPosition(manager),
          y: getCurrentYPosition(manager),
          size: textComponent.size,
      });
  
      manager.currentYPosition += (textHeight + manager.paragraphSpace)
  
  }
  
  const addParagraph = async (manager:PDFManager, textComponent:TextComponent) => {
    
      const { texts, eachLineHeight } = await getTextLines(manager, textComponent, 595.28)
  
      for (let textIndex in texts) {
          let text = texts[textIndex]
          addTextToFile(manager, {...textComponent, text}, eachLineHeight)
      }
  
  }

const determinePriorityMessage = (priority:string) => {
  switch(priority) {
    case 'RED': {
      return "IMMEDIATE"
    }
    case 'YELLOW': {
      return "URGENT"
    } 
    case 'GREEN': {
      return "MINOR"
    }
    case 'BLACK': {
      return "DECEASED"
    }       
  }
}

export const producePDF = async (results:TriageResult) => {
    

    const pdfDoc = await PDFDocument.create();
  
    const manager:PDFManager = {
      currentPage: 0,
      currentXPosition: 0,
      currentYPosition: 0,
      pageHeight: 841.89 ,
      pageWidth: 595.28,
      paragraphSpace: 2,
      currentPageDocument: null,
      pdfDoc: pdfDoc,
      horizontalPadding: 25,
      horizontalVerticalPadding: 20,
    }
  
    moveToNewPage(manager)

    await addParagraph(manager, {
        text: "Immediate Actions Required",
        size: 24,
        color: "rgb(0, 0.53, 0.71)",
      });

    addHorizontalLine(manager, 1, "rgb(0,0,0)")

    await addParagraph(manager, {
        text: "Priority: "+determinePriorityMessage(results.priority),
        size: 12,
        color: "rgb(0, 0.53, 0.71)",
      });

    addHorizontalLine(manager, 1, "rgb(0,0,0)")

    await addParagraph(manager, {
        text: "Confidence: "+results.confidence,
        size: 12,
        color: "rgb(0, 0.53, 0.71)",
      });

    addHorizontalLine(manager, 1, "rgb(0,0,0)")    

    await addParagraph(manager, {
        text: "Reasses: "+results.reassessTime + "minutes",
        size: 12,
        color: "rgb(0, 0.53, 0.71)",
      });

    addHorizontalLine(manager, 1, "rgb(0,0,0)")    

    for (let k = 0; k < results.actions.length; k++) {
      let currentAction = results.actions[k]
      await addParagraph(manager, {
        text: `${identifyIndex(k)}) ${currentAction}`,
        size: 12,
        color: "rgb(0, 0.53, 0.71)",
      });
    }

    addHorizontalLine(manager, 1, "rgb(0,0,0)")

    const date = getDate()
    await addParagraph(manager, {
        text: date,
        size: 12,
        color: "rgb(0, 0.53, 0.71)",
      });

    const pdfBytes = await manager.pdfDoc.save();
    
    return pdfBytes

      

};

export const downloadPDF = async (results:TriageResult) => {
    
    const pdfBytes = await producePDF(results)

    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'triage-report.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

};

export const sharePDFViaWhatsApp = async (results: TriageResult) => {
    const pdfBytes = await producePDF(results);

    // Create a Blob and a File object for sharing
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const file = new File([blob], 'triage-report.pdf', { type: 'application/pdf' });

    // Check if the Web Share API with files is available
    // @ts-ignore
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
            // @ts-ignore
            await navigator.share({
                files: [file],
                title: 'Triage Report',
                text: 'Here is the triage report PDF.',
            });
        } catch (error) {
            alert('Sharing failed: ' + (error as Error).message);
        }
    } else {
        alert('Sharing failed: WhatsApp is not supported on this device.');
    }
};