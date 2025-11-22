
import { GoogleGenAI, Type } from "@google/genai";
import { MathProblem, Operator, ProblemType, UserStats, AppSettings } from "../types";
import { config } from "./config";
import { errorHandler } from "./errorHandler";

const getClient = () => {
  const apiKey = config.apiKey;
  if (!apiKey) {
    errorHandler.log(
      "API Key not configured. Using local problem generation.",
      "info",
      "gemini-service"
    );
    return null;
  }
  try {
    return new GoogleGenAI({ apiKey });
  } catch (error) {
    errorHandler.log(
      "Failed to initialize Gemini client",
      "error",
      "gemini-service",
      error
    );
    return null;
  }
};

// Generate a specific hint for a problem with contextual guidance
export const getMathHint = async (problem: MathProblem): Promise<string> => {
  const client = getClient();
  
  // If no API key, use fallback hints immediately
  if (!client) {
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
    return fallbackHints[problem.type] || "Believe in yourself! Take your time! 🚀";
  }

  try {
    
    // Generate contextual hints based on problem type
    const contextualGuides: Record<ProblemType, string> = {
      'arithmetic': 'Break the problem into smaller steps. What comes first?',
      'geometry': 'Count the sides, corners, or edges. What shape do you see?',
      'fraction': 'Think of a pizza or pie. How many pieces? How many are you taking?',
      'logic': 'Look for patterns. What emoji repeats? What changes?',
      'measurement': 'Compare the numbers. Which is bigger? What unit are we using?',
      'riddle': 'Read the clues carefully. Think about what each word means.',
      'word': 'Turn the words into numbers. What operation goes with "altogether", "left", "each"?',
      'time': 'Use a clock. Where is the hour hand? The minute hand? Count up or down.',
      'sequence': 'Look at what changes between numbers. Add? Subtract? Double?'
    };
    
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

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || `Here's a tip: ${contextualGuides[problem.type]} Keep going! 🌟`;
  } catch (error) {
    console.error("Error fetching hint:", error);
    // Enhanced fallback hints with context
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
    return fallbackHints[problem.type] || "Believe in yourself! Take your time! 🚀";
  }
};

// Generate a new Problem using AI with Adaptive Learning, Strict Difficulty, and Topic Selection
export const generateAIProblem = async (
  settings: AppSettings, 
  stats: UserStats
): Promise<MathProblem> => {
  const client = getClient();
  
  // If no API key, use local generation immediately
  if (!client) {
    return generateLocalProblem(settings.difficulty);
  }

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
        // Only consider weak topics if they're in the allowed list
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

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a math problem. ${adaptiveNote}`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                questionText: { type: Type.STRING },
                answer: { type: Type.NUMBER },
                type: { type: Type.STRING, enum: ["arithmetic", "word", "sequence", "time", "geometry", "fraction", "logic", "measurement", "riddle"] },
                displayMode: { type: Type.STRING, enum: ["standard", "text"] },
                num1: { type: Type.NUMBER },
                num2: { type: Type.NUMBER },
                operator: { type: Type.STRING, enum: ["+", "-", "*", "/"] },
                difficultyLevel: { type: Type.STRING }
            },
            required: ["questionText", "answer", "type", "displayMode"]
        }
      }
    });

    let text = response.text;
    if (!text) throw new Error("No response from AI");

    // Robust JSON Extraction
    const jsonStartIndex = text.indexOf('{');
    const jsonEndIndex = text.lastIndexOf('}');
    
    if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
        text = text.substring(jsonStartIndex, jsonEndIndex + 1);
    }
    
    const data = JSON.parse(text);

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
