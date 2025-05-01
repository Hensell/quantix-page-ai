# Quantix AI Assistant API

An open-source API built with Cloudflare Workers + OpenAI Assistant API, using TypeScript and Hono. This is version 1 of a growing project. Created on April 30, 2025.

---

## 🚀 What does this API do?

It lets you consume a custom OpenAI Assistant from any frontend, using simple endpoints: `/thread` and `/chat`. It's designed as a base for financial bots, educational assistants, or any AI-powered project.

---

## ✅ Requirements

1. A [Cloudflare](https://dash.cloudflare.com/) account.
2. An [OpenAI](https://platform.openai.com/) account.
3. At least $5 USD in your OpenAI billing.
4. Node.js and npm installed locally.

---

## 🧱 How to set up and run this project

### 1. Clone the repository

```bash
git clone https://github.com/your-username/quantix-ai-assistant-api.git
cd quantix-ai-assistant-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Cloudflare environment

- Register or log in to Cloudflare.
- Install Wrangler CLI globally:

```bash
npm install -g wrangler
```

- If needed, authenticate Wrangler:

```bash
wrangler login
```

### 4. Create your Assistant on OpenAI

- Go to [platform.openai.com](https://platform.openai.com).
- Add billing credit.
- Navigate to **Assistants** and create a new one.
  - Choose any model (e.g., `gpt-3.5-turbo`).
  - Copy the generated `assistant_id`.

### 5. Add environment secrets

Run the following in your terminal:

```bash
wrangler secret put OPENAI_API_KEY
wrangler secret put ASSISTANT_ID
```

Make sure your API key and Assistant ID are correct.

### 6. Run the project locally

```bash
wrangler dev
```

This will start your Worker at `http://localhost:8787`, where you can test your API using Postman, curl, or your frontend.

## 📨 API Usage

### 🔹 GET `/thread`

Creates a new assistant thread.

**Example request:**

```http
GET http://localhost:8787/thread
```

**Example response:**

```json
{
  "thread_id": "thread_mKpjEzSnWnS6Id81voNxzpBI"
}
```

---

### 🔹 POST `/chat`

Sends a message to the assistant and receives a response based on a thread.

**Request URL:**

```http
POST http://localhost:8787/chat
```

**Request Body:**

```json
{
  "message": "Who are you?",
  "thread_id": "thread_mKpjEzSnWnS6Id81voNxzpBI",
  "limit": 1
}
```

- `message`: (string) The user message to send.
- `thread_id`: (string) The thread ID returned by `/thread`.
- `limit`: (optional, number) Limits how many messages are returned (default is all).

**Example response:**

```json
[
  {
    "content": "I was built using OpenAI's Assistant API and deployed with Cloudflare Workers"
  }
]
```

### 7. Deploy to Cloudflare

When you're ready to go live:

```bash
wrangler deploy
```

Your API will be deployed to a Cloudflare URL.

---

## 📁 Project structure

```
src/
├── index.ts          # Entry point with Hono
├── routes/
│   ├── chat.ts       # POST /chat
│   └── thread.ts     # GET /thread
├── utils/
│   └── openai.ts     # OpenAI client
├── middlewares/
│   └── cors.ts       # CORS headers
├── types/
│   └── index.ts      # Request types
```

---

## 📌 License

MIT © [Hensell Espinoza](https://hensell.dev)
