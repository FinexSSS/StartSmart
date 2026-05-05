/**
 * StartSmart Main Server
 * Wires all backend modules together
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import all team modules from the main BACKEND folder
const budgetInput = require('./BACKEND/budget-input');
const industrySelection = require('./BACKEND/industry-selection');
const feasibilityCalculator = require('./BACKEND/feasibility-calculator');
const expenseBreakdown = require('./BACKEND/expense-breakdown');
const influencerRecommender = require('./BACKEND/influencer-recommender');

const rawMaterialInfo = require('./BACKEND/raw-material-info');
const profitEstimator = require('./BACKEND/profit-estimator');
const recommendationEngine = require('./BACKEND/recommendation-engine');
const feasibilityDashboard = require('./BACKEND/feasibility-dashboard');
const roadmapGenerator = require('./BACKEND/roadmap-generator');

const adminDashboard = require('./BACKEND/admin-dashboard');
const analyticsModule = require('./BACKEND/analytics-module');
const resourceRequirements = require('./BACKEND/resource-requirements');
const dbConnector = require('./BACKEND/db-connector');
const riskAssessment = require('./BACKEND/risk-assessment');

const breakEvenAnalysis = require('./BACKEND/break-even-analysis');
const fundingRecommendation = require('./BACKEND/funding-recommendation');
const swotAnalysis = require('./BACKEND/swot-analysis');
const marketingBudgetPlanner = require('./BACKEND/marketing-budget-planner');
const businessPlanExport = require('./BACKEND/business-plan-export');


// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Team 1 Routes
app.post('/api/budget', async (req, res) => {
    try {
        const { budget, userProfile } = req.body;
        const result = await budgetInput.validateBudget(budget, userProfile);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/industries/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { budget, userProfile } = req.query;
        const result = await industrySelection.getIndustryData(id, Number(budget), userProfile);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/feasibility', async (req, res) => {
    try {
        const { budget, industryId, teamSize, monthsToRun, userProfile } = req.body;
        const result = await feasibilityCalculator.calculateFeasibility(budget, industryId, teamSize, monthsToRun, userProfile);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/expenses', async (req, res) => {
    try {
        const { budget, industryId, teamSize, userProfile } = req.body;
        const result = await expenseBreakdown.generateExpenseBreakdown(budget, industryId, teamSize, userProfile);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/influencers', async (req, res) => {
    try {
        const { industryId, budget, userProfile } = req.body;
        const result = await influencerRecommender.getInfluencerRecommendations(industryId, budget, userProfile);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Team 2 Routes
app.post('/api/materials', async (req, res) => {
    try {
        const { industryId, budget, userProfile } = req.body;
        const result = await rawMaterialInfo.getRawMaterialInfo(industryId, budget, userProfile);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/profit', async (req, res) => {
    try {
        const { budget, industryId, teamSize, monthsToRun, userProfile } = req.body;
        const result = await profitEstimator.estimateProfit(budget, industryId, teamSize, monthsToRun, userProfile);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/recommendations', async (req, res) => {
    try {
        const { budget, industryId, userProfile } = req.body;
        const result = await recommendationEngine.getStartupRecommendations(budget, industryId, userProfile);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/dashboard', async (req, res) => {
    try {
        const { budget, industryId, teamSize, userProfile } = req.body;
        const result = await feasibilityDashboard.generateFeasibilityDashboard(budget, industryId, teamSize, userProfile);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/roadmap', async (req, res) => {
    try {
        const { industryId, budget, monthsToRun, userProfile } = req.body;
        const result = await roadmapGenerator.generateRoadmap(industryId, budget, monthsToRun, userProfile);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Team 3 Routes
app.get('/api/admin/dashboard', async (req, res) => {
    try {
        const userProfile = req.headers['user-profile'] ? JSON.parse(req.headers['user-profile']) : null;
        const result = await adminDashboard.getAdminDashboard(userProfile);
        res.json(result);
    } catch (error) {
        res.status(403).json({ error: error.message });
    }
});

app.post('/api/analytics', async (req, res) => {
    try {
        const { industryId, budget, monthsToRun, userProfile } = req.body;
        const result = await analyticsModule.generateAnalyticsData(industryId, budget, monthsToRun, userProfile);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/resources', async (req, res) => {
    try {
        const { industryId, budget, userProfile } = req.body;
        const result = await resourceRequirements.getResourceRequirements(industryId, budget, userProfile);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/risks', async (req, res) => {
    try {
        const { budget, industryId, teamSize, monthsToRun, userProfile } = req.body;
        const result = await riskAssessment.assessRisks(budget, industryId, teamSize, monthsToRun, userProfile);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Team 4 Routes
app.post('/api/break-even', async (req, res) => {
    try {
        const { budget, industryId, userProfile } = req.body;
        const result = await breakEvenAnalysis.calculateBreakEven(budget, industryId, userProfile);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/funding', async (req, res) => {
    try {
        const { budget, industryId, userProfile } = req.query;
        const result = await fundingRecommendation.getFundingRecommendations(Number(budget), industryId, userProfile);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/swot', async (req, res) => {
    try {
        const { industryId, budget, userProfile } = req.body;
        const result = await swotAnalysis.generateSwotAnalysis(industryId, budget, userProfile);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/marketing', async (req, res) => {
    try {
        const { budget, industryId, strategy, userProfile } = req.body;
        const result = await marketingBudgetPlanner.planMarketingBudget(budget, industryId, strategy, userProfile);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/export/pdf', async (req, res) => {
    try {
        const { budget, industryId, teamSize, monthsToRun, userProfile } = req.query;
        const result = await businessPlanExport.generateBusinessPlan(Number(budget), industryId, Number(teamSize), Number(monthsToRun), userProfile);
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`StartSmart API server running on port ${PORT}`);
});