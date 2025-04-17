const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.send('WebWatcher - Website Monitoring Tool');
});

app.get('/api/status', (req, res) => {
    res.json({ message: 'WebWatcher API is running', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`WebWatcher server running on port ${PORT}`);
});