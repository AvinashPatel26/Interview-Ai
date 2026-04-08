import axios from "axios";

export const askAi = async (messages) => {
    try {
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            throw new Error("Messages are empty");
        }

        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                model: "openai/gpt-4o-mini",
                messages: messages, // ✅ FIXED
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, // ✅ use env
                    "Content-Type": "application/json",
                },
            }
        );

        // ✅ return AI message
        const content = response?.data?.choices[0]?.message?.content;

        if (!content || !content.trim()) {
            throw new Error("AI returned empty response")
        }
        return content;
    } catch (error) {
        console.error("AI Error:", error.response?.data || error.message);
        throw error; // ✅ important
    }
};