import endent from "endent";

const apiKey = process.env.OPENAI_API_KEY;
const createPrompt = (inputLanguage, outputLanguage, inputCode) => {
  if (inputLanguage === "Natural Language") {
    return endent`
            You are an expert programmer in all programming languages. Translate the natural language to "${outputLanguage}" code.

            Example translating from natural language to JavaScript:

            Natural language:
            Print the numbers 0 to 9.

            JavaScript code:
            for (let i = 0; i < 10; i++) {
            console.log(i);
            }

            Natural language:
            ${inputCode}

            ${outputLanguage} code: 
        `;
  } else if (outputLanguage === "Natural Language") {
    return endent`
            You are an expert programmer in all programming languages. Translate the "${inputLanguage}" code to natural language in plain English that the average adult could understand. Respond as bullet points starting with -.

            Example translating from JavaScript to natural language:

            JavaScript code:
            for (let i = 0; i < 10; i++) {
                console.log(i);
            }

            Natural language:
            Print the numbers 0 to 9.

            ${inputLanguage} code:
            ${inputCode}

            Natural language:
        `;
  } else {
    return endent`
            You are an expert programmer in all programming languages. Translate the "${inputLanguage}" code to "${outputLanguage}" code. Do not include \\\\\\\\\\\\.

            Example translating from JavaScript to Python:

            JavaScript code:
            for (let i = 0; i < 10; i++) {
                console.log(i);
            }

            Python code:
            for i in range(10):
                print(i)

            ${inputLanguage} code:
            ${inputCode}

            ${outputLanguage} code (no \\\\\\\\\\\\):
        `;
  }
};

export const OpenAIStream = async (inputLanguage, outputLanguage, inputCode) => {
    const prompt = createPrompt(inputLanguage, outputLanguage, inputCode);

    const system = {role: 'system', content: prompt};

    const res = await fetch(`https://api.openai.com/v1/chat/completions`, {
        headers: {
            'Content-Type': 'application/json',
            Authorization : `Bearer ${apiKey}`,
        },
        method: 'POST',
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [system],
            temperature: 0,
            stream: true,
        }),
    });
    return res;
};