// Transcribe audio via Lovable AI Gateway (Gemini multimodal)
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const inForm = await req.formData();
    const file = inForm.get("audio");
    if (!(file instanceof File) && !(file instanceof Blob)) {
      return new Response(JSON.stringify({ error: "audio file required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Convert to base64
    const buf = new Uint8Array(await (file as Blob).arrayBuffer());
    let binary = "";
    const chunkSize = 0x8000;
    for (let i = 0; i < buf.length; i += chunkSize) {
      binary += String.fromCharCode.apply(null, Array.from(buf.subarray(i, i + chunkSize)));
    }
    const base64 = btoa(binary);

    // Detect mime
    const type = (file as Blob).type || "audio/webm";
    let format = "webm";
    if (type.includes("mp4") || type.includes("m4a") || type.includes("aac")) format = "mp4";
    else if (type.includes("mpeg") || type.includes("mp3")) format = "mp3";
    else if (type.includes("wav")) format = "wav";
    else if (type.includes("ogg")) format = "ogg";

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Transcribe clear human speech in this audio verbatim. If there is no clear speech, return an empty string. Return only the transcript text, no commentary." },
              { type: "input_audio", input_audio: { data: base64, format } },
            ],
          },
        ],
        temperature: 0,
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
      console.error("AI gateway STT failed:", r.status, errText);
      return new Response(JSON.stringify({ error: "Transcription failed", detail: errText }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await r.json();
    const text = data?.choices?.[0]?.message?.content ?? "";
    return new Response(JSON.stringify({ text: typeof text === "string" ? text : "" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("transcribe error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
