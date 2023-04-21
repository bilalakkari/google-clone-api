import express from 'express';
import SerpApi from 'google-search-results-nodejs';
import dotenv from 'dotenv';
import cors from 'cors';
import { Configuration, OpenAIApi } from 'openai';

dotenv.config();

const app = express();
app.use(cors());

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_TOKEN,
});

const openai = new OpenAIApi(configuration);

app.get('/search', async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ error: 'Missing query parameter' });
    }

    const search = new SerpApi.GoogleSearch(process.env.SERPAPI_GOOGLE);

    try {
        const prompt = query;
        const response = await openai.createCompletion({
            model: 'text-davinci-003',
            prompt,
            max_tokens: 3000,
            temperature: 0,
        });
        const openaiResult = response.data.choices[0].text;

        const searchResult = new Promise((resolve, reject) => {
            search.json({ q: query, location: 'Austin, TX' }, (result) => {
                resolve(result);
            });
        });

        const [openaiResponse, googleResponse] = await Promise.all([openaiResult, searchResult]);

        res.json({ openaiResponse, googleResponse });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});