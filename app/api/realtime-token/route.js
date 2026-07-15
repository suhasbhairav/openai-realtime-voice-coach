export const runtime = "nodejs";

function offlineResult(prompt) {
  return `
OpenAI Realtime Voice Coach offline realtime session plan

Scenario:
${prompt}

Voice agent setup:
- Create an ephemeral Realtime token on the server.
- Connect from the browser with WebRTC.
- Keep OPENAI_API_KEY server-side only.
- Add transcript logging, consent UX, and rate limits before production.
`.trim();
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "A realtime voice coaching starter with an ephemeral session route and conversation workbench.";

  if (!process.env.OPENAI_API_KEY) {
    return Response.json({
      demo: true,
      model: "offline-fallback",
      output: offlineResult(prompt),
    });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_REALTIME_MODEL || "gpt-realtime",
        instructions: `A realtime voice coaching starter with an ephemeral session route and conversation workbench.\n\nKeep responses concise, helpful, and safe.`,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json(
        { error: data.error?.message || "Could not create realtime session." },
        { status: response.status },
      );
    }

    return Response.json({
      demo: false,
      model: process.env.OPENAI_REALTIME_MODEL || "gpt-realtime",
      clientSecret: data.client_secret?.value,
      output: "Realtime client secret created. Use it from a browser WebRTC client.",
    });
  } catch (error) {
    return Response.json(
      { error: error.message || "Realtime session creation failed." },
      { status: 500 },
    );
  }
}
