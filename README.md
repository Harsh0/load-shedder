# load-shedder

[![npm version](https://img.shields.io/npm/v/load-shedder.svg)](https://www.npmjs.com/package/load-shedder)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js CI](https://github.com/Harsh0/load-shedder/actions/workflows/ci.yml/badge.svg)](https://github.com/Harsh0/load-shedder/actions)

> ⚡️ Framework-agnostic load shedding middleware for Node.js servers

**load-shedder** is a lightweight middleware that protects your Node.js app from overload by shedding traffic under high load conditions.

It works with **any HTTP framework** (Express, Koa, Fastify, or native `http.createServer`) and uses key system signals like event loop delay, memory usage, and active request count to make real-time shedding decisions.

---

## 🚀 Features

- ✅ Framework agnostic – works with Express, Koa, Fastify, or native HTTP
- ⚙️ Configurable thresholds (event loop lag, memory, concurrency)
- 🚫 Graceful traffic rejection (custom 503/429 responses)
- 🧠 Adaptive: shed only when needed, exempt important routes
- 📊 Optional metrics & logging support
- 🔌 Extensible: hook into your own system pressure indicators

---

## 📦 Installation

```bash
npm install load-shedder
# or
yarn add load-shedder
```

## 🛠 Usage

### With Express
```ts
import express from 'express';
import { createShedder } from 'load-shedder';

const app = express();

const shedder = createShedder({
  maxEventLoopDelay: 100, // ms
  maxConcurrentRequests: 100,
  maxMemoryUsage: 0.8, // 80% heap
});

app.use(shedder.expressMiddleware());

app.get('/', (req, res) => {
  res.send('All good!');
});

app.listen(3000);
```
### With Native HTTP
```ts
import http from 'http';
import { createShedder } from 'load-shedder';

const shedder = createShedder({ maxEventLoopDelay: 120 });

const server = http.createServer((req, res) => {
  if (shedder.shouldShed(req)) {
    shedder.handleShed(req, res);
    return;
  }

  res.writeHead(200);
  res.end('OK');
});

server.listen(3000);
```
## ⚙️ API
```ts
createShedder(options)
```