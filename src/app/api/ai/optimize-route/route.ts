import { NextResponse } from "next/server";
import { getOpenAIClient, hasOpenAIKey } from "@/lib/ai/client";
import { OPTIMIZE_ROUTE_PROMPT } from "@/lib/ai/prompts";
import type { OptimizeRouteRequest, OptimizeRouteResponse } from "@/lib/ai/types";

export async function POST(request: Request) {
  if (!hasOpenAIKey()) {
    return NextResponse.json(
      { error: "OpenAI API key is not configured. Add OPENAI_API_KEY to .env.local" },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json()) as OptimizeRouteRequest;

    if (!body.activities || body.activities.length < 2) {
      return NextResponse.json(
        {
          optimizedOrder: body.activities?.map((a) => a.id) ?? [],
          estimatedTimeSaved: 0,
          explanation: "Not enough activities to optimize.",
        } satisfies OptimizeRouteResponse,
        { status: 200 }
      );
    }

    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: OPTIMIZE_ROUTE_PROMPT },
        {
          role: "user",
          content: JSON.stringify({
            activities: body.activities,
            lodging: body.lodging,
            city: body.city,
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
        {
          optimizedOrder: body.activities.map((a) => a.id),
          estimatedTimeSaved: 0,
          explanation: "Could not determine an optimization.",
        } satisfies OptimizeRouteResponse,
        { status: 200 }
      );
    }

    const parsed = JSON.parse(content) as OptimizeRouteResponse;
    return NextResponse.json(parsed);
  } catch (error) {
    const err = error as { status?: number; message?: string };
    if (err.status === 429) {
      return NextResponse.json(
        { error: "Rate limited. Please try again in a moment." },
        { status: 429 }
      );
    }
    console.error("Route optimization error:", err.message);
    return NextResponse.json(
      { error: "Failed to optimize route" },
      { status: 500 }
    );
  }
}
