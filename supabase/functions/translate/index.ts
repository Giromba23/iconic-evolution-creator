import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const text: string | undefined = body?.text;
    const texts: string[] | undefined = Array.isArray(body?.texts) ? body.texts : undefined;
    const targetLanguage: string | undefined = body?.targetLanguage;

    if ((!text && (!texts || texts.length === 0)) || !targetLanguage) {
      return new Response(JSON.stringify({ error: "Missing 'text'/'texts' or 'targetLanguage'" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const languageNames: Record<string, string> = {
      en: "English",
      es: "Spanish",
      pt: "Portuguese"
    };

    const SEP = "<<<SEP>>>";
    const messages = texts && texts.length > 0
      ? [
          { 
            role: "system", 
            content: `You are a professional translator. Translate each text segment separated by ${SEP} into ${languageNames[targetLanguage] || targetLanguage}.
CRITICAL RULES:
- Return ONLY the translated segments joined by ${SEP}
- Same order and same count as input
- Keep similar text length (avoid making translations much longer)
- Preserve HTML tags exactly as they are (like <strong>, <em>, etc)
- Do NOT add XML tags like <spellPassiveDescription>
- Do NOT add explanations or formatting
- Maintain numbers and game terms unchanged`
          },
          { role: "user", content: texts.join(SEP) },
        ]
      : [
          { 
            role: "system", 
            content: `You are a professional translator. Translate to ${languageNames[targetLanguage] || targetLanguage}.
CRITICAL RULES:
- Return ONLY the translated text
- Keep similar length to original (avoid bloating text)
- Preserve HTML tags exactly
- No quotes, no explanations, no XML tags
- Maintain numbers and game terms`
          },
          { role: "user", content: text as string },
        ];
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: `AI gateway error: ${response.status}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content as string | undefined;

    if (!content) {
      throw new Error("No translation received");
    }

    // Clean up any unwanted XML tags or formatting
    content = content
      .replace(/<\/?spellPassiveDescription>/gi, '') // Remove spell tags
      .replace(/<\/?[a-z]+Description>/gi, '') // Remove any *Description tags
      .trim();

    if (texts && texts.length > 0) {
      const parts = content.split(SEP).map((s: string) => s.trim());
      return new Response(
        JSON.stringify({ translatedTexts: parts }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ translatedText: content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Translation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
