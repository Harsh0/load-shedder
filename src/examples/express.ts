import axios from 'axios';
import express from 'express';
import { expressLoadShedder } from '../lib';

const port = process.env.PORT || 3000;

const app = express();

app.use(
    expressLoadShedder({
        debug: true,
        maxEventLoopDelayInMs: 1000,
        maxMemoryUsagePercent: 85,
        maxConcurrentRequests: 100,
        samplingIntervalInMs: 500,
        logger: (message) => console.log(message),
        exempt: (req) => {
            // Exempt certain routes from load shedding
            return req.path === '/';
        },
        onLoadShed: (req, res) => {
            console.log('Load shedding triggered');
            res.status(503).json({ error: 'server overloaded' });
        },
    }),
);

async function simulateDownstreamCall(delayMs = 200) {
    const { data } = await axios.get(`https://httpbin.org/delay/${delayMs / 1000}`);
    return data;
}

app.get('/proxy', async (req, res) => {
    try {
        const result = await simulateDownstreamCall(200);
        res.json({ status: 'ok', result });
    } catch (err) {
        console.error('Error calling downstream service:', err);
        res.status(500).json({ error: 'downstream failed' });
    }
});

app.get('/', (req, res) => {
    res.send('Hello! Use /proxy to simulate downstream load.');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
