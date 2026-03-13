import { NextResponse } from "next/server";
import { getOpenAIClient, hasOpenAIKey } from "@/lib/ai/client";
import { PARSE_ACTIVITY_PROMPT } from "@/lib/ai/prompts";
import type { ParseActivityRequest, ParseActivityResponse } from "@/lib/ai/types";

export async function POST(request: Request) {
  if (!hasOpenAIKey()) {
    return NextResponse.json(
      { error: "OpenAI API key is not configured. Add OPENAI_API_KEY to .env.local" },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as ParseActivityRequest;

    if (!body.input || body.input.trim().length === 0) {
      return NextResponse.json(
        { error: "Input text is required" },
        { status: 400 }
      );
    }

    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: PARSE_ACTIVITY_PROMPT },
        {
          role: "user",
          content: JSON.stringify({
            input: body.input,
            dayContext: body.dayContext,
            tripSettings: body.tripSettings,
          }),
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 800,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "Failed to parse activity from input" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(content) as ParseActivityResponse;
    return NextResponse.json(parsed);
  } catch (error) {
    const err = error as { status?: number; message?: string };
    if (err.status === 429) {
      return NextResponse.json(
        { error: "Rate limited. Please try again in a moment." },
        { status: 429 }
      );
    }
    console.error("Parse activity error:", err.message);
    return NextResponse.json(
      { error: "Failed to parse activity" },
      { status: 500 }
    );
  }
}
