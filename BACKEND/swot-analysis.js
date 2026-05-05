/**
 * Team 4 - Feature 18: SWOT Analysis Tool
 * Generates SWOT analysis using AI
 */

const { callOpenRouter, extractJson } = require('../../BACKEND/ai-service');

async function generateSwotAnalysis(industryId, budget, userProfile = null) {
    if (!industryId) {
        throw new Error('Industry is required');
    }

    try {
        const prompt = `You are a business strategist. ${userProfile ? `User location: ${userProfile.region || 'unspecified'}` : ''}
        CRITICAL: Use web search for REAL-TIME 2026 market intelligence.

        Industry: ${industryId}
        Budget: $${budget}

        Provide SWOT analysis in JSON:
        {
            "strengths": [
                {"point": "strength description", "impact": "High|Medium|Low"}
            ],
            "weaknesses": [
                {"point": "weakness description", "impact": "High|Medium|Low"}
            ],
            "opportunities": [
                {"point": "opportunity description", "potential": "High|Medium|Low"}
            ],
            "threats": [
                {"point": "threat description", "severity": "High|Medium|Low"}
            ],
            "strategicRecommendations": ["rec1", "rec2", "rec3"],
            "priorityActions": ["action1", "action2"]
        }
        Reply with only valid JSON.`;

        const response = await callOpenRouter(prompt);
        const jsonResponse = extractJson(response);
        return JSON.parse(jsonResponse);
    } catch (error) {
        console.warn('AI SWOT analysis failed:', error.message);
        return getFallbackSwot(industryId);
    }
}

function getFallbackSwot(industryId) {
    const swotMap = {
        clothing: {
            strengths: [
                { point: "Low barrier to entry", impact: "High" },
                { point: "High creative expression", impact: "Medium" },
                { point: "Scalable e-commerce model", impact: "High" }
            ],
            weaknesses: [
                { point: "High competition", impact: "High" },
                { point: "Seasonal demand fluctuation", impact: "Medium" },
                { point: "Inventory management complexity", impact: "Medium" }
            ],
            opportunities: [
                { point: "Sustainable fashion trend", potential: "High" },
                { point: "Direct-to-consumer growth", potential: "High" },
                { point: "Influencer collaboration potential", potential: "Medium" }
            ],
            threats: [
                { point: "Fast fashion dominance", severity: "High" },
                { point: "Supply chain disruptions", severity: "Medium" },
                { point: "Changing consumer preferences", severity: "Medium" }
            ]
        },
        food: {
            strengths: [
                { point: "Essential industry (constant demand)", impact: "High" },
                { point: "Multiple revenue streams", impact: "Medium" },
                { point: "High customer loyalty potential", impact: "High" }
            ],
            weaknesses: [
                { point: "High operational costs", impact: "High" },
                { point: "Perishable inventory", impact: "Medium" },
                { point: "Strict regulatory requirements", impact: "High" }
            ],
            opportunities: [
                { point: "Health-conscious food trends", potential: "High" },
                { point: "Delivery platform growth", potential: "High" },
                { point: "Ghost kitchen model", potential: "Medium" }
            ],
            threats: [
                { point: "Food safety incidents", severity: "High" },
                { point: "Rising ingredient costs", severity: "Medium" },
                { point: "Intense local competition", severity: "High" }
            ]
        }
    };

    const swot = swotMap[industryId] || swotMap.clothing;

    return {
        ...swot,
        strategicRecommendations: [
            "Focus on niche market differentiation",
            "Build strong online presence early",
            "Develop strategic partnerships",
            "Monitor competitors closely"
        ],
        priorityActions: [
            "Conduct thorough market research",
            "Secure reliable supply chains",
            "Create unique value proposition"
        ]
    };
}

module.exports = { generateSwotAnalysis };