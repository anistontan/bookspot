const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
    apiKey: 'your_openai_api_key_here',
});

const openai = new OpenAIApi(configuration);

async function testOpenAI() {
    try {
        const response = await openai.createCompletion({
            model: "chat-gpt4",
            prompt: "Say hello world",
            max_tokens: 5,
        });
        console.log(response.data.choices[0].text.trim());
    } catch (error) {
        console.error("Error fetching data from OpenAI:", error);
    }
}

testOpenAI();
