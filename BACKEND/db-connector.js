/**
 * Team 3 - Feature 14: Database Management System
 * Secure storage for user data, industry information, and analysis results
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

class DatabaseConnector {
    constructor() {
        this.client = null;
        this.db = null;
        this.uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/smartstart';
    }

    async connect() {
        try {
            if (!this.client) {
                this.client = new MongoClient(this.uri, {
                    useNewUrlParser: true,
                    useUnifiedTopology: true
                });
                await this.client.connect();
                this.db = this.client.db();
                console.log('Connected to MongoDB');
            }
            return this.db;
        } catch (error) {
            console.error('MongoDB connection error:', error);
            throw error;
        }
    }

    async close() {
        if (this.client) {
            await this.client.close();
            this.client = null;
            this.db = null;
        }
    }

    // Collections
    getUsers() { return this.db.collection('users'); }
    getIndustries() { return this.db.collection('industries'); }
    getCalculations() { return this.db.collection('calculations'); }
    getResults() { return this.db.collection('results'); }
    getSettings() { return this.db.collection('settings'); }

    // Helper methods
    async findOne(collection, query) {
        const db = await this.connect();
        return db.collection(collection).findOne(query);
    }

    async find(collection, query = {}, options = {}) {
        const db = await this.connect();
        return db.collection(collection).find(query, options).toArray();
    }

    async insertOne(collection, document) {
        const db = await this.connect();
        return db.collection(collection).insertOne(document);
    }

    async updateOne(collection, query, update) {
        const db = await this.connect();
        return db.collection(collection).updateOne(query, update);
    }

    async deleteOne(collection, query) {
        const db = await this.connect();
        return db.collection(collection).deleteOne(query);
    }

    // Specific methods for StartSmart
    async saveUserCalculation(userId, calculationData) {
        const db = await this.connect();
        return db.collection('calculations').insertOne({
            userId,
            timestamp: new Date(),
            ...calculationData
        });
    }

    async getUserHistory(userId, limit = 10) {
        const db = await this.connect();
        return db.collection('calculations')
            .find({ userId })
            .sort({ timestamp: -1 })
            .limit(limit)
            .toArray();
    }

    async updateIndustryData(industryId, data) {
        const db = await this.connect();
        return db.collection('industries')
            .updateOne({ id: industryId }, { $set: { ...data, updatedAt: new Date() } }, { upsert: true });
    }
}

module.exports = new DatabaseConnector();