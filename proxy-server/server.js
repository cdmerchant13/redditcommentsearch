const express = require('express');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const cors = require('cors');

const app = express();
const PORT = 3000; // You can change this port

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // Enable CORS for all routes

// Proxy for Reddit authentication
app.post('/authenticate', async (req, res) => {
    const { client_id, client_secret, username, password } = req.body;

    try {
        const response = await fetch('https://www.reddit.com/api/v1/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + Buffer.from(`${client_id}:${client_secret}`).toString('base64'),
                'User-Agent': `web-app:reddit-comment-search:v1.0.0 (by /u/agentspanda)` // Required User-Agent
            },
            body: `grant_type=password&username=agentspanda&password=${password}`
        });

        // Forward Reddit's headers, including rate limit
        response.headers.forEach((value, name) => {
            if (name.startsWith('x-ratelimit-')) {
                res.setHeader(name, value);
            }
        });

        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error('Proxy authentication error:', error);
        res.status(500).json({ error: 'Proxy authentication failed', details: error.message });
    }
});

// Proxy for fetching user comments
app.get('/user-comments/:username', async (req, res) => {
    const { username } = req.params;
    const accessToken = req.headers.authorization; // Bearer token from frontend

    if (!accessToken) {
        return res.status(401).json({ error: 'Authorization token missing' });
    }

    try {
        const response = await fetch(`https://oauth.reddit.com/user/agentspanda/comments`, {
            method: 'GET',
            headers: {
                'Authorization': accessToken,
                'User-Agent': `web-app:reddit-comment-search:v1.0.0 (by /u/agentspanda)` // Required User-Agent
            }
        });

        // Forward Reddit's headers, including rate limit
        response.headers.forEach((value, name) => {
            if (name.startsWith('x-ratelimit-')) {
                res.setHeader(name, value);
            }
        });

        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error('Proxy user comments error:', error);
        res.status(500).json({ error: 'Proxy failed to fetch comments', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Proxy server listening on port ${PORT}`);
});
