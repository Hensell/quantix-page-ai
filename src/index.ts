import { Hono } from "hono";
import { cors } from "./middlewares/cors";
import chatRoute from "./routes/chat";
import threadRoute from "./routes/thread";

const app = new Hono();

app.use("*", cors());

app.route("/chat", chatRoute);
app.route("/thread", threadRoute);

export default app;
