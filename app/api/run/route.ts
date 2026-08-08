import { NextRequest } from "next/server";
import { streamWorkflow } from "@/lib/graph";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== "string" || !query.trim()) {
      return Response.json({ error: "Missing 'query' parameter" }, { status: 400 });
    }

    const apiKey = process.env.GTMA_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "No API key configured. Set GTMA_API_KEY in your environment variables." },
        { status: 401 }
      );
    }

    // Stream the LangGraph workflow as SSE
    const encoder = new TextEncoder();
    let isDone = false;

    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: unknown) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        try {
          for await (const event of streamWorkflow(query)) {
            if (isDone) break;
            send(event);
          }
          send({ event: "done" });
        } catch (err: any) {
          send({ event: "error", data: { message: err.message || "Workflow failed" } });
        } finally {
          controller.close();
        }
      },
      cancel() {
        isDone = true;
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err: any) {
    return Response.json({ error: err.message || "Internal error" }, { status: 500 });
  }
}
