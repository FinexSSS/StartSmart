/**
 * Team 1 - Feature 1: Budget Input Module
 * Handles budget input validation and processing
 * Uses AI for budget optimization suggestions
 */

const { callOpenRouter, extractJson } = require('../ai-service');

const BUDGET_RANGES = {
    LOW: { min: 0, max: 5000 },
    MEDIUM: { min: 5001, max: 20000 },
    HIGH: { min: 20001, max: 1000000 }
};

async function validateBudget(budget, userProfile = null) {
    if (!budget || budget <= 0) {
        throw new Error('Budget must be greater than 0');
    }

    const range = getBudgetRange(budget);
    const validation = {
        isValid: true,
        range: range,
        budget: budget,
        recommendations: []
    };

    // AI-powered budget optimization
    try {
        const aiSuggestions = await getBudgetOptimization(budget, range, userProfile);
        validation.recommendations = aiSuggestions;
    } catch (error) {
        console.warn('AI budget optimization failed, using fallback:', error.message);
        validation.recommendations = getFallbackRecommendations(budget, range);
    }

    return validation;
}

function getBudgetRange(budget) {
    if (budget <= BUDGET_RANGES.LOW.max) return 'LOW';
    if (budget <= BUDGET_RANGES.MEDIUM.max) return 'MEDIUM';
    return 'HIGH';
}

async function getBudgetOptimization(budget, range, userProfile) {
    const userContext = userProfile ? `User location: ${userProfile.region || 'unspecified'}, Industry preference: ${userProfile.industryPreference || 'none'}` : 'No user profile provided';

    const prompt = `
    You are a startup financial consultant. ${userContext}
    CRITICAL: Use web search for REAL-TIME 2026 market conditions.

    Budget: $${budget} (Category: ${range})

    Provide JSON optimization suggestions:
    {
        "budgetCategory": "${range}",
        "optimizationTips": ["3-5 specific actionable tips"],
        "commonPitfalls": ["3-4 mistakes to avoid"],
        "realisticExpectations": "2-3 sentences",
        "successRate": "Low|Medium|High",
        "prioritySpending": ["Top 3 critical expenses"],
        "costSavingOpportunities": ["3-4 ways to reduce costs"]
    }
    Reply with only valid JSON.`;

    try {
        const response = await callOpenRouter(prompt);
        const jsonResponse = extractJson(response);
        return JSON.parse(jsonResponse);
    } catch (error) {
        console.warn('AI optimization failed:', error.message);
        return getFallbackRecommendations(budget, range);
    }
}

function getFallbackRecommendations(budget, range) {
    const recommendations = {
        budgetCategory: range,
        optimizationTips: [
            'Prioritize essential expenses over nice-to-have features',
            'Start with MVP (Minimum Viable Product) approach',
            'Leverage free/low-cost digital tools and platforms',
            'Consider bootstrapping and reinvesting early profits'
        ],
        commonPitfalls: [
            'Underestimating operational costs',
            'Overspending on marketing before product-market fit',
            'Ignoring legal and licensing requirements',
            'Hiring too many people too early'
        ],
        realisticExpectations: `With a $${budget} budget in the ${range} category, focus on lean operations and gradual scaling. Success depends on execution quality and market timing.`,
        successRate: range === 'HIGH' ? 'High' : range === 'MEDIUM' ? 'Medium' : 'Low',
        prioritySpending: [
            'Product development or service setup',
            'Essential tools and infrastructure',
            'Initial marketing and customer acquisition'
        ],
        costSavingOpportunities: [
            'Use open-source software instead of paid alternatives',
            'Remote work to avoid office rental costs',
            'Freelancers instead of full-time hires initially',
            'DIY marketing through social media and content'
        ]
    };

    return recommendations;
}

module.exports = {
    validateBudget,
    getBudgetRange,
    BUDGET_RANGES
};