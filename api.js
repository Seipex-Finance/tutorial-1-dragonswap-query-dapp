const express = require('express');
const flatCache = require('flat-cache');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

// Enable CORS for all requests
app.use(cors());

app.get('/pairs', (req, res) => {
    const cache = flatCache.load('pairsCache', path.resolve('./cache'));
    const allPairs = cache.all();
    res.json(allPairs);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});