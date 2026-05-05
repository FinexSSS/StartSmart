/**
 * Team 2 - Feature 7: Profit Estimation System
 * Estimates expected revenue and projected profit using AI
 */

const { callOpenRouter, extractJson } = require('../ai-service');

async function estimateProfit(budget, industryId, teamSize, monthsToRun, userProfile = null) {
    if (!budget || budget <= 0 || !industryId) {
        throw new Error('Budget and industry are required');
    }

    try {
        const prompt = `You are a financial analyst. ${userProfile ? `User: ${userProfile.firstName}, Location: ${userProfile.region || 'unspecified'}` : ''}
        CRITICAL: Use REAL-TIME 2026 market data.

        Budget: $${budget}
        Industry: ${industryId}
        Team Size: ${teamSize}
        Duration: ${monthsToRun} months

        Provide profit estimation with JSON:
        {
            "estimatedRevenue": number,
            "estimatedProfit": number,
            "profitMargin": "percentage string",
            "revenueStreams": [
                {"source": "string", "percentage": number, "description": "string"}
            ],
            "monthlyGrowthRate": "percentage string",
            "breakEvenMonth": number,
            "riskFactors": ["3-4 factors that could affect profit"],
            "optimizationTips": ["3-4 ways to increase profit"]
        }
        Reply with only valid JSON.`;

        const response = await callOpenRouter(prompt);
        const jsonResponse = extractJson(response);
        return JSON.parse(jsonResponse);
    } catch (error) {
        console.warn('AI profit estimation failed:', error.message);
        return getFallbackProfitEstimation(budget, industryId, teamSize);
    }
}

function getFallbackProfitEstimation(budget, industryId, teamSize) {
    const industryMultipliers = {
        clothing: { revenue: 2.5, profitMargin: 30 },
        food: { revenue: 3.0, profitMargin: 25 },
        youtube: { revenue: 1.8, profitMargin: 60 },
        cosmetics: { revenue: 3.5, profitMargin: 45 },
        tech: { revenue: 4.0, profitMargin: 50 }
    };

    const multiplier = industryMultipliers[industryId] || { revenue: 2.0, profitMargin: 30 };
    const estimatedRevenue = budget * multiplier.revenue;
    const estimatedProfit = estimatedRevenue * (multiplier.profitMargin / 100);

    return {
        estimatedRevenue: estimatedRevenue,
        estimatedProfit: estimatedProfit,
        profitMargin: `${multiplier.profitMargin}%`,
        revenueStreams: [
            { source: 'Primary Sales', percentage: 70, description: 'Direct product/service sales' },
            { source: 'Upselling', percentage: 20, description: 'Additional services or premium offerings' },
            { source: 'Referrals', percentage: 10, description: 'Word-of-mouth and referral bonuses' }
        ],
        monthlyGrowthRate: '8-12%',
        breakEvenMonth: 8,
        riskFactors: [
            'Market competition',
            'Customer acquisition cost',
            'Economic downturn',
            'Supply chain disruptions'
        ],
        optimizationTips: [
            'Focus on customer retention',
            'Diversify revenue streams',
            'Optimize operational efficiency',
            'Invest in digital marketing'
        ]
    };
}

module.exports = { estimateProfit };