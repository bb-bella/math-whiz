
import { MathProblem, Operator, ProblemType, UserStats, AppSettings } from "../types";
import { errorHandler } from "./errorHandler";

// Call the serverless Gemini API
const callGeminiAPI = async (prompt: string, model: string = 'gemini-pro'): Promise<string> => {
  try {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, model }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error("Gemini API call failed:", error);
    throw error;
  }
};

// Generate a specific hint for a problem with contextual guidance
export const getMathHint = async (problem: MathProblem): Promise<string> => {
  const fallbackHints: Record<ProblemType, string> = {
    'arithmetic': 'Look at the numbers again. Do you need to add, subtract, multiply, or divide? You can do this! 🔢',
    'geometry': 'Count the sides, corners, or edges carefully. What shape is it? 📏',
    'fraction': 'Imagine cutting something into pieces. How many pieces total? How many are you using? 🍰',
    'logic': 'Look for patterns! What repeats? What changes? You\'re getting it! 🧩',
    'measurement': 'Compare the sizes or numbers. Which is more? Which is less? 📏',
    'riddle': 'Re-read the riddle carefully. What is each word telling you? Think step by step! 🧩',
    'word': 'What do the words mean? Is it altogether, left over, or each? 💭',
    'time': 'Look at the clock. Where do the hands point? Count carefully! 🕒',
    'sequence': 'What changes between the numbers? More? Less? Double? Half? 🔢'
  };

  try {
    const prompt = `
      You are a super enthusiastic, emoji-loving "Math Cheerleader" for a child learning math.
      
      The Problem: "${problem.questionText}"
      The Answer: ${problem.answer}
      Type: ${problem.type}
      
      Task: Give a massive confidence boost AND a helpful clue about HOW to solve it!
      
      Rules:
      1. NEVER reveal the answer or final number.
      2. Use encouraging phrases like "You're a star!", "Keep going!", "Almost there!", "You've got this!".
      3. Use specific emojis: 📏 for geometry, 🍰 for fractions, 🕒 for time, 🧩 for riddles, 🔢 for arithmetic.
      4. IMPORTANT: Give a specific strategy hint:
         - For FRACTIONS: Hint about "parts of a whole"
         - For GEOMETRY: Hint about counting sides/corners
         - For LOGIC: Hint about finding the pattern
         - For MEASUREMENT: Hint about comparing sizes or units
         - For RIDDLES: Hint about re-reading carefully
         - For ARITHMETIC: Hint about which operation to use
      5. Max 3 sentences total.
    `;

    const response = await callGeminiAPI(prompt);
    return response || fallbackHints[problem.type];
  } catch (error) {
    console.error("Error fetching hint:", error);
    return fallbackHints[problem.type] || "Believe in yourself! Take your time! 🚀";
  }
};

