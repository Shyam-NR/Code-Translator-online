import { OpenAIStream } from "@/utils";

export const config = {
  runtime: "edge",
};

export default async function handler(req, res) {
  try {
    const { inputLanguage, outputLanguage, inputCode } = await req.json();

    const stream = await OpenAIStream(inputLanguage, outputLanguage, inputCode);
    // console.log("Stream\n" + stream.body + "\nendOFStream");
    // const response = new Response(stream);
    // console.log(response + "\n\n\nHEEHEHEHEHEHEHE");
    return stream;

  } catch (e) {
    console.log(123 + e);
    res.status(500).send(e);
  }
};
