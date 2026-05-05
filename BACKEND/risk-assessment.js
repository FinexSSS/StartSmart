/**
 * Team 3 - Feature 15: Risk Assessment Module
 * Evaluates business risks using AI analysis
 */

const { callOpenRouter, extractJson } = require('../../BACKEND/ai-service');

async function assessRisks(budget, industryId, teamSize, monthsToRun, userProfile = null) {
    if (!budget || !industryId) {
        throw new Error('Budget and industry are required');
    }

    try {
        const prompt = `You are a startup risk analyst. ${userProfile ? `User location: ${userProfile.region || 'unspecified'}` : ''}
        CRITICAL: Use REAL-TIME 2026 economic and industry risks.

        Budget: $${budget}
        Industry: ${industryId}
        Team Size: ${teamSize}
        Duration: ${monthsToRun} months

        Provide comprehensive risk assessment in JSON:
        {
            "overallRiskLevel": "Low|Medium|High",
            "riskScore": number (0-100),
            "risks": [
                {
                    "category": "risk category",
                    "score": number (0-100),
                    "level": "High|Medium|Low",
                    "description": "one sentence",
                    "impact": "description of impact",
                    "mitigation": "one sentence advice",
                    "probability": "Low|Medium|High"
                }
            ],
            "riskMatrix": {
                "highRisk": ["categories"],
                "mediumRisk": ["categories"],
                "lowRisk": ["categories"]
            },
            "recommendations": ["3-4 risk mitigation strategies"]
        }
        Reply with only valid JSON.`;

        const response = await callOpenRouter(prompt);
        const jsonResponse = extractJson(response);
        return JSON.parse(jsonResponse);
    } catch (error) {
        console.warn('AI risk assessment failed:', error.message);
        return getFallbackRiskAssessment();
    }
}

function getFallbackRiskAssessment() {
    return {
        overallRiskLevel: "Medium",
        riskScore: 45,
        risks: [
            {
                category: "Capital Limitation",
                score: 65,
                level: "Medium",
                description: "Insufficient funds may hinder operations",
                impact: "May need additional funding or cost reduction",
                mitigation: "Secure additional funding sources early",
                probability: "Medium"
            },
            {
                category: "Market Competition",
                score: 70,
                level: "High",
                description: "Established competitors may dominate market share",
                impact: "Reduced market share and pricing pressure",
                mitigation: "Focus on niche differentiation",
                probability: "High"
            },
            {
                category: "Demand Uncertainty",
                score: 50,
                level: "Medium",
                description: "Market demand may not meet projections",
                impact: "Lower than expected revenue",
                mitigation: "Conduct thorough market research",
                probability: "Medium"
            },
            {
                category: "Operational Challenges",
                score: 40,
                level: "Medium",
                description: "Day-to-day operations may face unexpected issues",
                impact: "Increased costs and delays",
                mitigation: "Develop standard operating procedures",
                probability: "Medium"
            }
        ],
        riskMatrix: {
            highRisk: ["Market Competition"],
            mediumRisk: ["Capital Limitation", "Demand Uncertainty", "Operational Challenges"],
            lowRisk: ["Regulatory Changes"]
        },
        recommendations: [
            "Maintain 3-6 months operating expenses as reserve",
            "Diversify revenue streams early",
            "Purchase appropriate business insurance",
            "Develop contingency plans for each risk category"
        ]
    };
}

module.exports = { assessRisks };