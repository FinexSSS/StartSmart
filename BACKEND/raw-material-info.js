/**
 * Team 2 - Feature 6: Raw Material Information Module
 * Displays required raw materials with AI-powered supplier data
 */

const { callOpenRouter, extractJson } = require('../../BACKEND/ai-service');

async function getRawMaterialInfo(industryId, budget, userProfile = null) {
    if (!industryId || !budget) {
        throw new Error('Industry and budget are required');
    }

    try {
        const prompt = `You are a supply chain expert. ${userProfile ? `User location: ${userProfile.region || 'unspecified'}` : ''}
        CRITICAL: Use REAL-TIME 2026 supplier and pricing data.

        Industry: ${industryId}
        Budget: $${budget}

        Provide raw material information in JSON:
        {
            "materials": [
                {
                    "name": "material name",
                    "supplier": "real supplier name",
                    "estimatedCost": number,
                    "unit": "unit of measure",
                    "notes": "important notes",
                    "supplierWebsite": "URL",
                    "leadTime": "X days"
                }
            ],
            "supplierCategories": ["category1", "category2"],
            "bulkDiscounts": [
                {"quantity": "X units", "discount": "Y%"}
            ],
            "alternativeSuppliers": [
                {"name": "supplier name", "specialty": "description"}
            ]
        }
        Reply with only valid JSON.`;

        const response = await callOpenRouter(prompt);
        const jsonResponse = extractJson(response);
        return JSON.parse(jsonResponse);
    } catch (error) {
        console.warn('AI raw material info failed:', error.message);
        return getFallbackMaterialInfo(industryId);
    }
}

function getFallbackMaterialInfo(industryId) {
    const materialsMap = {
        clothing: [
            { name: "Cotton Fabric", supplier: "FabricMart", estimatedCost: 8, unit: "per yard", notes: "Bulk discounts available", supplierWebsite: "https://fabricmart.com", leadTime: "3-5 days" },
            { name: "Polyester Blend", supplier: "TextilePro", estimatedCost: 5, unit: "per yard", notes: "Quick-dry material", supplierWebsite: "https://textilepro.com", leadTime: "2-4 days" },
            { name: "Labels & Tags", supplier: "LabelKing", estimatedCost: 0.15, unit: "per piece", notes: "Custom branding", supplierWebsite: "https://labelking.com", leadTime: "5-7 days" }
        ],
        food: [
            { name: "Commercial Oven", supplier: "KitchenPro", estimatedCost: 1200, unit: "per unit", notes: "Energy efficient", supplierWebsite: "https://kitchenpro.com", leadTime: "7-10 days" },
            { name: "Bulk Ingredients", supplier: "WholeFoods Supply", estimatedCost: 500, unit: "monthly", notes: "Organic options", supplierWebsite: "https://wholefoodssupply.com", leadTime: "2-3 days" }
        ],
        youtube: [
            { name: "DSLR Camera", supplier: "CameraWorld", estimatedCost: 600, unit: "per unit", notes: "4K capable", supplierWebsite: "https://cameraworld.com", leadTime: "1-3 days" },
            { name: "Wireless Mic", supplier: "AudioTech", estimatedCost: 150, unit: "per set", notes: "Lavalier type", supplierWebsite: "https://audiotech.com", leadTime: "2-4 days" }
        ]
    };

    return {
        materials: materialsMap[industryId] || materialsMap.clothing,
        supplierCategories: ["Wholesale", "Direct from Manufacturer", "Local Distributors"],
        bulkDiscounts: [
            { quantity: "100+ units", discount: "10%" },
            { quantity: "500+ units", discount: "15%" },
            { quantity: "1000+ units", discount: "20%" }
        ],
        alternativeSuppliers: [
            { name: "Alibaba", specialty: "Global wholesale marketplace" },
            { name: "Uline", specialty: "Industrial and packaging supplies" },
            { name: "Local Wholesale", specialty: "Regional suppliers with faster delivery" }
        ]
    };
}

module.exports = { getRawMaterialInfo };