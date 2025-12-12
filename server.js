import express from 'express';
import fetch from 'node-fetch';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files (index.html, etc.)

// API Endpoint
app.post('/api/ask', async (req, res) => {
    try {
        const { question } = req.body;

        if (!process.env.PERPLEXITY_API_KEY) {
            return res.status(500).json({ error: 'API Key not configured' });
        }

        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'sonar-pro',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an intelligent assistant for "Absher" (Saudi Government Services). Answer usually in Arabic. Be helpful, concise, and professional.'
                    },
                    { role: 'user', content: question }
                ]
            })
        });

        const data = await response.json();

        if (data.choices && data.choices[0]) {
            res.json({ answer: data.choices[0].message.content });
        } else {
            console.error('Perplexity API Error:', data);
            res.status(500).json({ error: 'Failed to get answer from AI' });
        }
    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
