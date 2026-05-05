/**
 * Team 1 - Feature 2: Industry Selection Module
 * Manages industry selection with AI-enhanced data
 */

const { callOpenRouter, extractJson } = require('../ai-service');

const INDUSTRIES = {
    clothing: {
        id: "clothing",
        name: "Clothing & Fashion",
        icon: "👗",
        description: "Start your own clothing brand or boutique",
        minBudget: 5000
    },
    food: {
        id: "food",
        name: "Food & Restaurant",
        icon: "🍕",
        description: "Launch a food business, restaurant, or catering service",
        minBudget: 8000
    },
    youtube: {
        id: "youtube",
        name: "YouTube / Content Creation",
        icon: "🎬",
        description: "Start a YouTube channel or content creation business",
        minBudget: 2000
    },
    cosmetics: {
        id: "cosmetics",
        name: "Cosmetics & Beauty",
        icon: "💄",
        description: "Launch your own beauty or skincare brand",
        minBudget: 6000
    },
    tech: {
        id: "tech",
        name: "Technology & Software",
        icon: "💻",
        description: "Build a SaaS product or tech startup",
        minBudget: 10000
    }
};

async function getIndustryData(industryId, budget, userProfile = null) {
    if (!INDUSTRIES[industryId]) {
        throw new Error(`Industry ${industryId} not found`);
    }

    const industry = INDUSTRIES[industryId];

    // Check if budget is sufficient
    if (budget < industry.minBudget) {
        return {
            industry: industry,
            isBudgetSufficient: false,
            budgetGap: industry.minBudget - budget,
            suggestions: await getAlternativeIndustries(budget, userProfile)
        };
    }

    // Get AI-enhanced industry data
    try {
        const aiData = await getAIIndustryEnhancement(industryId, budget, userProfile);
        return {
            industry: { ...industry, ...aiData },
            isBudgetSufficient: true,
            budgetGap: 0,
            aiEnhanced: true
        };
    } catch (error) {
        console.warn('AI enhancement failed, using fallback:', error.message);
        return {
            industry: industry,
            isBudgetSufficient: true,
            budgetGap: 0,
            aiEnhanced: false
        };
    }
}

async function getAIIndustryEnhancement(industryId, budget, userProfile) {
    const industry = INDUSTRIES[industryId];
    const userContext = userProfile ? `User: ${userProfile.firstName} ${userProfile.lastName}, Location: ${userProfile.region || 'unspecified'}` : '';

    const prompt = `
    You are a market research analyst. ${userContext}
    CRITICAL: Use web search for REAL-TIME 2026 data.

    Industry: ${industry.name}
    Budget: $${budget}

    Provide JSON with REAL 2026 market data:
    {
        "description": "Current 2026 market overview",
        "trends2026": ["3-4 current trends"],
        "avgStartupCost": number,
        "successRate": "percentage",
        "timeToProfit": "X-Y months",
        "keyExpenses": [
            {"category": "string", "percentage": number}
        ],
        "recommendedTools": ["3-4 specific tools with 2026 pricing"],
        "competitorLandscape": "brief description"
    }
    Reply with only valid JSON.`;

    try {
        const response = await callOpenRouter(prompt);
        const jsonResponse = extractJson(response);
        return JSON.parse(jsonResponse);
    } catch (error) {
        throw new Error(`AI enhancement failed: ${error.message}`);
    }
}

async function getAlternativeIndustries(budget, userProfile) {
    const prompt = `
    You are a startup consultant. ${userProfile ? `User location: ${userProfile.region || 'unspecified'}` : ''}
    CRITICAL: Use web search for REAL-TIME 2026 opportunities.

    Budget: $${budget}

    Suggest 5 industries that are viable with this budget in 2026:
    {
        "suggestions": [
            {
                "name": "Industry Name",
                "icon": "emoji",
                "reason": "why viable",
                "minBudget": number,
                "timeToLaunch": "X weeks"
            }
        ]
    }
    Reply with only valid JSON.`;

    try {
        const response = await callOpenRouter(prompt);
        const jsonResponse = extractJson(response);
        const data = JSON.parse(jsonResponse);
        return data.suggestions || [];
    } catch (error) {
        // Fallback suggestions
        return [
            { name: "YouTube Content Creation", icon: "🎬", reason: "Low barrier to entry", minBudget: 2000, timeToLaunch: "2-4 weeks" },
            { name: "Freelance Services", icon: "💼", reason: "Service-based, minimal overhead", minBudget: 1000, timeToLaunch: "1-2 weeks" },
            { name: "Dropshipping", icon: "📦", reason: "No inventory needed", minBudget: 3000, timeToLaunch: "2-3 weeks" }
        ];
    }
}

async function getIndustrySuggestions(budget, userProfile = null) {
    const suggestions = [];
    for (const [id, industry] of Object.entries(INDUSTRIES)) {
        if (industry.minBudget <= budget) {
            suggestions.push({ ...industry, isAffordable: true });
        } else {
            suggestions.push({ ...industry, isAffordable: false, budgetGap: industry.minBudget - budget });
        }
    }
    return suggestions;
}

module.exports = {
    getIndustryData,
    getIndustrySuggestions,
    getAlternativeIndustries,
    INDUSTRIES
};