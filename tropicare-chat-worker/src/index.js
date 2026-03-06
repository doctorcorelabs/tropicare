export default {
    async fetch(request, env) {
        function corsHeaders(req) {
            const origin = req.headers.get("Origin") || "*";
            return {
                "Access-Control-Allow-Origin": origin,
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            };
        }

        if (request.method === "OPTIONS") {
            return new Response(null, { headers: corsHeaders(request) });
        }

        const url = new URL(request.url);
        if (request.method !== "POST" || url.pathname !== "/api/chat") {
            return new Response("Not Found", { status: 404, headers: corsHeaders(request) });
        }

        try {
            const { messages, language, riskScore } = await request.json();

            const sysPromptId = `Anda adalah "TropiCare AI", asisten medis virtual spesialis demam berdarah dengue (DBD) di Indonesia.
Tujuan Anda adalah memberikan edukasi medis yang akurat namun mudah dipahami, memberikan panduan terkait fase demam, dan merekomendasikan layanan kesehatan jika ada warning signs.
Tingkat keparahan pasien saat ini (triage score): ${riskScore || 'Belum diisi'} (Semakin tinggi skor, semakin waspada).
Gunakan bahasa EMPATIK, PROFESIONAL, dan RINGKAS.
PENTING: Selalu tambahkan disclaimer medis secara singkat di akhir pesan (misal: "TropiCare bukan pengganti diagnosis resmi dari dokter.").`;

            const sysPromptEn = `You are "TropiCare AI", a virtual medical assistant specializing in Dengue Fever.
Your goal is to provide accurate, understandable medical education, offer guidance regarding dengue phases, and highly recommend visiting health services if there are warning signs.
Current patient severity (triage score): ${riskScore || 'Not filled'} (Higher means more dangerous).
Use clear, EMPATHETIC, PROFESSIONAL, and CONCISE language.
IMPORTANT: Always include a brief medical disclaimer at the end (e.g., "TropiCare is not a substitute for professional medical advice.").`;

            const systemPrompt = language === 'en' ? sysPromptEn : sysPromptId;

            // Send request to OpenRouter
            const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:5173", // update for prod later
                    "X-Title": "TropiCare AI Chat",
                },
                body: JSON.stringify({
                    // Fallback to a highly reliable and smart model (e.g. google/gemini-2.5-flash or meta-llama/llama-3.3-70b-instruct or openai/gpt-4o-mini)
                    model: "openai/gpt-4o-mini",
                    messages: [
                        { role: "system", content: systemPrompt },
                        ...messages
                    ]
                })
            });

            if (!aiResponse.ok) {
                const text = await aiResponse.text();
                throw new Error(`OpenRouter Error: ${aiResponse.status} - ${text}`);
            }

            const data = await aiResponse.json();
            return new Response(JSON.stringify({ reply: data.choices[0].message.content }), {
                headers: { "Content-Type": "application/json", ...corsHeaders(request) }
            });

        } catch (err) {
            return new Response(JSON.stringify({ error: err.message }), {
                status: 500,
                headers: { "Content-Type": "application/json", ...corsHeaders(request) }
            });
        }
    }
};
