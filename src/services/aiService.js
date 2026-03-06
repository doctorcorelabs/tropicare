// Configure this depending on environment
const WORKER_URL = import.meta.env.VITE_WORKER_URL || 'http://localhost:8787/api/chat';

export async function sendMessageToAI(messages, language, riskScore = 0, chatType = 'triage') {
    try {
        const response = await fetch(WORKER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messages,
                language,
                riskScore,
                chatType
            })
        });

        if (!response.ok) {
            let errorText = await response.text();
            throw new Error(`AI Request Failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        return data.reply;
    } catch (error) {
        console.error("AI Service Error:", error);
        throw error;
    }
}
