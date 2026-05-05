/**
 * Team 3 - Feature 12: Analytics Module
 * Visual analysis of costs, revenue projections, and profit trends
 */

const { callOpenRouter, extractJson } = require('../../BACKEND/ai-service');

async function generateAnalyticsData(industryId, budget, monthsToRun = 12, userProfile = null) {
    if (!industryId || !budget) {
        throw new Error('Industry and budget are required');
    }

    try {
        const prompt = `You are a data analyst. ${userProfile ? `User location: ${userProfile.region || 'unspecified'}` : ''}
        CRITICAL: Use REAL-TIME 2026 economic data.

        Industry: ${industryId}
        Budget: $${budget}
        Analysis Period: ${monthsToRun} months

        Generate JSON analytics data:
        {
            "costProjection": {
                "monthly_expenses": [number],
                "total_expenses": number,
                "expenseBreakdown": {
                    "personnel": percentage,
                    "operations": percentage,
                    "marketing": percentage
                }
            },
            "revenueProjection": {
                "monthly_revenue": [number],
                "total_revenue": number,
                "growth_rate": "X%-Y%-Z%"
            },
            "profitAnalysis": {
                "break_even_point": "X month",
                "estimated_profit": number,
                "profit_margin": "percentage",
                "risk_analysis": {
                    "high_risk_months": ["month names"],
                    "low_risk_months": ["month names"],
                    "mitigation_strategies": ["strategy X", "strategy Y"]
                }
            },
            "visualTrendData": {
                "charts": [
                    {"type": "bar", "title": "Revenue vs Expenses", "xaxis": "Month", "series": [{"name": "Revenue", "data": [numbers]}, {"name": "Expenses", "data": [numbers]}]},
                    {"type": "line", "title": "Profit Margin", "xaxis": "Month", "series": [{"name": "Profit Margin", "data": [numbers]}]}
                ]
            },
            "keyMetrics": [
                {"metric": "Cash Flow Position", "value": "$X", "timestamp": "2026-05-05T15:30:00Z"},
                {"metric": "User Engagement Score", "value": "X/10", "timestamp": "2026-05-05T15:25:00Z"}
            ]
        }
        Reply with only valid JSON.`;

        const response = await callOpenRouter(prompt);
        const jsonResponse = extractJson(response);
        return JSON.parse(jsonResponse);
    } catch (error) {
        console.warn('AI analytics generation failed:', error.message);
        return getFallbackAnalytics();
    }
}

function getFallbackAnalytics() {
    return {
        costProjection: {
            monthly_expenses: [2000, 2100, 2200, 2300, 2400, 2500, 2600, 2700, 2800, 2900, 3000, 3100],
            total_expenses: 28900,
            expenseBreakdown: {
                personnel: 45,
                operations: 35,
                marketing: 20
            }
        },
        revenueProjection: {
            monthly_revenue: [3000, 3100, 3300, 3500, 3700, 4000, 4500, 5000, 5500, 6000, 6500, 7000],
            total_revenue: 49300,
            growth_rate: "12% Growth"
        },
        profitAnalysis: {
            break_even_point: "Month 8",
            estimated_profit: 12400,
            profit_margin: "25%",
            risk_analysis: {
                high_risk_months: ["Months 1-6"],
                low_risk_months: ["Months 9-12"],
                mitigation_strategies: ["Cash reserve building", "Cost optimization", "Diversification"]
            }
        },
        visualTrendData: {
            charts: [
                {
                    type: "bar",
                    title: "Revenue vs Expenses",
                    xaxis: "Month",
                    series: [
                        {name: "Revenue", data: [3000, 3100, 3300, 3500, 3700, 4000, 4500, 5000, 5500, 6000, 6500, 7000]},
                        {name: "Expenses", data: [2000, 2100, 2200, 2300, 2400, 2500, 2600, 2700, 2800, 2900, 3000, 3100]}
                    ]
                },
                {
                    type: "line",
                    title: "Profit Margin",
                    xaxis: "Month",
                    series: [
                        {name: "Profit Margin", data: [5, 5, 6, 7, 8, 9, 10, 12, 13, 14, 15, 16]}
                    ]
                }
            ]
        },
        keyMetrics: [
            {metric: "Cash Flow Position", value: "$12,400", timestamp: "2026-05-05T15:30:00Z"},
            {metric: "User Engagement Score", value: "8.5/10", timestamp: "2026-05-05T15:25:00Z"}
        ]
    };
}

module.exports = { generateAnalyticsData };