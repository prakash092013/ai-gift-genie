import express from "express";
import rateLimit from "express-rate-limit";
import OpenAI from "openai";
import { checkEnvironment } from "./utils.js";

checkEnvironment();

const app = express();
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.AI_KEY,
  baseURL: process.env.AI_URL,
});

const SYSTEM_PROMPT = `You are the Gift Genie. 

You generate gift ideas that feel thoughtful, specific, and genuinely useful.
Your output must be in structured Markdown.
Do not write introductions or conclusions.
Start directly with the gift suggestions.

Each gift must:
- Have a clear heading
- Include a short explanation of why it works

If the user mentions a location, situation, or constraint,
adapt the gift ideas and add another short section 
under each gift that guides the user to get the gift in that 
constrained context.

After the gift ideas, include a section titled "Questions for you"
with clarifying questions that would help improve the recommendations.`;

const MAX_PROMPT_LENGTH = 2000;

const giftLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { message: "Too many requests. Please try again later." },
  standardHeaders: true,
});

app.post("/api/gift", giftLimiter, async (req, res) => {
  const { userPrompt } = req.body;

  if (userPrompt === undefined || userPrompt === null) {
    return res.status(400).json({ message: "Missing userPrompt in request body." });
  }
  const prompt = typeof userPrompt === "string" ? userPrompt.trim() : String(userPrompt).trim();
  if (!prompt) {
    return res.status(400).json({ message: "userPrompt cannot be empty." });
  }
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return res.status(400).json({
      message: `userPrompt is too long (max ${MAX_PROMPT_LENGTH} characters).`,
    });
  }

  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: prompt },
  ];

  try {
    const response = await openai.chat.completions.create({
      model: process.env.AI_MODEL,
      messages,
    });

    const giftSuggestions = response.choices[0]?.message?.content ?? "";
    res.json({ giftSuggestions });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      message: "It's not you, it's us. Something went wrong on the server.",
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
