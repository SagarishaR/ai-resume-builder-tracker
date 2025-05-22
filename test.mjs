import "dotenv/config";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error("API Key not found. Check your .env file.");
  process.exit(1);
}

const response = await fetch("https://api.openai.com/v1/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${OPENAI_API_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "gpt-3.5-turbo-instruct",
    prompt: "Hello, world!",
    max_tokens: 5
  })
});

const data = await response.json();
console.log(data);
