import { NextResponse } from "next/server";
import { getOpenAIClient, hasOpenAIKey } from "@/lib/ai/client";
import { SUGGESTIONS_PROMPT } from "@/lib/ai/prompts";
import type { SuggestionsRequest, SuggestionsResponse } from "@/lib/ai/types";

export async function POST(request: Request) {
  if (!hasOpenAIKey()) {
    return NextResponse.json(
      { error: "OpenAI API key is not configured. Add OPENAI_API_KEY to .env.local" },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as SuggestionsRequest;

    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SUGGESTIONS_PROMPT },
        {
          role: "user",
          content: JSON.stringify({
            tripSettings: body.tripSettings,
            city: body.city,
            day: body.day,
            existingActivities: body.existingActivities,
            neighborhood: body.neighborhood,
            timeBlockType: body.timeBlockType,
          }),
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { suggestions: [] } satisfies SuggestionsResponse,
        { status: 200 }
      );
    }

    const parsed = JSON.parse(content) as SuggestionsResponse;
    return NextResponse.json(parsed);
  } catch (error) {
    const err = error as { status?: number; message?: string };
    if (err.status === 429) {
      return NextResponse.json(
        { error: "Rate limited. Please try again in a moment." },
        { status: 429 }
      );
    }
    console.error("Suggestions error:", err.message);
    return NextResponse.json(
      { error: "Failed to generate suggestions", suggestions: [] },
      { status: 500 }
    );
  }
}
