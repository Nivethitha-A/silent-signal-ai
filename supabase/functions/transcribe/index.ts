// Transcribe audio via ElevenLabs Scribe v2
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("ELEVENLABS_API_KEY");
    if (!apiKey) throw new Error("ELEVENLABS_API_KEY is not configured");

    const inForm = await req.formData();
    const file = inForm.get("audio");
    if (!(file instanceof File) && !(file instanceof Blob)) {
      return new Response(JSON.stringify({ error: "audio file required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fd = new FormData();
    fd.append("file", file, "story.webm");
    fd.append("model_id", "scribe_v2");
    fd.append("tag_audio_events", "true");
    fd.append("diarize", "false");

    const r = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST",
      headers: { "xi-api-key": apiKey },
      body: fd,
    });

    if (!r.ok) {
      const errText = await r.text();
      console.error("ElevenLabs STT failed:", r.status, errText);
      return new Response(JSON.stringify({ error: "Transcription failed", detail: errText }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await r.json();
    return new Response(JSON.stringify({ text: data.text ?? "", words: data.words ?? [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("transcribe error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
