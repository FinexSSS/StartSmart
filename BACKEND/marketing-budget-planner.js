/**
 * Team 4 - Feature 19: Marketing Budget Planner
 * Estimates marketing expenses based on industry and strategy using AI
 */

const { callOpenRouter, extractJson } = require('../../BACKEND/ai-service');

async function planMarketingBudget(budget, industryId, strategy = 'balanced', userProfile = null) {
    if (!budget || !industryId) {
        throw new Error('Budget and industry are required');
    }

    try {
        const prompt = `You are a marketing budget expert. ${userProfile ? `User location: ${userProfile.region || 'unspecified'}` : ''}
        CRITICAL: Use REAL-TIME 2026 marketing costs and platforms.

        Total Budget: $${budget}
        Industry: ${industryId}
        Strategy: ${strategy}

        Provide marketing budget plan in JSON:
        {
            "totalMarketingBudget": number,
            "strategy": "${strategy}",
            "channels": [
                {
                    "channel": "Social Media|SEO|Content|PPC|Email|Influencer",
                    "budget": number,
                    "percentage": number,
                    "expectedROI": "X%",
                    "timeline": "X weeks",
                    "kpi": "key metric"
                }
            ],
            "monthlyBreakdown": [
                {"month": 1, "spend": number, "focus": "activity"}
            ],
            "costSavingTips": ["tip1", "tip2", "tip3"],
            "platformRecommendations": [
                {"platform": "Facebook|Instagram|TikTok", "budget": number, "reason": "why"}
            ]
        }
        Reply with only valid JSON.`;

        const response = await callOpenRouter(prompt);
        const jsonResponse = extractJson(response);
        return JSON.parse(jsonResponse);
    } catch (error) {
        console.warn('AI marketing budget planning failed:', error.message);
        return getFallbackMarketingBudget(budget, industryId, strategy);
    }
}

function getFallbackMarketingBudget(budget, industryId, strategy) {
    const marketingPercentage = strategy === 'aggressive' ? 0.3 : strategy === 'conservative' ? 0.1 : 0.15;
    const totalMarketing = budget * marketingPercentage;

    const channels = [
        {
            channel: 'Social Media',
            budget: totalMarketing * 0.4,
            percentage: 40,
            expectedROI: '150%',
            timeline: '2-4 weeks',
            kpi: 'Engagement Rate'
        },
        {
            channel: 'Content Marketing',
            budget: totalMarketing * 0.25,
            percentage: 25,
            expectedROI: '200%',
            timeline: '4-8 weeks',
            kpi: 'Organic Traffic'
        },
        {
            channel: 'Influencer',
            budget: totalMarketing * 0.2,
            percentage: 20,
            expectedROI: '300%',
            timeline: '1-3 weeks',
            kpi: 'Conversions'
        },
        {
            channel: 'Email Marketing',
            budget: totalMarketing * 0.15,
            percentage: 15,
            expectedROI: '500%',
            timeline: 'Immediate',
            kpi: 'Open Rate'
        }
    ];

    return {
        totalMarketingBudget: totalMarketing,
        strategy: strategy,
        channels: channels,
        monthlyBreakdown: Array.from({ length: 6 }, (_, i) => ({
            month: i + 1,
            spend: totalMarketing / 6,
            focus: i < 2 ? 'Brand Awareness' : i < 4 ? 'Lead Generation' : 'Customer Retention'
        })),
        costSavingTips: [
            'Leverage user-generated content',
            'Focus on organic social media growth',
            'Use free marketing tools initially',
            'Partner with micro-influencers for better ROI'
        ],
        platformRecommendations: [
            { platform: 'Instagram', budget: totalMarketing * 0.3, reason: 'Visual platform for products' },
            { platform: 'TikTok', budget: totalMarketing * 0.25, reason: 'Growing platform with high engagement' },
            { platform: 'Facebook', budget: totalMarketing * 0.2, reason: 'Broad reach and targeting options' },
            { platform: 'YouTube', budget: totalMarketing * 0.25, reason: 'Long-form content and tutorials' }
        ]
    };
}

module.exports = { planMarketingBudget };