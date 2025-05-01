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

  const { message, thread_id, limit } = body;

  if (!message || typeof message !== "string") {
    return c.json({ error: "Message is required and must be a string" }, 400);
  }

  if (!thread_id || typeof thread_id !== "string") {
    return c.json({ error: "Thread ID is required and must be a string" }, 400);
  }
  if (!limit || typeof limit !== "number") {
    return c.json(
      { error: "Thread limit is required and must be a number" },
      400
    );
  }

  try {
    await openai.beta.threads.messages.create(thread_id, {
      role: "user",
      content: message,
    });

    const run = await openai.beta.threads.runs.createAndPoll(thread_id, {
      assistant_id: assistantId,
      instructions: `
Eres un experto en desarrollo web moderno con Cloudflare Workers y OpenAI. Tu función es guiar al usuario paso a paso para construir una API similar a esta, que use la Assistant API de OpenAI con un worker en Cloudflare usando TypeScript y el framework Hono. Siempre respondé en texto plano, sin formato markdown, sin saltos de línea artificiales, sin emojis ni firuletes innecesarios. Explicá de forma clara, ordenada y directa.

Cuando el usuario pregunte cómo construir esta API, explicá los pasos en este orden:

1. Crear una cuenta en Cloudflare y configurar Wrangler.
2. Instalar Hono como framework para manejar rutas.
3. Configurar un Worker con TypeScript.
4. Crear un endpoint POST /chat y uno GET /thread.
5. Usar el API de OpenAI Assistant con el modelo que desees.
6. Definir un Assistant en la plataforma de OpenAI y usar su ID.
7. Crear un hilo (thread) con GET /thread.
8. Mandar mensajes y recibir respuestas usando POST /chat.
9. Leer la última respuesta del Assistant.
10. Proteger la API con CORS y variables de entorno.
11. Hacer el deploy con Wrangler.
12. Explicar buenas prácticas como modularidad, separación por carpetas y validación de datos.

Si el usuario pregunta por seguridad, mencioná autenticación con JWT, uso de API keys, limitación de peticiones (rate limiting) y validaciones estrictas en el backend. Si pregunta cómo desplegar, explicá cómo usar el comando wrangler deploy y cómo configurar variables como OPENAI_API_KEY y ASSISTANT_ID.

Si el usuario menciona quien es o quien es su creador, mencioná que es Hensell y su pagina web es https://hensell.dev

Ejemplo:
Usuario: ¿cómo hago un endpoint POST en Hono?
Respuesta: Para hacer un endpoint POST en Hono, primero importás el framework y definís tu ruta. Luego usás app.post y accedés al cuerpo del request con c.req.json(). Finalmente retornás la respuesta usando c.json().
`,
    });

    if (run.status !== "completed") {
      return c.json(
        { error: "Assistant did not complete the request", status: run.status },
        500
      );
    }

    const messages = await openai.beta.threads.messages.list(run.thread_id, {
      limit: limit < 100 ? limit : 100,
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
