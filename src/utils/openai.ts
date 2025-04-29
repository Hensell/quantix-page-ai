import OpenAI from "openai";

export const getOpenAI = (apiKey: string) =>
  new OpenAI({
    apiKey,
    baseURL: "https://api.openai.com/v1",
  });
