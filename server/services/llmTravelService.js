const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function buildPrompt({
  duration,
  userMessage,
  myStats,
  friendStats,
  myCountries,
  friendCountries,
}) {
  const visitedByEither = [...new Set([...myCountries, ...friendCountries])];

  return `
You are a travel recommendation assistant.

Goal:
Recommend ONE destination that is new to both travellers.

Rules:
- Do not recommend a country already visited by either traveller.
- Respect the trip duration exactly: ${duration}
- Base your answer on both travellers' travel patterns.
- Keep the tone warm, concise, and practical.
- Return VALID JSON only.
- Include up to 3 alternatives.

Traveller A stats:
${JSON.stringify(myStats, null, 2)}

Traveller B stats:
${JSON.stringify(friendStats, null, 2)}

Traveller A visited countries:
${JSON.stringify(myCountries, null, 2)}

Traveller B visited countries:
${JSON.stringify(friendCountries, null, 2)}

Countries already visited by either traveller:
${JSON.stringify(visitedByEither, null, 2)}

User message:
${userMessage || "Suggest a destination new to both of us."}

Return JSON in exactly this shape:
{
  "reply": "string",
  "suggestion": {
    "destination": "string",
    "city": "string",
    "duration": "string",
    "budget": "Low | Medium | High",
    "season": "string",
    "reason": "string",
    "tags": ["string"],
    "why_new_for_both": true
  },
  "alternatives": [
    {
      "destination": "string",
      "city": "string"
    }
  ]
}
`;
}

async function getTravelSuggestionFromLLM({
  duration,
  userMessage,
  myStats,
  friendStats,
  myCountries,
  friendCountries,
}) {
  const prompt = buildPrompt({
    duration,
    userMessage,
    myStats,
    friendStats,
    myCountries,
    friendCountries,
  });

  const response = await client.responses.create({
    model: process.env.OPENAI_MODEL || "gpt-5.4",
    input: prompt,
  });

  const text = response.output_text?.trim();

  if (!text) {
    throw new Error("No response returned from LLM");
  }

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("LLM returned invalid JSON");
  }

  return parsed;
}

module.exports = {
  getTravelSuggestionFromLLM,
};
