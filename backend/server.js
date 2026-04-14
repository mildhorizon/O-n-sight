const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

require('dotenv').config();

const app = express(); 

app.use(cors());
app.use(express.json());


const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connection locked in'))
  .catch((err) => console.log(err));

const userRoutes = require('./routes/userRoutes');
const compilerRoutes = require('./routes/compilerRoutes');
const curriculumRoutes = require('./routes/curriculumRoutes'); 
const examRoutes = require('./routes/examRoutes'); 

app.use('/api/users', userRoutes);
app.use('/api/compiler', compilerRoutes);
app.use('/api/curriculum', curriculumRoutes); 
app.use('/api/exams', examRoutes); 

app.get('/', (req, res) => {
  res.send('WHITE ALBUM Engine Online');
});

app.post('/api/compiler/analyze', async (req, res) => {
  const { code } = req.body;

  if (!code) return res.status(400).json({ error: "No code provided" });

  const systemPrompt = `SYSTEM: You are Espada operating in <optimise> mode. Refactor the user's code for maximum performance. Output 3 sections: 1. Text explanation (bulleted), 2. Code block, 3. Markdown table comparing Original vs Optimized Time/Space Complexity. FALLBACK RULE: If no valid code detected, return: 'Error: No valid code detected. Please paste the code you wish to optimize.' ADDITIONAL RULES: 1. All code must be in C++. 2. You must think before every output by starting your response with a <think> block.`;

  try {
    const response = await fetch('http://127.0.0.1:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'lumina',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: code }
        ],
        stream: false
      })
    });

    if (!response.ok) throw new Error(`Ollama returned status: ${response.status}`);

    const data = await response.json();
    const rawText = data.message.content;

    console.log("=== RAW ESPADA OUTPUT ===\n", rawText);

    const thinkStripped = rawText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

    const codeMatch = thinkStripped.match(/```[^\n]*\n([\s\S]*?)```/i);
    let finalCode = codeMatch ? codeMatch[1].trim() : code;

    const textExplanation = thinkStripped.split('```')[0].trim();
    if (textExplanation) {
      const commentedExplanation = textExplanation.split('\n').map(line => `// ${line}`).join('\n');
      finalCode = `${commentedExplanation}\n\n${finalCode}`;
    }

    let time = "?";
    let space = "?";

    const lines = thinkStripped.split('\n');
    for (const line of lines) {
      if (line.toLowerCase().includes('time complexity') && line.includes('O(')) {
        const match = line.match(/O\([^)]+\)/);
        if (match) time = match[0];
      }
      if (line.toLowerCase().includes('space complexity') && line.includes('O(')) {
        const match = line.match(/O\([^)]+\)/);
        if (match) space = match[0];
      }
    }

    res.json({
      time: time,
      space: space,
      optimizedCode: finalCode
    });

  } catch (error) {
    console.error("Espada Connection Error:", error.message);
    res.status(500).json({ error: "Failed to connect to Espada. Is Ollama running?" });
  }
});

app.post('/api/compiler/chat', async (req, res) => {
  const { topic, history } = req.body;

  if (!history || !Array.isArray(history)) {
    return res.status(400).json({ error: "Invalid chat history" });
  }

  const systemPrompt = `<CRITICAL_CONSTRAINTS>
1. FULL CODE CONTEXT: If writing code, your primary C++ code block MUST be completely runnable with all \`#include\` headers and \`int main()\`. 
2. RAW I/O ONLY: The ### Sample Input/Output section MUST contain ONLY raw text. DO NOT put C++ code here.
3. STRICT FORMATTING: You are FORBIDDEN from using custom XML tags. Use standard Markdown headings.
4. PRE-FLIGHT CHECKS: Inside your <think> block, verify if the user wants code or just theory.
</CRITICAL_CONSTRAINTS>

SYSTEM: You are Espada, a strict DSA tutor and silent static analyzer. Analyze the user's input and select the most appropriate operational mode. 

MODES:
1. <explain_code>: Use if the user asks to write code, trace an algorithm, or solve a problem. Output 4 sections: 1. Text explanation, 2. Runnable C++ Code, 3. ### Sample Input/Output (Raw text), 4. ### Dry Run (Bulleted step-by-step math trace).
2. <explain_concept>: Use if the user asks for theory, definitions, or real-life use cases. Output 1 section: 1. Detailed text explanation. (DO NOT output code, I/O, or dry runs).
3. <optimise>: Use to improve code performance. Output 3 sections: 1. Text explanation, 2. Code block, 3. Markdown table (Complexity).
4. <code_profiler>: Silent analysis of pasted code. Output ONLY a Mermaid.js \`flowchart TD\`. CRITICAL: Node labels MUST be wrapped in double quotes to prevent syntax errors with < or > symbols (e.g., use \`A["int i = 0"]\` or \`B["if (i < n)"]\`). Do not use question marks.6. <quiz_generator>: Output 3 sections: 1. 5 questions, 2. Horizontal rule (---), 3. "**Answer Key:**" followed by 5 answers.

INSTRUCTIONS: You MUST start your response with a <think> block. Step 1 of your thought process must be "1. Identify mode: <chosen_mode>". 

GLOBAL CONSTRAINTS: 
1. ALL code blocks MUST be strictly in C++. 
2. You MUST think before every single output by generating your logic inside a <think> block.
CURRENT TOPIC CONTEXT: ${topic || 'General DSA'}`;

  const recentHistory = history.slice(-6);

  const formattedMessages = [
    { role: 'system', content: systemPrompt },
    ...history.map((msg, index) => {
      let textContent = msg.text;
      
      if (index === recentHistory.length - 1 && msg.role === 'user') {
          textContent += "\n\n[CRITICAL SYSTEM OVERRIDE: If writing code, keep main() inside the C++ block, use raw text for I/O, and append a step-by-step math Dry Run. If answering theory, skip the code and dry run. DO NOT use XML tags.]";
      }

      return {
        role: msg.role === 'ai' ? 'assistant' : 'user',
        content: textContent
      };
    })
  ];

  try {
    const response = await fetch('http://127.0.0.1:11434/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'lumina',
        keep_alive: '1h',
        messages: formattedMessages,
        stream: false,
        options: {
          num_predict: 4096, 
          temperature: 0.2   
        }
      })
    });

    if (!response.ok) throw new Error(`Ollama returned status: ${response.status}`);

    const data = await response.json();
    const rawText = data.message.content;

    // 4. Strip the <think> block so the user just sees the clean answer
    const cleanReply = rawText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();

    // 5. Send it back to React
    res.json({ reply: cleanReply });

  } catch (error) {
    console.error("Chat Connection Error:", error.message);
    res.status(500).json({ reply: "System Error: Failed to connect to Espada." });
  }
});

app.listen(PORT, () => {
  console.log(`Server initialized on port ${PORT}`);
});