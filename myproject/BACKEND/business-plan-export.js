/**
 * Team 4 - Feature 20: Business Plan Export Module
 * Generates downloadable PDF business plan
 */

const { callOpenRouter, extractJson } = require('../../BACKEND/ai-service');
const fs = require('fs');
const path = require('path');

async function generateBusinessPlan(budget, industryId, teamSize, monthsToRun, userProfile = null) {
    if (!budget || !industryId) {
        throw new Error('Budget and industry are required');
    }

    try {
        const prompt = `You are an expert business plan writer. ${userProfile ? `User: ${userProfile.firstName} ${userProfile.lastName}` : ''}
        CRITICAL: Use web search for REAL-TIME 2026 market data.

        Budget: $${budget}
        Industry: ${industryId}
        Team Size: ${teamSize}
        Duration: ${monthsToRun} months

        Generate a comprehensive business plan in JSON:
        {
            "executiveSummary": "2-3 paragraphs",
            "companyDescription": {
                "mission": "string",
                "vision": "string",
                "values": ["value1", "value2"]
            },
            "marketAnalysis": {
                "targetMarket": "description",
                "marketSize": "$ amount",
                "competitors": ["comp1", "comp2"],
                "marketTrends": ["trend1", "trend2"]
            },
            "financialPlan": {
                "startupCosts": number,
                "monthlyBurn": number,
                "projectedRevenue": number,
                "breakEvenMonth": number,
                "fundingRequirements": number
            },
            "marketingStrategy": {
                "channels": ["channel1", "channel2"],
                "budget": number,
                "timeline": "description"
            },
            "operationalPlan": {
                "location": "type",
                "equipment": ["item1", "item2"],
                "staffing": "description"
            },
            "appendix": {
                "financialProjections": "summary",
                "riskMitigation": ["risk1", "risk2"]
            }
        }
        Reply with only valid JSON.`;

        const response = await callOpenRouter(prompt);
        const jsonResponse = extractJson(response);
        const planData = JSON.parse(jsonResponse);

        // Generate PDF (simplified - in real implementation use a PDF library)
        const pdfContent = generatePdfContent(planData);
        const fileName = `business-plan-${industryId}-${Date.now()}.pdf`;
        const filePath = path.join(__dirname, '../../exports', fileName);

        // Ensure exports directory exists
        const exportsDir = path.join(__dirname, '../../exports');
        if (!fs.existsSync(exportsDir)) {
            fs.mkdirSync(exportsDir, { recursive: true });
        }

        fs.writeFileSync(filePath, pdfContent);

        return {
            success: true,
            fileName: fileName,
            filePath: filePath,
            downloadUrl: `/api/export/download/${fileName}`,
            planData: planData
        };
    } catch (error) {
        console.warn('AI business plan generation failed:', error.message);
        return generateFallbackBusinessPlan(budget, industryId);
    }
}

function generatePdfContent(planData) {
    // Simplified PDF generation - in production use a library like puppeteer, jsPDF, or PDFKit
    const content = `
BUSINESS PLAN
================

EXECUTIVE SUMMARY
${planData.executiveSummary || 'N/A'}

COMPANY DESCRIPTION
Mission: ${planData.companyDescription?.mission || 'N/A'}
Vision: ${planData.companyDescription?.vision || 'N/A'}

MARKET ANALYSIS
Target Market: ${planData.marketAnalysis?.targetMarket || 'N/A'}
Market Size: ${planData.marketAnalysis?.marketSize || 'N/A'}

FINANCIAL PLAN
Startup Costs: $${planData.financialPlan?.startupCosts || 'N/A'}
Monthly Burn: $${planData.financialPlan?.monthlyBurn || 'N/A'}
Projected Revenue: $${planData.financialPlan?.projectedRevenue || 'N/A'}

MARKETING STRATEGY
Channels: ${(planData.marketingStrategy?.channels || []).join(', ')}
Budget: $${planData.marketingStrategy?.budget || 'N/A'}

OPERATIONAL PLAN
Location: ${planData.operationalPlan?.location || 'N/A'}
Equipment: ${(planData.operationalPlan?.equipment || []).join(', ')}

Generated on: ${new Date().toISOString()}
    `;

    return Buffer.from(content, 'utf8');
}

function generateFallbackBusinessPlan(budget, industryId) {
    const fileName = `business-plan-${industryId}-fallback-${Date.now()}.txt`;
    const content = `BUSINESS PLAN - ${industryId.toUpperCase()}
Budget: $${budget}
Generated: ${new Date().toISOString()}

This is a fallback business plan. Please check AI service connectivity.
`;

    return {
        success: true,
        fileName: fileName,
        content: content,
        isFallback: true
    };
}

module.exports = { generateBusinessPlan };