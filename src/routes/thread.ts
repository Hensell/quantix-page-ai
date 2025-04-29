import { Hono } from "hono";
import { getOpenAI } from "../utils/openai";

const thread = new Hono();

thread.get("/", async (c) => {
  const env = c.env as { OPENAI_API_KEY: string };
  const openai = getOpenAI(env.OPENAI_API_KEY);

  try {
    const created = await openai.beta.threads.create();
    return c.json({ thread_id: created.id });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export default thread;
