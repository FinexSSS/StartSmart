/**
 * Team 1 - Feature 3: Feasibility Calculator
 * Calculates startup feasibility using AI analysis
 */

const { callOpenRouter, extractJson } = require('../ai-service');

async function calculateFeasibility(budget, industry, teamSize, monthsToRun, userProfile = null) {
    // Validate inputs
    if (!budget || budget <= 0 || !industry || !teamSize || monthsToRun <= 0) {
        throw new Error('Invalid input parameters');
    }

    // Get industry data
    const industryData = await getIndustryData(industry, budget, userProfile);

    // AI-powered feasibility calculation
    const prompt = `You are a startup feasibility analyst. ${userProfile ? `User: ${userProfile.firstName}, Location: ${userProfile.region || 'unspecified'}' : ''}
    CRITICAL: Use REAL-TIME 2026 market data.

    Budget: $${budget}
    Industry: ${industry}
    Team Size: ${teamSize} people
    Duration: ${monthsToRun} months

    Calculate:
    1. Feasibility score (0-100)
    2. Estimated profit
    3. Break-even month
    4. Risk level (Low/Medium/High)
    5. AI recommendations (2-4 actionable steps)

    Return only valid JSON.`;

    try {
        const response = await callOpenRouter(prompt);
        const jsonResponse = extractJson(response);
        return JSON.parse(jsonResponse);
    } catch (error) {
        console.error('AI feasibility calculation failed:', error.message);
        return getFallbackFeasibility(budget, industry, teamSize, monthsToRun);
    }
}

function getFallbackFeasibility(budget, industry, teamSize, monthsToRun) {
    // Basic feasibility calculation without AI
    const totalEstimatedCosts = calculateEstimatedCosts(budget, industry, teamSize, monthsToRun);
    const feasibilityScore = (budget / totalEstimatedCosts) * 100;
    const profitEstimate = (budget - totalEstimatedCosts) * 1.5;

    return {
        feasibilityScore: feasibilityScore > 70 ? 'High' : feasibilityScore > 40 ? 'Medium' : 'Low',
        estimatedProfit: profitEstimate > 0 ? profitEstimate : 0,
        breakEvenMonth: Math.max(3, Math.min(12, (budget / totalEstimatedCosts) * monthsToRun)),
        riskLevel: 'Medium',
        recommendations: []
    };
}

async function getIndustryData(industry, budget, userProfile) {
    // This should integrate with teammate1's industry module
    return require('./industry-selection').getIndustryData(industry, budget, userProfile);
}

module.exports = { calculateFeasibility };