// Generate a new Problem using AI with Adaptive Learning, Strict Difficulty, and Topic Selection
export const generateAIProblem = async (
  settings: AppSettings, 
  stats: UserStats
): Promise<MathProblem> => {
  try {
    const globalDiff = settings.difficulty;
    const topicDiffMap = settings.topicDifficulty || {};
    const topicDiffString = JSON.stringify(topicDiffMap);

    // TOPIC SELECTION: Build list of allowed topics
    let allowedTopics = ['arithmetic', 'geometry', 'fraction', 'word', 'measurement', 'logic', 'riddle'];
    let topicConstraint = '';
    if (settings.focusMode && settings.selectedTopics && settings.selectedTopics.length > 0) {
      allowedTopics = settings.selectedTopics;
      topicConstraint = `FOCUS MODE ACTIVE: ONLY generate from these topics: ${allowedTopics.join(', ')}. Do NOT generate other topics.`;
    }
    const topicList = allowedTopics.join(', ');

    // DIFFICULTY CONSTRAINTS: Build strict difficulty rules
    const difficultyConstraints = {
      easy: {
        numRange: { min: 1, max: 10 },
        operations: ['+', '-'],
        description: 'ONE-digit or TWO-digit numbers. Only addition and subtraction. No multiplication or division.'
      },
      medium: {
        numRange: { min: 1, max: 20 },
        operations: ['+', '-', '*'],
        description: 'Numbers up to 20. Addition, subtraction, multiplication allowed. No division.'
      },
      hard: {
        numRange: { min: 1, max: 50 },
        operations: ['+', '-', '*', '/'],
        description: 'Numbers up to 50. All operations including division allowed. More complex problems.'
      }
    };

    const diffRules = difficultyConstraints[globalDiff];

    // Analyze Stats for Adaptive Learning
    const topicAcc = stats.topicAccuracy || {};
    const weakTopics = Object.entries(topicAcc)
      .filter(([topic, data]) => {
        const d = data as { correct: number; total: number };
        return allowedTopics.includes(topic) && d.total > 2 && (d.correct / d.total) < 0.5;
      })
      .map(([type]) => type);
    
    let focusArea = "";
    let adaptiveNote = "";
    
    if (weakTopics.length > 0) {
      const topic = weakTopics[Math.floor(Math.random() * weakTopics.length)];
      focusArea = `User is struggling with ${topic}. Prioritize a ${topic} problem if possible.`;
      adaptiveNote = "ADAPTIVE MODE ACTIVE";
    } else if (stats.streak > 4) {
      focusArea = "User is on a hot streak! Challenge them!";
      adaptiveNote = "CHALLENGE MODE";
    }

    const systemInstruction = `
      You are a math engine for a kids app (Grades 2-6).
      
      STRICT DIFFICULTY RULES FOR "${globalDiff}":
      - Number Range: ${diffRules.numRange.min} to ${diffRules.numRange.max}
      - Allowed Operations: ${diffRules.operations.join(', ')}
      - ${diffRules.description}
      - FOR ALL ARITHMETIC PROBLEMS: Use ONLY numbers in the allowed range and operations above.
      
      TOPIC SELECTION:
      ${topicConstraint}
      Generate from: ${topicList}
      
      Per-Topic Difficulty Overrides: ${topicDiffString}
      Adaptive Instruction: ${focusArea}
      
      Generate ONE math problem matching the constraints above.
      
      Problem Types Guidelines:
      - RIDDLE: A math riddle with numeric answer. Structure so answer is a number (e.g., "How many corners? Answer: 4")
      - MEASUREMENT: Conversions (cm->m, g->kg), comparing sizes. Use simple numbers.
      - FRACTIONS: Addition/Subtraction of fractions. Start with simple fractions like 1/2, 1/3, 1/4.
      - GEOMETRY: Sides, vertices, shape identification. Ask "How many?"
      - LOGIC: Emoji algebra. Simple patterns for younger kids.
      - ARITHMETIC: Standard math following difficulty rules strictly.
      - WORD: Story problems with numbers in the allowed range.
      - TIME: Clock problems appropriate to difficulty level.
      - SEQUENCE: Number patterns following difficulty rules.
      
      Output JSON ONLY matching this schema:
      {
        "questionText": "string (The full question. Use EMOJIS heavily!)",
        "answer": number (The numeric answer only.),
        "type": "arithmetic" | "word" | "sequence" | "time" | "geometry" | "fraction" | "logic" | "measurement" | "riddle",
        "displayMode": "standard" | "text",
        "num1": number (Optional),
        "num2": number (Optional),
        "operator": "+" | "-" | "*" | "/" (Optional),
        "difficultyLevel": "${globalDiff}"
      }
    `;

    const prompt = `Generate a math problem. ${adaptiveNote}\n\n${systemInstruction}`;

    const response = await callGeminiAPI(prompt, 'gemini-pro');
    
    if (!response) throw new Error("No response from API");

    // Robust JSON Extraction
    let jsonText = response;
    const jsonStartIndex = jsonText.indexOf('{');
    const jsonEndIndex = jsonText.lastIndexOf('}');
    
    if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
      jsonText = jsonText.substring(jsonStartIndex, jsonEndIndex + 1);
    }
    
    const data = JSON.parse(jsonText);

    return {
      id: Date.now().toString(),
      questionText: data.questionText,
      answer: data.answer,
      type: data.type as ProblemType,
      displayMode: data.displayMode as 'standard' | 'text',
      num1: data.num1,
      num2: data.num2,
      operator: data.operator as Operator || Operator.OTHER,
      difficultyLevel: globalDiff
    };

  } catch (error) {
    console.error("AI Generation failed, falling back to local:", error);
    return generateLocalProblem(settings.difficulty);
  }
};

// Fallback Generator
const generateLocalProblem = (difficulty: 'easy' | 'medium' | 'hard'): MathProblem => {
    let min = 1, max = 10;
    const ops = [Operator.ADD, Operator.SUBTRACT];
    if (difficulty === 'medium') { max = 20; ops.push(Operator.MULTIPLY); }
    else if (difficulty === 'hard') { max = 50; ops.push(Operator.MULTIPLY, Operator.DIVIDE); }

    const op = ops[Math.floor(Math.random() * ops.length)];
    let n1 = Math.floor(Math.random() * (max - min + 1)) + min;
    let n2 = Math.floor(Math.random() * (max - min + 1)) + min;

    if (op === Operator.SUBTRACT && n1 < n2) [n1, n2] = [n2, n1];
    if (op === Operator.DIVIDE) n1 = n2 * (Math.floor(Math.random() * 10) + 1);

    let ans = 0;
    switch(op) {
      case Operator.ADD: ans = n1 + n2; break;
      case Operator.SUBTRACT: ans = n1 - n2; break;
      case Operator.MULTIPLY: ans = n1 * n2; break;
      case Operator.DIVIDE: ans = n1 / n2; break;
    }

    return {
      id: Date.now().toString(),
      type: 'arithmetic',
      displayMode: 'standard',
      num1: n1,
      num2: n2,
      operator: op,
      answer: ans,
      questionText: `${n1} ${op} ${n2} = ?`
    };
};
