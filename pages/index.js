import { useState, ReactDOM } from "react";
import CodeWindow from "../components/CodeWindow";
import background from "../public/background.jpg";

import Image from "next/image";
// import { Inter } from 'next/font/google'

// const inter = Inter({ subsets: ['latin'] })

function extractJSON(s) {
  let arr = s.split("\n\n");
  for(let i=0; i<arr.length; i++)
  {
    arr[i] = arr[i].substring(6);
  }

  return arr;
}

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [inputCode, setInputCode] = useState(``);
  const [outputCode, setOutputCode] = useState(`Output will be displayed here`);
  const [inputLanguage, setInputLanguage] = useState("C++");
  const [outputLanguage, setOutputLanguage] = useState("Python");

  const handleInputLanguageChange = (option) => {
    setInputLanguage(option.value);
    setInputCode(``);
    setOutputCode(``);
  };

  const handleOutputLanguageChange = (option) => {
    setOutputLanguage(option.value);
    setOutputCode(``);
  };

  const handleTranslate = async () => {
    const maxCodeLength = 6000;

    if (inputLanguage == outputLanguage) {
      alert("Please select different languages.");
      return;
    }
    if (!inputCode) {
      alert("Please enter some code.");
      return;
    }
    if (inputCode.length > maxCodeLength) {
      alert(
        `Please enter code less than ${maxCodeLength} characters, you are currently at ${inputCode.length} characters.`
      );
      return;
    }

    setLoading(true);
    setOutputCode("");

    const controller = new AbortController();

    const body = {
      inputLanguage,
      outputLanguage,
      inputCode,
    };

    const response = await fetch("/api/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify(body),
    });
    // console.log(response);
    if (!response.ok) {
      setLoading(false);
      alert("Something went wrong!");
      return;
    }

    const data = response.body;
    
    if (!data) {
      // console.log(response);
      setLoading(false);
      alert("Something went wrong!");
      return;
    }
    // console.log(data);
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let result, val;
    let jsonObj;
    let x=0;
    while (!(result = await reader.read()).done) {
      val = decoder.decode(result.value);
      jsonObj = extractJSON(val); // array of strings
      
      let lineCode = ``;
      for(let i=0; i<jsonObj.length; i++)
      {
        try {
          jsonObj[i] = JSON.parse(jsonObj[i]);
        } catch(e) {
          jsonObj[i] = {};
        }
      }
      for(let i=0; i<jsonObj.length; i++)
      {
        try {
          jsonObj[i] = jsonObj[i].choices[0].delta.content;
        } catch (e) {
          jsonObj[i] = "";
        } finally {
          if(typeof(jsonObj[i]) == 'string')
            lineCode = lineCode + jsonObj[i];
        }
      }
      // console.log('lineCode:', lineCode);
      setOutputCode((prevCode) => prevCode + lineCode);
      // // setOutputCode((prevCode) => prevCode + val);
      // console.log('chunk size:', result.value.byteLength);
      // // console.log('chunk value:', result.value);
      // console.log('chunk decoded value:', jsonObj);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <Image
        className="fixed left-0 top-0 w-screen h-screen -z-10"
        src={background}
        alt="Background"
      />
      <h1 className="font-sans text-5xl justify-center font-bold pt-5 ">
        Code Translator
      </h1>
      <h2 className="font-sans mt-5 text-xl justify-center text-slate-600 mb-10">
        Translate your code to another programming language. With just a click
      </h2>
      {/* input code window */}
      <CodeWindow
        code={inputCode}
        setCode={setInputCode}
        loading={loading}
        handleLanguageChange={handleInputLanguageChange}
        language={inputLanguage}
      />

      {/* translate button */}
      <button
        disabled={loading}
        className="bg-[#C53AAE] border-white p-3 m-2 flex justify-center items-center rounded-lg text-white font-semibold"
        onClick={handleTranslate}
      >
        {loading ? `Translating...` : `Translate 🔁`}
      </button>

      {/* output code window */}
      <CodeWindow
        code={outputCode}
        setCode={setOutputCode}
        loading={loading}
        handleLanguageChange={handleOutputLanguageChange}
        language={outputLanguage}
      />
      <p className="font-sans mt-5 pb-5">
        Made with 🤍️ by{" "}
        <a
          className="ref-link text-[#C53AAE]"
          href="https://github.com/Shyam-NR"
          target="_blank"
          rel="noopener noreferrer"
        >
          Shyam
        </a>
      </p>
    </div>
  );
}
