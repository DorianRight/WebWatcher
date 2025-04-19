const axios = require('axios');
const cron = require('node-cron');
const db = require('./database');

class WebsiteMonitor {
    constructor() {
        this.isRunning = false;
    }

    async checkWebsite(website) {
        const startTime = Date.now();

        try {
            const response = await axios.get(website.url, {
                timeout: 10000,
                validateStatus: () => true
            });

            const responseTime = Date.now() - startTime;
            const isUp = response.status >= 200 && response.status < 400;

            this.saveCheck(website.id, response.status, responseTime, isUp, null);

            return {
                websiteId: website.id,
                statusCode: response.status,
                responseTime: responseTime,
                isUp: isUp
            };
        } catch (error) {
            const responseTime = Date.now() - startTime;
            this.saveCheck(website.id, 0, responseTime, false, error.message);

            return {
                websiteId: website.id,
                statusCode: 0,
                responseTime: responseTime,
                isUp: false,
                error: error.message
            };
        }
    }

    saveCheck(websiteId, statusCode, responseTime, isUp, errorMessage) {
        const stmt = db.prepare(`
            INSERT INTO checks (website_id, status_code, response_time, is_up, error_message)
            VALUES (?, ?, ?, ?, ?)
        `);
        stmt.run(websiteId, statusCode, responseTime, isUp ? 1 : 0, errorMessage);
        stmt.finalize();
    }

    async getAllWebsites() {
        return new Promise((resolve, reject) => {
            db.all("SELECT * FROM websites WHERE active = 1", (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    async runChecks() {
        if (this.isRunning) return;

        this.isRunning = true;
        console.log('Running website checks...');

        try {
            const websites = await this.getAllWebsites();
            const results = [];

            for (const website of websites) {
                const result = await this.checkWebsite(website);
                results.push(result);
                console.log(`Checked ${website.url}: ${result.isUp ? 'UP' : 'DOWN'} (${result.responseTime}ms)`);
            }

            this.isRunning = false;
            return results;
        } catch (error) {
            this.isRunning = false;
            console.error('Error running checks:', error);
            throw error;
        }
    }

    startScheduler() {
        cron.schedule('*/5 * * * *', async () => {
            await this.runChecks();
        });
        console.log('Website monitoring scheduler started (every 5 minutes)');
    }
}

module.exports = new WebsiteMonitor();