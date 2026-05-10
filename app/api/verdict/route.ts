import Anthropic from "@anthropic-ai/sdk";
import { VERDICT_SYSTEM_PROMPT } from "@/lib/verdictPrompt";

export const runtime = "nodejs";
export const maxDuration = 60;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

type Answers = {
  light: string;
  water: string;
  pets: string;
  vacation: string;
};

type RequestBody = {
  photo?: string | null;
  name?: string | null;
  answers: Answers;
};

const VERDICT_TOOL: Anthropic.Tool = {
  name: "return_verdict",
  description:
    "Return the plant verdict in structured form. This is the only way to respond.",
  input_schema: {
    type: "object",
    properties: {
      plantId: {
        type: "string",
        description: "Common name of the plant identified",
      },
      confidence: {
        type: "string",
        enum: ["high", "medium", "low", "not-a-plant"],
      },
      killProbability: {
        type: "number",
        description:
          "Kill probability 0-100 with EXACTLY one decimal place (e.g. 24.7, never 25 or 25.0)",
      },
      tier: {
        type: "string",
        enum: ["GO_AHEAD", "CAUTION", "RIP", "BABE_NO"],
      },
      category: {
        type: "string",
        description:
          'e.g. "Tropical · High Maintenance" or "Succulent · Easy"',
      },
      verdict: {
        type: "string",
        description:
          "The Bowen Yang voiced verdict copy, 2-4 sentences max, in voice",
      },
      alternative: {
        type: "object",
        description:
          "Required when killProbability > 35. A specific named alternative plant.",
        properties: {
          name: { type: "string" },
          reason: { type: "string" },
        },
        required: ["name", "reason"],
      },
      closingQuestion: {
        type: "string",
        description: "The closing question matching the tier",
      },
    },
    required: [
      "plantId",
      "confidence",
      "killProbability",
      "tier",
      "category",
      "verdict",
      "closingQuestion",
    ],
  },
};

export async function POST(req: Request) {
  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { photo, name, answers } = body;

  if (!photo && (!name || !name.trim())) {
    return Response.json(
      { error: "Need a photo or plant name" },
      { status: 400 },
    );
  }

  if (
    !answers ||
    !answers.light ||
    !answers.water ||
    !answers.pets ||
    !answers.vacation
  ) {
    return Response.json({ error: "All answers required" }, { status: 400 });
  }

  const userText = `${name && name.trim() ? `Plant name typed: "${name.trim()}"` : "See attached photo."}

Their honest answers:
- Light: ${answers.light}
- Watering honesty: ${answers.water}
- Pets/toddlers in the chaos zone: ${answers.pets}
- Away >5 days: ${answers.vacation}

Return your verdict via the return_verdict tool.`;

  const userContent: Anthropic.ContentBlockParam[] = [];

  if (photo) {
    const match = photo.match(/^data:(image\/(jpeg|png|gif|webp));base64,(.+)$/);
    if (match) {
      userContent.push({
        type: "image",
        source: {
          type: "base64",
          media_type: match[1] as
            | "image/jpeg"
            | "image/png"
            | "image/gif"
            | "image/webp",
          data: match[3],
        },
      });
    }
  }

  userContent.push({ type: "text", text: userText });

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      temperature: 0.9,
      system: [
        {
          type: "text",
          text: VERDICT_SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      tools: [VERDICT_TOOL],
      tool_choice: { type: "tool", name: "return_verdict" },
      messages: [{ role: "user", content: userContent }],
    });

    const toolUse = response.content.find((b) => b.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      return Response.json(
        { error: "Verdict engine returned no structured output" },
        { status: 500 },
      );
    }

    return Response.json(toolUse.input);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown verdict engine error";
    console.error("verdict error:", message);
    return Response.json(
      { error: "Verdict engine sneezed. Try again in a sec." },
      { status: 500 },
    );
  }
}
