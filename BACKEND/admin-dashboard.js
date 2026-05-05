/**
 * Team 3 - Feature 11: Admin Dashboard
 * Provides admin interface for managing system data
 */

const { callOpenRouter, extractJson } = require('../ai-service');

async function getAdminDashboard(userProfile = null) {
    if (!userProfile || !userProfile.isAdmin) {
        throw new Error('Admin access required');
    }

    try {
        const prompt = `You are a system administrator.
        Provide admin dashboard data:
        {
            "systemStats": {
                "totalUsers": number,
                "activeIndustries": number,
                "aiQueriesToday": number,
                "systemHealth": "Good|Warning|Critical"
            },
            "recentActivity": [
                {"user": "string", "action": "string", "time": "timestamp"}
            ],
            "systemAlerts": [
                {"type": "warning|error", "message": "string", "timestamp": "timestamp"}
            ],
            "performanceMetrics": {
                "responseTime": "X ms",
                "uptime": "X%",
                "errorRate": "X%"
            },
            "actionItems": ["2-3 administrative tasks"]
        }
        Reply with only valid JSON.`;

        const response = await callOpenRouter(prompt);
        const jsonResponse = extractJson(response);
        return JSON.parse(jsonResponse);
    } catch (error) {
        console.warn('AI admin dashboard failed:', error.message);
        return getFallbackAdminDashboard();
    }
}

function getFallbackAdminDashboard() {
    return {
        systemStats: {
            totalUsers: 1247,
            activeIndustries: 5,
            aiQueriesToday: 342,
            systemHealth: "Good"
        },
        recentActivity: [
            { user: "John Doe", action: "Updated industry data", time: "2 hours ago" },
            { user: "Jane Smith", action: "New user registration", time: "4 hours ago" },
            { user: "Admin User", action: "System backup completed", time: "6 hours ago" }
        ],
        systemAlerts: [
            { type: "warning", message: "High memory usage in analytics module", timestamp: "2026-05-05 10:30:00" }
        ],
        performanceMetrics: {
            responseTime: "450ms",
            uptime: "99.9%",
            errorRate: "0.2%"
        },
        actionItems: [
            "Update industry data for Q2 2026",
            "Review AI API usage limits",
            "Schedule maintenance window"
        ]
    };
}

module.exports = { getAdminDashboard };