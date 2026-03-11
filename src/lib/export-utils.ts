'use client'

import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

interface ExportOptions {
    filename?: string
    quality?: number
    scale?: number
    includeTimestamp?: boolean
}

// Generate filename with timestamp
function generateFilename(base: string, extension: string): string {
    const date = new Date()
    const timestamp = date.toISOString().split('T')[0]
    return `${base}_${timestamp}.${extension}`
}

// Capture element as canvas
async function captureElement(
    element: HTMLElement,
    options: { scale?: number; backgroundColor?: string } = {}
): Promise<HTMLCanvasElement> {
    const { scale = 2, backgroundColor = '#09090b' } = options

    return await html2canvas(element, {
        scale,
        backgroundColor,
        useCORS: true,
        allowTaint: true,
        logging: false,
    } as any)
}

// Download as PNG image
export async function downloadAsImage(
    element: HTMLElement,
    options: ExportOptions = {}
): Promise<void> {
    const { filename = 'spotreplay_analysis', scale = 2 } = options

    try {
        const canvas = await captureElement(element, { scale })

        // Create download link
        const link = document.createElement('a')
        link.download = generateFilename(filename, 'png')
        link.href = canvas.toDataURL('image/png', 1.0)
        link.click()
    } catch (error) {
        console.error('Failed to export image:', error)
        throw error
    }
}

// Download as PDF with Spot Replay branding
export async function downloadAsPDF(
    element: HTMLElement,
    options: ExportOptions = {}
): Promise<void> {
    const { filename = 'spotreplay_analysis', scale = 2 } = options

    try {
        const canvas = await captureElement(element, { scale })

        // Calculate dimensions
        const imgWidth = canvas.width
        const imgHeight = canvas.height

        // Create PDF with proper orientation
        const orientation = imgWidth > imgHeight ? 'landscape' : 'portrait'
        const pdf = new jsPDF({
            orientation,
            unit: 'px',
            format: [imgWidth + 60, imgHeight + 120], // Extra space for branding
        })

        // Dark background
        pdf.setFillColor(9, 9, 11) // zinc-950
        pdf.rect(0, 0, imgWidth + 60, imgHeight + 120, 'F')

        // Add the analysis image
        const imgData = canvas.toDataURL('image/png', 1.0)
        pdf.addImage(imgData, 'PNG', 30, 30, imgWidth, imgHeight)

        // Add Spot Replay branding at bottom
        const brandingY = imgHeight + 50

        // Logo placeholder - will use favicon as logo
        // Add "Powered by Spot Replay AI" text
        pdf.setFontSize(14)
        pdf.setTextColor(113, 113, 122) // zinc-500
        pdf.text('Powered by', 30, brandingY)

        pdf.setFontSize(18)
        pdf.setTextColor(16, 185, 129) // emerald-500
        pdf.text('SPOT REPLAY AI', 110, brandingY)

        // Add website
        pdf.setFontSize(11)
        pdf.setTextColor(82, 82, 91) // zinc-600
        pdf.text('replay.propmatchspot.com', 30, brandingY + 20)

        // Add timestamp
        const timestamp = new Date().toLocaleString()
        pdf.setFontSize(10)
        pdf.setTextColor(63, 63, 70) // zinc-700
        pdf.text(`Generated: ${timestamp}`, imgWidth - 150, brandingY + 20)

        // Download
        pdf.save(generateFilename(filename, 'pdf'))
    } catch (error) {
        console.error('Failed to export PDF:', error)
        throw error
    }
}

// Copy to clipboard as image
export async function copyToClipboard(element: HTMLElement): Promise<void> {
    try {
        const canvas = await captureElement(element, { scale: 2 })

        canvas.toBlob(async (blob) => {
            if (blob) {
                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob })
                ])
            }
        }, 'image/png')
    } catch (error) {
        console.error('Failed to copy to clipboard:', error)
        throw error
    }
}
