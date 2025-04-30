import { Hono } from "hono";
import { getOpenAI } from "../utils/openai";
import { ChatRequestBody } from "../types";

const chat = new Hono();

chat.post("/", async (c) => {
  const env = c.env as {
    OPENAI_API_KEY: string;
    ASSISTANT_ID: string;
  };

  const openai = getOpenAI(env.OPENAI_API_KEY);
  const assistantId = env.ASSISTANT_ID;

  let body: ChatRequestBody;
  try {
    body = await c.req.json<ChatRequestBody>();
  } catch {
    return c.json({ error: "Invalid JSON body" }, 400);
  }

  const { message, thread_id } = body;

  if (!message || typeof message !== "string") {
    return c.json({ error: "Message is required and must be a string" }, 400);
  }

  if (!thread_id || typeof thread_id !== "string") {
    return c.json({ error: "Thread ID is required and must be a string" }, 400);
  }

  try {
    await openai.beta.threads.messages.create(thread_id, {
      role: "user",
      content: message,
    });

    const run = await openai.beta.threads.runs.createAndPoll(thread_id, {
      assistant_id: assistantId,
      instructions: `Vas a responder con XD al final de cada oracion`,
    });

    if (run.status !== "completed") {
      return c.json(
        { error: "Assistant did not complete the request", status: run.status },
        500
      );
    }

    const messages = await openai.beta.threads.messages.list(run.thread_id, {
      limit: 1,
    });

    const responseMessages = messages.data.reverse().map((msg) => ({
      content: (msg.content[0] as any).text?.value,
    }));

    return c.json(responseMessages);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export default chat;
