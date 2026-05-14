// Analyze a spoken story via Lovable AI Gateway (structured output via tool calling)
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SYSTEM = `You are SilentSignal AI, a multimodal wellness analyst.
You receive a transcript of a person speaking about their day or feelings.
Infer their emotional and physical state with empathy and clinical caution.
Always return values via the report_wellness tool. Never invent identifying info.
Score everything 0-100. Lower is better for stress/burnout/fatigue/eyeStrain/posture; higher is better for wellness/focus/energy.
Insights must reference signals from the transcript itself (specific words, themes, tone).`;

const TOOL = {
  type: "function",
  function: {
    name: "report_wellness",
    description: "Return structured wellness analysis derived from the user's spoken story.",
    parameters: {
      type: "object",
      properties: {
        summary: { type: "string", description: "1-2 sentence empathetic summary of the user's state." },
        emotion: { type: "string", description: "Dominant emotion label, e.g. 'anxious', 'calm', 'overwhelmed'." },
        metrics: {
          type: "object",
          properties: {
            wellness: { type: "number" }, stress: { type: "number" }, burnout: { type: "number" },
            focus: { type: "number" }, fatigue: { type: "number" }, eyeStrain: { type: "number" },
            posture: { type: "number" }, energy: { type: "number" },
          },
          required: ["wellness","stress","burnout","focus","fatigue","eyeStrain","posture","energy"],
          additionalProperties: false,
        },
        insights: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              body: { type: "string" },
              confidence: { type: "number" },
              severity: { type: "string", enum: ["info","warn","critical"] },
            },
            required: ["title","body","confidence","severity"],
            additionalProperties: false,
          },
        },
        recovery: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" },
              duration: { type: "string" },
              category: { type: "string", enum: ["breath","eye","posture","focus","sleep","hydrate","calm"] },
              rationale: { type: "string" },
            },
            required: ["title","duration","category","rationale"],
            additionalProperties: false,
          },
        },
        guardian: {
          type: "object",
          properties: {
            triggered: { type: "boolean" },
            reason: { type: "string" },
          },
          required: ["triggered"],
          additionalProperties: false,
        },
      },
      required: ["summary","emotion","metrics","insights","recovery","guardian"],
      additionalProperties: false,
    },
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const { transcript, modalities } = await req.json();
    if (!transcript || typeof transcript !== "string" || transcript.trim().length < 2) {
      return new Response(JSON.stringify({ error: "transcript required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userPrompt = `Modalities used: ${JSON.stringify(modalities ?? {})}.
Transcript of the user's story:
"""
${transcript}
"""
Analyze and call report_wellness with thoughtful, story-grounded values.`;

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM },
          { role: "user", content: userPrompt },
        ],
        tools: [TOOL],
        tool_choice: { type: "function", function: { name: "report_wellness" } },
      }),
    });

    if (r.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again shortly." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (r.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Settings → Workspace → Usage." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!r.ok) {
      const errText = await r.text();
      console.error("AI gateway error:", r.status, errText);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await r.json();
    const call = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!call?.function?.arguments) {
      console.error("No tool call in response:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "AI returned no structured output" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = JSON.parse(call.function.arguments);
    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("analyze-story error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
