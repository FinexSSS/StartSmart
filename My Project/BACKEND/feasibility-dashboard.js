/**
 * Team 2 - Feature 9: Feasibility Dashboard
 * Shows overall feasibility status, costs, profits, and budget gaps
 */

const { callOpenRouter, extractJson } = require('../ai-service');

async function generateFeasibilityDashboard(budget, industryId, teamSize, userProfile = null) {
    if (!budget || !industryId) {
        throw new Error('Budget and industry are required');
    }

    try {
        const prompt = `You are a startup feasibility analyst. ${userProfile ? `User location: ${userProfile.region || 'unspecified'}` : ''}
        CRITICAL: Use REAL-TIME 2026 market data.

        Budget: $${budget}
        Industry: ${industryId}
        Team Size: ${teamSize}

        Generate dashboard data:
        {
            "feasibilityScore": number (0-100),
            "status": "Feasible|Not Feasible|Marginal",
            "totalCost": number,
            "budgetGap": number,
            "surplus": number,
            "estimatedProfit": number,
            "riskLevel": "Low|Medium|High",
            "keyMetrics": [
                {"label": "Total Expenses", "value": "$number", "type": "expense"},
                {"label": "Monthly Burn", "value": "$number", "type": "expense"},
                {"label": "Runway", "value": "X months", "type": "time"},
                {"label": "ROI", "value": "X%", "type": "profit"}
            ],
            "recommendations": ["2-3 specific actions"],
            "visualIndicators": {
                "statusColor": "green|red|yellow",
                "progressPercentage": "number"
            }
        }
        Reply with only valid JSON.`;

        const response = await callOpenRouter(prompt);
        const jsonResponse = extractJson(response);
        return JSON.parse(jsonResponse);
    } catch (error) {
        console.warn('AI dashboard generation failed:', error.message);
        return getFallbackDashboard(budget, industryId, teamSize);
    }
}

function getFallbackDashboard(budget, industryId, teamSize) {
    const estimatedCost = budget * 0.8;
    const feasibilityScore = Math.min(100, (budget / estimatedCost) * 100);
    const isFeasible = feasibilityScore > 70;

    return {
        feasibilityScore: feasibilityScore,
        status: isFeasible ? "Feasible" : feasibilityScore > 40 ? "Marginal" : "Not Feasible",
        totalCost: estimatedCost,
        budgetGap: isFeasible ? 0 : estimatedCost - budget,
        surplus: isFeasible ? budget - estimatedCost : 0,
        estimatedProfit: isFeasible ? budget * 0.3 : 0,
        riskLevel: feasibilityScore > 70 ? "Low" : feasibilityScore > 40 ? "Medium" : "High",
        keyMetrics: [
            { label: "Total Expenses", value: `$${estimatedCost.toLocaleString()}`, type: "expense" },
            { label: "Monthly Burn", value: `$${(estimatedCost / 12).toLocaleString()}`, type: "expense" },
            { label: "Runway", value: `${Math.floor(budget / (estimatedCost / 12))} months`, type: "time" },
            { label: "ROI", value: `${feasibilityScore}%`, type: "profit" }
        ],
        recommendations: isFeasible ?
            ["Proceed with current plan", "Monitor monthly burn closely", "Reinvest profits into growth"] :
            ["Increase budget or reduce costs", "Consider alternative industries", "Start with MVP approach"],
        visualIndicators: {
            statusColor: isFeasible ? "green" : feasibilityScore > 40 ? "yellow" : "red",
            progressPercentage: feasibilityScore
        }
    };
}

module.exports = { generateFeasibilityDashboard };