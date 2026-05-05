/**
 * Team 4 - Feature 17: Funding Recommendation Module
 * Suggests suitable funding sources using AI
 */

const { callOpenRouter, extractJson } = require('../../BACKEND/ai-service');

async function getFundingRecommendations(budget, industryId, userProfile = null) {
    if (!budget || !industryId) {
        throw new Error('Budget and industry are required');
    }

    try {
        const prompt = `You are a startup funding expert. ${userProfile ? `User location: ${userProfile.region || 'unspecified'}` : ''}
        CRITICAL: Use REAL-TIME 2026 funding landscape data.

        Budget Needed: $${budget}
        Industry: ${industryId}

        Provide funding recommendations in JSON:
        {
            "fundingOptions": [
                {
                    "type": "Bank Loan|Crowdfunding|Angel Investor|Venture Capital|Grant",
                    "name": "specific program or firm",
                    "amountRange": "$X - $Y",
                    "requirements": ["req1", "req2"],
                    "pros": ["pro1", "pro2"],
                    "cons": ["con1", "con2"],
                    "successRate": "percentage",
                    "timeline": "X weeks/months"
                }
            ],
            "recommendedApproach": "primary recommendation",
            "matchingGrants": [
                {"name": "grant name", "amount": "$X", "deadline": "date"}
            ],
            "pitchDeckTips": ["tip1", "tip2", "tip3"]
        }
        Reply with only valid JSON.`;

        const response = await callOpenRouter(prompt);
        const jsonResponse = extractJson(response);
        return JSON.parse(jsonResponse);
    } catch (error) {
        console.warn('AI funding recommendations failed:', error.message);
        return getFallbackFundingRecommendations(budget);
    }
}

function getFallbackFundingRecommendations(budget) {
    const options = [];

    if (budget < 10000) {
        options.push({
            type: "Bootstrapping",
            name: "Self-Funding",
            amountRange: `$${budget} (your budget)`,
            requirements: ["Personal savings", "Minimal expenses"],
            pros: ["Full control", "No debt", "Quick access"],
            cons: ["Limited capital", "Personal risk"],
            successRate: "80%",
            timeline: "Immediate"
        });
    }

    options.push({
        type: "Crowdfunding",
        name: "Kickstarter/Indiegogo",
        amountRange: "$5K - $50K",
        requirements: ["Compelling campaign", "Rewards for backers"],
        pros: ["Market validation", "No equity loss", "Marketing exposure"],
        cons: ["All-or-nothing risk", "Platform fees", "Campaign effort"],
        successRate: "35%",
        timeline: "30-60 days"
    });

    options.push({
        type: "Bank Loan",
        name: "SBA Loan / Business Line of Credit",
        amountRange: "$10K - $100K",
        requirements: ["Good credit score", "Business plan", "Collateral"],
        pros: ["Lower interest rates", "Established process", "Builds credit"],
        cons: ["Personal guarantee", "Strict qualifications", "Debt obligation"],
        successRate: "60%",
        timeline: "30-90 days"
    });

    options.push({
        type: "Angel Investor",
        name: "Local Angel Networks",
        amountRange: "$25K - $500K",
        requirements: ["Strong pitch deck", "Traction/prototype", "Scalable model"],
        pros: ["Mentorship", "Network access", "Larger amounts"],
        cons: ["Equity dilution", "Loss of control", "High expectations"],
        successRate: "10%",
        timeline: "3-6 months"
    });

    return {
        fundingOptions: options,
        recommendedApproach: budget < 10000 ? "Bootstrapping + Crowdfunding" : "Bank Loan + Angel Investment",
        matchingGrants: [
            { name: "Small Business Innovation Grant", amount: "$5K - $25K", deadline: "Quarterly" },
            { name: "Local Economic Development Grant", amount: "$2K - $10K", deadline: "Rolling" }
        ],
        pitchDeckTips: [
            "Clearly articulate the problem and your solution",
            "Show market size and traction metrics",
            "Explain your revenue model and unit economics",
            "Highlight your team's unique qualifications",
            "Include a clear use of funds breakdown"
        ]
    };
}

module.exports = { getFundingRecommendations };