/**
 * Team 4 - Feature 16: Break-Even Analysis Module
 * Calculates break-even point using AI
 */

const { callOpenRouter, extractJson } = require('../../BACKEND/ai-service');

async function calculateBreakEven(budget, industryId, teamSize, userProfile = null) {
    if (!budget || !industryId) {
        throw new Error('Budget and industry are required');
    }

    try {
        const prompt = `You are a financial analyst. ${userProfile ? `User location: ${userProfile.region || 'unspecified'}` : ''}
        CRITICAL: Use REAL-TIME 2026 market data.

        Budget: $${budget}
        Industry: ${industryId}
        Team Size: ${teamSize}

        Calculate break-even analysis in JSON:
        {
            "breakEvenPoint": {
                "month": number,
                "units": number,
                "revenue": number
            },
            "fixedCosts": number,
            "variableCostsPerUnit": number,
            "sellingPricePerUnit": number,
            "contributionMargin": number,
            "breakEvenAnalysis": {
                "monthsToBreakEven": number,
                "confidenceLevel": "High|Medium|Low",
                "riskFactors": ["factor1", "factor2"]
            },
            "scenarios": {
                "optimistic": {"month": number, "revenue": number},
                "realistic": {"month": number, "revenue": number},
                "pessimistic": {"month": number, "revenue": number}
            },
            "cashFlowProjection": [
                {"month": 1, "revenue": number, "expenses": number, "net": number}
            ]
        }
        Reply with only valid JSON.`;

        const response = await callOpenRouter(prompt);
        const jsonResponse = extractJson(response);
        return JSON.parse(jsonResponse);
    } catch (error) {
        console.warn('AI break-even analysis failed:', error.message);
        return getFallbackBreakEven(budget, industryId, teamSize);
    }
}

function getFallbackBreakEven(budget, industryId, teamSize) {
    const monthlyBurn = (budget * 0.1) + (teamSize * 2000);
    const monthlyRevenue = monthlyBurn * 1.3; // 30% profit margin
    const breakEvenMonth = Math.ceil(budget / (monthlyRevenue - monthlyBurn));

    const cashFlow = [];
    let cumulative = -budget;

    for (let i = 1; i <= 12; i++) {
        const revenue = i <= breakEvenMonth ? monthlyRevenue * (i / breakEvenMonth) : monthlyRevenue;
        const expenses = monthlyBurn;
        const net = revenue - expenses;
        cumulative += net;

        cashFlow.push({
            month: i,
            revenue: Math.round(revenue),
            expenses: Math.round(expenses),
            net: Math.round(net),
            cumulative: Math.round(cumulative)
        });
    }

    return {
        breakEvenPoint: {
            month: breakEvenMonth,
            units: Math.round(breakEvenMonth * monthlyRevenue / 100),
            revenue: Math.round(breakEvenMonth * monthlyRevenue)
        },
        fixedCosts: budget * 0.4,
        variableCostsPerUnit: 10,
        sellingPricePerUnit: 25,
        contributionMargin: 15,
        breakEvenAnalysis: {
            monthsToBreakEven: breakEvenMonth,
            confidenceLevel: 'Medium',
            riskFactors: [
                'Market adoption rate',
                'Pricing strategy effectiveness',
                'Customer acquisition cost'
            ]
        },
        scenarios: {
            optimistic: { month: Math.max(1, Math.floor(breakEvenMonth * 0.7)), revenue: Math.round(monthlyRevenue * 1.2) },
            realistic: { month: breakEvenMonth, revenue: Math.round(monthlyRevenue) },
            pessimistic: { month: Math.ceil(breakEvenMonth * 1.3), revenue: Math.round(monthlyRevenue * 0.8) }
        },
        cashFlowProjection: cashFlow
    };
}

module.exports = { calculateBreakEven };