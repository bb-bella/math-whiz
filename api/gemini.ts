import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, model = 'gemini-pro' } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt' });
    }

    // Securely access API key from environment variable
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY not configured');
      return res.status(500).json({ error: 'API key not configured' });
    }

    // Initialize Gemini client with API key
    const genAI = new GoogleGenerativeAI(apiKey);
    const generativeModel = genAI.getGenerativeModel({ model });

    // Generate content
    const result = await generativeModel.generateContent(prompt);
    const response = result.response.text();

    return res.status(200).json({ response });
  } catch (err: any) {
    console.error('Gemini API Error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
