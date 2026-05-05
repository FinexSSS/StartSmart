/**
 * Team 1 - Feature 4: Expense Breakdown Engine
 * Provides detailed cost distribution and category analysis
 */

const { callOpenRouter, extractJson } = require('../ai-service');

async function generateExpenseBreakdown(budget, industryId, teamSize, userProfile = null) {
    if (!budget || !industryId) {
        throw new Error('Budget and industry are required');
    }

    try {
        const prompt = `You are a financial analyst. ${userProfile ? `User location: ${userProfile.region || 'unspecified'}` : ''}
        CRITICAL: Use REAL-TIME 2026 pricing data.

        Industry: ${industryId}
        Budget: $${budget}
        Team Size: ${teamSize}

        Provide a detailed expense breakdown with percentages and amounts:
        {
            "categories": [
                {
                    "category": "expense category name",
                    "amount": number,
                    "percentage": number (0-100),
                    "description": "what this expense covers",
                    "isMonthly": boolean,
                    "priority": "High|Medium|Low"
                }
            ],
            "oneTimeExpenses": number,
            "recurringExpenses": number,
            "totalBreakdown": {
                "personnel": number,
                "equipment": number,
                "marketing": number,
                "operations": number,
                "licensing": number,
                "miscellaneous": number
            }
        }
        Reply with only valid JSON.`;

        const response = await callOpenRouter(prompt);
        const jsonResponse = extractJson(response);
        return JSON.parse(jsonResponse);
    } catch (error) {
        console.warn('AI expense breakdown failed:', error.message);
        return getFallbackExpenseBreakdown(budget, industryId, teamSize);
    }
}

function getFallbackExpenseBreakdown(budget, industryId, teamSize) {
    // Basic expense breakdown without AI
    const personnelMonthly = teamSize * (industryId === 'food' ? 2500 : industryId === 'clothing' ? 2000 : 1500);
    const equipmentOneTime = budget * 0.15;
    const marketingMonthly = budget * 0.1;
    const operationsMonthly = budget * 0.05;

    return {
        categories: [
            {
                category: 'Personnel',
                amount: personnelMonthly,
                percentage: 40,
                description: 'Team salaries and benefits',
                isMonthly: true,
                priority: 'High'
            },
            {
                category: 'Equipment',
                amount: equipmentOneTime,
                percentage: 15,
                description: 'Hardware, tools, and setup costs',
                isMonthly: false,
                priority: 'High'
            },
            {
                category: 'Marketing',
                amount: marketingMonthly,
                percentage: 20,
                description: 'Advertising, branding, and customer acquisition',
                isMonthly: true,
                priority: 'Medium'
            },
            {
                category: 'Operations',
                amount: operationsMonthly,
                percentage: 10,
                description: 'Rent, utilities, insurance, legal fees',
                isMonthly: true,
                priority: 'Medium'
            },
            {
                category: 'Licensing & Compliance',
                amount: 1000,
                percentage: 5,
                description: 'Business registration, permits, certifications',
                isMonthly: false,
                priority: 'High'
            },
            {
                category: 'Miscellaneous',
                amount: 500,
                percentage: 10,
                description: 'Contingency and unforeseen expenses',
                isMonthly: false,
                priority: 'Low'
            }
        ],
        oneTimeExpenses: equipmentOneTime + 1500,
        recurringExpenses: personnelMonthly + marketingMonthly + operationsMonthly,
        totalBreakdown: {
            personnel: personnelMonthly,
            equipment: equipmentOneTime,
            marketing: marketingMonthly,
            operations: operationsMonthly,
            licensing: 1000,
            miscellaneous: 500
        }
    };
}

module.exports = { generateExpenseBreakdown };