const express = require('express');
const path = require('path');
const db = require('./database');
const monitor = require('./monitor');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/status', (req, res) => {
    res.json({ message: 'WebWatcher API is running', timestamp: new Date().toISOString() });
});

app.get('/api/websites', (req, res) => {
    db.all("SELECT * FROM websites WHERE active = 1", (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

app.post('/api/websites', (req, res) => {
    const { url, name } = req.body;

    if (!url || !name) {
        return res.status(400).json({ error: 'URL and name are required' });
    }

    const stmt = db.prepare("INSERT INTO websites (url, name) VALUES (?, ?)");
    stmt.run(url, name, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ id: this.lastID, url, name });
        }
    });
    stmt.finalize();
});

app.post('/api/check/:id', async (req, res) => {
    const websiteId = req.params.id;

    db.get("SELECT * FROM websites WHERE id = ? AND active = 1", [websiteId], async (err, website) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!website) {
            return res.status(404).json({ error: 'Website not found' });
        }

        try {
            const result = await monitor.checkWebsite(website);
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
});

app.get('/api/websites/:id/history', (req, res) => {
    const websiteId = req.params.id;
    const limit = req.query.limit || 50;

    db.all(
        "SELECT * FROM checks WHERE website_id = ? ORDER BY checked_at DESC LIMIT ?",
        [websiteId, limit],
        (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json(rows);
            }
        }
    );
});

monitor.startScheduler();

app.listen(PORT, () => {
    console.log(`WebWatcher server running on port ${PORT}`);
});