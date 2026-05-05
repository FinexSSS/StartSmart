import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api",
  headers: { "Content-Type": "application/json" },
});

// Team 1
export const validateBudget = (budget: number, profile?: any) =>
  API.post("/budget", { budget, userProfile: profile }).then(r => r.data);

export const getIndustryData = (industryId: string, budget: number, profile?: any) =>
  API.get(`/industries/${industryId}`, { params: { budget, profile } }).then(r => r.data);

export const calculateFeasibility = (payload: { budget: number; industryId: string; teamSize: number; monthsToRun: number; userProfile?: any }) =>
  API.post("/feasibility", payload).then(r => r.data);

export const getExpenseBreakdown = (payload: { budget: number; industryId: string; teamSize: number; userProfile?: any }) =>
  API.post("/expenses", payload).then(r => r.data);

export const getInfluencers = (payload: { industryId: string; budget: number; userProfile?: any }) =>
  API.post("/influencers", payload).then(r => r.data);

// Team 2
export const getRawMaterials = (payload: { industryId: string; budget: number }) =>
  API.post("/materials", payload).then(r => r.data);

export const estimateProfit = (payload: { budget: number; industryId: string; teamSize: number; monthsToRun: number }) =>
  API.post("/profit", payload).then(r => r.data);

export const getStartupRecommendations = (payload: { budget: number; industryId: string }) =>
  API.post("/recommendations", payload).then(r => r.data);

export const getDashboard = (payload: { budget: number; industryId: string; teamSize: number; monthsToRun: number }) =>
  API.post("/dashboard", payload).then(r => r.data);

export const generateRoadmap = (payload: { industryId: string; budget: number; monthsToRun: number }) =>
  API.post("/roadmap", payload).then(r => r.data);

// Team 3
export const getAdminDashboard = () =>
  API.get("/admin/dashboard").then(r => r.data);

export const getAnalytics = (payload: { industryId: string; budget: number; monthsToRun?: number }) =>
  API.post("/analytics", payload).then(r => r.data);

export const getResources = (payload: { industryId: string; budget: number }) =>
  API.post("/resources", payload).then(r => r.data);

export const assessRisks = (payload: { budget: number; industryId: string; teamSize: number; monthsToRun: number }) =>
  API.post("/risks", payload).then(r => r.data);

// Team 4
export const getBreakEven = (payload: { budget: number; industryId: string; teamSize?: number }) =>
  API.post("/break-even", payload).then(r => r.data);

export const getFunding = (payload: { budget: number; industryId: string }) =>
  API.get("/funding", { params: payload }).then(r => r.data);

export const getSwot = (payload: { industryId: string; budget?: number }) =>
  API.post("/swot", payload).then(r => r.data);

export const getMarketingPlan = (payload: { budget: number; industryId: string; strategy?: string }) =>
  API.post("/marketing", payload).then(r => r.data);

export const exportBusinessPlan = (payload: { budget: number; industryId: string; teamSize: number; monthsToRun: number }) =>
  API.get("/export/pdf", { params: payload, responseType: "blob" }).then(r => r.data);