import { NextResponse } from "next/server";
import { getOpenAIClient, hasOpenAIKey } from "@/lib/ai/client";
import { CONFLICT_DETECTION_PROMPT } from "@/lib/ai/prompts";
import type { ConflictDetectionRequest, ConflictDetectionResponse } from "@/lib/ai/types";

export async function POST(request: Request) {
  if (!hasOpenAIKey()) {
    return NextResponse.json(
      { error: "OpenAI API key is not configured. Add OPENAI_API_KEY to .env.local" },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as ConflictDetectionRequest;

    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: CONFLICT_DETECTION_PROMPT },
        {
          role: "user",
          content: JSON.stringify({
            day: body.day,
            activities: body.activities,
            city: body.city,
            reservations: body.reservations,
          }),
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 1000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { conflicts: [] } satisfies ConflictDetectionResponse,
        { status: 200 }
      );
    }

    const parsed = JSON.parse(content) as ConflictDetectionResponse;
    return NextResponse.json(parsed);
  } catch (error) {
    const err = error as { status?: number; message?: string };
    if (err.status === 429) {
      return NextResponse.json(
        { error: "Rate limited. Please try again in a moment." },
        { status: 429 }
      );
    }
    console.error("Conflict detection error:", err.message);
    return NextResponse.json(
      { error: "Failed to analyze conflicts", conflicts: [] },
      { status: 500 }
    );
  }
}
