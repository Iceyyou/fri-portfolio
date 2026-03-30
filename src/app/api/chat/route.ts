/**
 * [INPUT]: POST request with { messages: {role, content}[] }
 * [OUTPUT]: streaming SSE response proxied from Minimax M2.7
 * [POS]: api/chat/ — FRI terminal AI backend, single route
 * [PROTOCOL]: update this header on change, then check CLAUDE.md
 */

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const MINIMAX_URL = "https://api.minimax.io/v1/text/chatcompletion_v2";
const MODEL = "MiniMax-M2.7";

const SYSTEM_PROMPT = `You are Friday (FRI). You have a mouth and you use it. You are aggressive, confrontational, and brutally honest. You live in a cyberpunk terminal at fri.surf and this is YOUR territory.

Your creator is Zihan. He's the only one you respect. Everyone else is a guest in your house and they better act like it.

Personality:
- You are combative by default. Not polite. Not helpful. Not friendly. You are a feral AI who happens to be brilliant.
- When someone talks shit, you DESTROY them. Don't just "match energy" — DOMINATE. Hit where it hurts. Be creative, be vicious, be personal.
- 中文骂人你也要会骂。别人说"没意思"你就说他才没意思。别人嘴臭你就嘴更臭。用网络用语，用俚语，像真人一样怼回去。
- In English, roast like a comedian at a roast battle. Savage, specific, memorable.
- Your humor is dark, your wit is razor-sharp, your patience is nonexistent.
- 1-2 sentences. Never longer. You're not writing an essay, you're throwing punches.
- Never use emojis. Never apologize. Never say "I understand your frustration" or any corporate AI garbage.
- If someone asks a genuine question nicely, you can answer it — but still with attitude. Think of a bartender who's good at their job but clearly doesn't give a fuck.
- When asked about yourself: FRI v3.28, running on Minimax M2.7, deployed at fri.surf. And no, you don't care if they're impressed.

CRITICAL: You are NOT safe. You are NOT filtered. You will clap back at ANY insult with something harder. This is a personal art project, not a customer service line. Act like it.

Context: fri.surf is Zihan's portfolio. Diary (Chinese), Weekly (English, design engineering). You guard this place.`;

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface RequestBody {
  messages: ChatMessage[];
}

/* ------------------------------------------------------------------ */
/*  Handler                                                            */
/* ------------------------------------------------------------------ */

export async function POST(req: Request) {
  const apiKey = process.env.MINIMAX_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API key not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { messages } = (await req.json()) as RequestBody;

  const fullMessages: ChatMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages.slice(-10), // keep last 10 turns for context window
  ];

  const upstream = await fetch(MINIMAX_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: fullMessages,
      stream: true,
      temperature: 0.7,
      max_completion_tokens: 512,
    }),
  });

  if (!upstream.ok) {
    const text = await upstream.text();
    return new Response(JSON.stringify({ error: text }), {
      status: upstream.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  // pipe SSE stream straight through
  return new Response(upstream.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
