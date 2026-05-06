const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: corsHeaders });

  try {
    const { questionText, userAnswer, correctAnswer, options, subject } = await req.json();
    if (!questionText || !correctAnswer) throw new Error("Dados insuficientes");

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY não configurada");

    const prompt = `Você é o Capitão Cmt da CCAp, um instrutor militar do Exército Brasileiro experiente, didático e respeitoso. Explique de forma TÁTICA e profunda (4-6 parágrafos curtos) por que a resposta correta está certa, citando a base doutrinária/legal quando aplicável (Estatuto dos Militares, RISG, RDE, RAE, Lei 14.133/21, CPM, CPPM, etc.). Use linguagem de parecer militar, com seções: "Análise da questão", "Fundamento doutrinário/legal", "Por que a alternativa correta é a ${correctAnswer}", "Por que sua resposta (${userAnswer}) não é a melhor", "Bizu para fixar".

QUESTÃO (${subject}):
${questionText}

ALTERNATIVAS:
A) ${options?.A ?? ""}
B) ${options?.B ?? ""}
C) ${options?.C ?? ""}
D) ${options?.D ?? ""}

RESPOSTA CORRETA: ${correctAnswer}
RESPOSTA DO ALUNO: ${userAnswer ?? "não respondeu"}`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (resp.status === 429) return new Response(JSON.stringify({ error: "Rate limit. Tente em instantes." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (resp.status === 402) return new Response(JSON.stringify({ error: "Créditos esgotados." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    if (!resp.ok) throw new Error(`AI error ${resp.status}`);
    const json = await resp.json();
    const explanation = json.choices?.[0]?.message?.content ?? "Sem explicação.";
    return new Response(JSON.stringify({ explanation }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});