/**
 * Team 2 - Feature 8: Startup Recommendation Engine
 * Suggests alternative startup ideas if business is not feasible
 */

const { callOpenRouter, extractJson } = require('../../BACKEND/ai-service');

async function getStartupRecommendations(budget, industryId, userProfile = null) {
    if (!budget || budget <= 0 || !industryId) {
        throw new Error('Budget and industry are required');
    }

    try {
        const prompt = `You are a strategic startup consultant. ${userProfile ? `User: ${userProfile.firstName}, Location: ${userProfile.region || 'unspecified'}` : ''}
        CRITICAL: Use REAL-TIME 2026 market intelligence.

        Current Industry: ${industryId}
        Budget: $${budget}

        Provide 3-5 viable alternative startups if "${industryId}" is not recommended for this budget.
        Each suggestion should include:
        - Name
        - Icon (emoji)
        - Budget requirements
        - Time to break-even (weeks)
        - Key differentiators
        - Success probability (percentage)

        Return JSON:
        {
            "recommendations": [
                {
                    "name": "Industry Name",
                    "icon": "emoji",
                    "minBudget": number,
                    "breakEvenWeeks": number,
                    "differentiators": ["point1", "point2"],
                    "successProbability": "X%",
                    "whySuitable": "explanation"
                }
            ],
            "hasBetterOptions": boolean,
            "aiInsight": "general advice"
        }
        Reply with only valid JSON.`;

        const response = await callOpenRouter(prompt);
        const jsonResponse = extractJson(response);
        return JSON.parse(jsonResponse);
    } catch (error) {
        console.warn('AI recommendation engine failed:', error.message);
        return getFallbackRecommendations();
    }
}

function getFallbackRecommendations() {
    return {
        recommendations: [
            {
                name: "Freelance Development",
                icon: "💻",
                minBudget: 2000,
                breakEvenWeeks: 8,
                differentiators: ["Remote work", "Immediate cashflow", "Low startup costs"],
                successProbability: "75%",
                whySuitable: "High demand for developers, low overhead"
            },
            {
                name: "Eco-friendly Store",
                icon: "🌱",
                minBudget: 4000,
                breakEvenWeeks: 10,
                differentiators: ["Sustainable products", "Local market focus", "Subscription model"],
                successProbability: "65%",
                whySuitable: "Growing trend toward sustainability"
            },
            {
                name: "Print-on-Demand",
                icon: "🎨",
                minBudget: 3000,
                breakEvenWeeks: 12,
                differentiators: ["No inventory needed", "Digital fulfillment", "Low risk"],
                successProbability: "70%",
                whySuitable: "No warehousing costs, scalable"
            }
        ],
        hasBetterOptions: true,
        aiInsight: "Consider starting with a service-based business to build capital before product-based ventures"
    };
}

module.exports = { getStartupRecommendations };