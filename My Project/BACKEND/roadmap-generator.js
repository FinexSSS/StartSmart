/**
 * Team 2 - Feature 10: Roadmap Generator
 * Provides step-by-step startup guide using AI
 */

const { callOpenRouter, extractJson } = require('../ai-service');

async function generateRoadmap(industryId, budget, monthsToRun, userProfile = null) {
    if (!industryId || !budget) {
        throw new Error('Industry and budget are required');
    }

    try {
        const prompt = `You are a startup consultant. ${userProfile ? `User: ${userProfile.firstName}, Location: ${userProfile.region || 'unspecified'}` : ''}
        CRITICAL: Use REAL-TIME 2026 data.

        Industry: ${industryId}
        Budget: $${budget}
        Duration: ${monthsToRun} months

        Generate a step-by-step roadmap:
        {
            "overview": "brief roadmap summary",
            "totalDuration": "X months",
            "milestones": [
                {
                    "step": number,
                    "title": "step title",
                    "description": "what to do",
                    "duration": "X weeks",
                    "cost": number,
                    "priority": "High|Medium|Low",
                    "dependencies": ["step X", "step Y"],
                    "deliverables": ["list of outputs"]
                }
            ],
            "criticalPath": ["step numbers in order"],
            "budgetAllocation": [
                {"phase": "phase name", "percentage": number, "amount": number}
            ]
        }
        Reply with only valid JSON.`;

        const response = await callOpenRouter(prompt);
        const jsonResponse = extractJson(response);
        return JSON.parse(jsonResponse);
    } catch (error) {
        console.warn('AI roadmap generation failed:', error.message);
        return getFallbackRoadmap(industryId, budget, monthsToRun);
    }
}

function getFallbackRoadmap(industryId, budget, monthsToRun) {
    const monthlyBudget = budget / monthsToRun;

    return {
        overview: `A ${monthsToRun}-month roadmap to launch your ${industryId} business with $${budget} budget`,
        totalDuration: `${monthsToRun} months`,
        milestones: [
            {
                step: 1,
                title: "Market Research",
                description: "Research target audience, competitors, and market gaps",
                duration: "2 weeks",
                cost: monthlyBudget * 0.1,
                priority: "High",
                dependencies: [],
                deliverables: ["Market research report", "Competitor analysis"]
            },
            {
                step: 2,
                title: "Business Setup",
                description: "Legal registration, permits, and basic infrastructure",
                duration: "2 weeks",
                cost: monthlyBudget * 0.15,
                priority: "High",
                dependencies: ["Step 1"],
                deliverables: ["Business registration", "Tax ID", "Basic website"]
            },
            {
                step: 3,
                title: "Product/Service Development",
                description: "Create MVP or initial service offering",
                duration: "4 weeks",
                cost: monthlyBudget * 0.3,
                priority: "High",
                dependencies: ["Step 2"],
                deliverables: ["MVP product", "Service packages", "Pricing strategy"]
            },
            {
                step: 4,
                title: "Marketing Launch",
                description: "Initial marketing campaigns and brand awareness",
                duration: "3 weeks",
                cost: monthlyBudget * 0.25,
                priority: "Medium",
                dependencies: ["Step 3"],
                deliverables: ["Marketing materials", "Social media presence", "First customers"]
            },
            {
                step: 5,
                title: "Operations Optimization",
                description: "Streamline processes and improve efficiency",
                duration: "3 weeks",
                cost: monthlyBudget * 0.2,
                priority: "Medium",
                dependencies: ["Step 4"],
                deliverables: ["Standard operating procedures", "Customer feedback system"]
            }
        ],
        criticalPath: [1, 2, 3, 4, 5],
        budgetAllocation: [
            { phase: "Planning", percentage: 10, amount: budget * 0.1 },
            { phase: "Setup", percentage: 15, amount: budget * 0.15 },
            { phase: "Development", percentage: 30, amount: budget * 0.3 },
            { phase: "Launch", percentage: 25, amount: budget * 0.25 },
            { phase: "Operations", percentage: 20, amount: budget * 0.2 }
        ]
    };
}

module.exports = { generateRoadmap };