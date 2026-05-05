/**
 * Team 3 - Feature 13: Resource Requirements Module
 * Displays required equipment, tools, services, and operational resources
 */

const { callOpenRouter, extractJson } = require('../ai-service');

async function getResourceRequirements(industryId, budget, userProfile = null) {
    if (!industryId || !budget) {
        throw new Error('Industry and budget are required');
    }

    try {
        const prompt = `You are an operations manager. ${userProfile ? `User location: ${userProfile.region || 'unspecified'}` : ''}
        CRITICAL: Use REAL-TIME 2026 pricing and availability data.

        Industry: ${industryId}
        Budget: $${budget}

        Provide resource requirements in JSON:
        {
            "essentialResources": [
                {
                    "name": "resource name",
                    "type": "equipment|service|software|personnel",
                    "description": "what it's used for",
                    "cost": {
                        "oneTime": number,
                        "monthly": number
                    },
                    "essential": boolean,
                    "recommendedVendor": "specific company name"
                }
            ],
            "optionalResources": [
                {
                    "name": "resource name",
                    "type": "equipment|service|software|personnel",
                    "description": "what it's used for",
                    "cost": {
                        "oneTime": number,
                        "monthly": number
                    },
                    "essential": boolean,
                    "recommendedVendor": "specific company name"
                }
            ],
            "totalCosts": {
                "oneTime": number,
                "monthly": number
            },
            "vendorRecommendations": {
                "bestForEquipment": "company name",
                "bestForSoftware": "company name",
                "bestForServices": "company name"
            }
        }
        Reply with only valid JSON.`;

        const response = await callOpenRouter(prompt);
        const jsonResponse = extractJson(response);
        return JSON.parse(jsonResponse);
    } catch (error) {
        console.warn('AI resource requirements failed:', error.message);
        return getFallbackResourceRequirements(industryId, budget);
    }
}

function getFallbackResourceRequirements(industryId, budget) {
    const resourcesMap = {
        clothing: {
            essential: [
                { name: "Industrial Sewing Machine", type: "equipment", description: "For production", cost: { oneTime: 350, monthly: 0 }, essential: true, recommendedVendor: "Brother Industrial" },
                { name: "Shopify Store", type: "software", description: "E-commerce platform", cost: { oneTime: 0, monthly: 39 }, essential: true, recommendedVendor: "Shopify" },
                { name: "Photography Studio Rental", type: "service", description: "Product photoshoots", cost: { oneTime: 0, monthly: 200 }, essential: true, recommendedVendor: "Local Studios" }
            ],
            optional: [
                { name: "Heat Press Machine", type: "equipment", description: "For custom prints", cost: { oneTime: 250, monthly: 0 }, essential: false, recommendedVendor: "Swing Design" },
                { name: "Fashion Designer", type: "personnel", description: "Freelance designer", cost: { oneTime: 0, monthly: 2000 }, essential: false, recommendedVendor: "Upwork" }
            ]
        },
        food: {
            essential: [
                { name: "Commercial Kitchen Space", type: "service", description: "Shared or private kitchen rental", cost: { oneTime: 0, monthly: 1200 }, essential: true, recommendedVendor: "Kitchen United" },
                { name: "POS System", type: "software", description: "Point of sale + inventory", cost: { oneTime: 200, monthly: 60 }, essential: true, recommendedVendor: "Square" },
                { name: "Food Safety Certification", type: "service", description: "Required by law", cost: { oneTime: 300, monthly: 0 }, essential: true, recommendedVendor: "ServSafe" }
            ],
            optional: [
                { name: "Delivery Platform Fee", type: "service", description: "UberEats, DoorDash listing", cost: { oneTime: 0, monthly: 150 }, essential: false, recommendedVendor: "DoorDash" },
                { name: "Line Cook", type: "personnel", description: "Full-time kitchen staff", cost: { oneTime: 0, monthly: 2500 }, essential: true, recommendedVendor: "Indeed" }
            ]
        }
    };

    const resources = resourcesMap[industryId] || {
        essential: [
            { name: "Laptop Computer", type: "equipment", description: "Work computer", cost: { oneTime: 1200, monthly: 0 }, essential: true, recommendedVendor: "Dell" },
            { name: "Business Software Suite", type: "software", description: "Office and accounting", cost: { oneTime: 0, monthly: 50 }, essential: true, recommendedVendor: "Microsoft 365" },
            { name: "Business Registration", type: "service", description: "Legal setup", cost: { oneTime: 150, monthly: 0 }, essential: true, recommendedVendor: "LegalZoom" }
        ],
        optional: [
            { name: "Desk Chair", type: "equipment", description: "Ergonomic seating", cost: { oneTime: 150, monthly: 0 }, essential: false, recommendedVendor: "Herman Miller" },
            { name: "Marketing Consultant", type: "personnel", description: "Part-time marketing help", cost: { oneTime: 0, monthly: 1000 }, essential: false, recommendedVendor: "Fiverr" }
        ]
    };

    const oneTimeTotal = [...resources.essential, ...resources.optional].reduce((sum, r) => sum + r.cost.oneTime, 0);
    const monthlyTotal = [...resources.essential, ...resources.optional].reduce((sum, r) => sum + r.cost.monthly, 0);

    return {
        essentialResources: resources.essential,
        optionalResources: resources.optional,
        totalCosts: {
            oneTime: oneTimeTotal,
            monthly: monthlyTotal
        },
        vendorRecommendations: {
            bestForEquipment: "Amazon Business",
            bestForSoftware: "Microsoft",
            bestForServices: "Local Providers"
        }
    };
}

module.exports = { getResourceRequirements };