// Resume context for AI assistant
const RESUME_CONTEXT = `PERSONAL INFORMATION & CONTACT:
Name: Anshuman Goel
Role: Computer Science Student
Education: Pre Final Year Student, CSE, Thapar Institute (CGPA: 7.3)
Email: anshg112005@gmail.com
LinkedIn: linkedin.com/in/anshumangoel
GitHub: github.com/anshgoel01
Portfolio: anshumangoel.vercel.app
PROFESSIONAL SUMMARY:
Computer Science student with experience in high-performance software engineering and applied AI. Focused on building scalable, secure, and intelligent systems.
WORK EXPERIENCE:
1. Software Engineering Intern — SafeSpace (May 2025 – July 2025)
   - Developed multimodal stress detection system (94.1% accuracy)
   - Designed Agreement-Aware Fusion (AAF) algorithm
   - Integrated LLM (Phi-2) and Whisper for mental health recommendations
TECHNICAL SKILLS:
Programming Languages:
- C++, Python, JavaScript/TypeScript, SQL
Frameworks & Technologies:
- React, Node.js, Express, Supabase, PostgreSQL, MongoDB
- TensorFlow, PyTorch, Scikit-learn, CNN, DNN, LLM
- Git, Docker, Vite, Vercel, AWS (Basic)
PROJECT PORTFOLIO:
1. Project Verifier
   - Real-time WebSocket leaderboard
   - Automated validation of 6,000+ submissions
   - Live: https://projectverifier.vercel.app/
2. Distributed Cache CPP
   - 682,000+ ops/sec with consistent hashing
   - Repo: https://github.com/Pratiikksha/distributed-cache-cpp
3. Safe Space
   - Multimodal stress detection
   - Repo: https://github.com/anshgoel01/safe-space
ACHIEVEMENTS & LEADERSHIP:
- Innovation Award – Cyber AI Hackathon 2025
- Head of Logistics, Mudra Cultural Society
- Head of Logistics, MUN Society
ADDITIONAL INFORMATION:
Languages: English, Hindi, Punjabi
`;

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

// Fallback responses for common queries when AI fails
const fallbackResponses: Record<string, string> = {
  "work style": "I thrive in collaborative environments, following agile methodologies with a strong emphasis on clean code, documentation, and code reviews. I'm detail-oriented and focused on building scalable systems.",
  "experience": "As a Software Engineering Intern at SafeSpace, I developed a multimodal stress detection system with 94.1% accuracy and designed a novel Agreement-Aware Fusion algorithm.",
  "skills": "I'm proficient in C++, Python, JavaScript/TypeScript, and SQL. My expertise includes React, Node.js, Express, Supabase, TensorFlow, and PyTorch, with experience in distributed systems and AI.",
  "education": "I'm a Pre Final Year Student at Thapar Institute, maintaining a 7.3 CGPA and actively participating in technical societies.",
  "projects": "My portfolio features Project Verifier, a student verification portal for 6,000+ users, Distributed Cache CPP achieving 682,000+ ops/sec, and Safe Space AI.",
  "contact": "You can reach me at anshg112005@gmail.com, connect on LinkedIn (linkedin.com/in/anshumangoel), or check out my work on GitHub (github.com/anshgoel01).",
  "achievements": "I won the Innovation Award at the Cyber AI Hackathon 2025 and hold leadership roles as Head of Logistics in Mudra and MUN societies at Thapar Institute.",
  "leadership": "As Head of Logistics for Mudra and MUN societies, I've managed events for 1000+ attendees and optimized resource allocation, reducing costs by 20%.",
  "availability": "I'm open to SDE and AI/ML internship or full-time opportunities where I can apply my skills in software engineering and AI.",
  "text": "You can reach me through my website (anshumangoel.vercel.app), LinkedIn (linkedin.com/in/anshumangoel), or email (anshg112005@gmail.com).",
  "contact information": "Feel free to reach out via email at anshg112005@gmail.com or connect with me on LinkedIn at linkedin.com/in/anshumangoel.",
};

function getFallbackResponse(query: string): string | null {
  const normalizedQuery = query.toLowerCase().trim();
  
  // Check for exact matches first
  if (fallbackResponses[normalizedQuery]) {
    return fallbackResponses[normalizedQuery];
  }
  
  // Check for partial matches
  for (const [key, value] of Object.entries(fallbackResponses)) {
    if (normalizedQuery.includes(key) || key.includes(normalizedQuery)) {
      return value;
    }
  }
  
  return null;
}

export async function queryAI(query: string): Promise<string> {
  try {
    // Support multiple Gemini keys. The environment can provide:
    // - VITE_GEMINI_API_KEYS (comma-separated list)
    // - VITE_GEMINI_API_KEY1 ... VITE_GEMINI_API_KEY5
    // - fallback VITE_GEMINI_API_KEY (single key)
    const env = (import.meta as any).env || {};

    function getGeminiKeys(): string[] {
      const keys: string[] = [];
      if (env.VITE_GEMINI_API_KEYS) {
        keys.push(...String(env.VITE_GEMINI_API_KEYS).split(',').map((k: string) => k.trim()).filter(Boolean));
      }
      for (let i = 1; i <= 5; i++) {
        const k = env[`VITE_GEMINI_API_KEY${i}`];
        if (k) keys.push(String(k));
      }
      if (env.VITE_GEMINI_API_KEY) {
        keys.push(String(env.VITE_GEMINI_API_KEY));
      }
      // de-duplicate while preserving order
      return Array.from(new Set(keys));
    }

    // Persistent rotation index: pick a random initial key per user, then rotate
    function consumeStartIndex(n: number): number {
      if (n <= 0) return 0;
      try {
        const stored = localStorage.getItem('gemini_key_index');

        // If we have a stored next-index, use it. Otherwise, pick a random start
        if (stored) {
          let idx = parseInt(stored, 10);
          const start = idx % n;
          idx = (idx + 1) % n;
          localStorage.setItem('gemini_key_index', String(idx));
          return start;
        } else {
          const randomStart = Math.floor(Math.random() * n);
          const next = (randomStart + 1) % n;
          localStorage.setItem('gemini_key_index', String(next));
          return randomStart;
        }
      } catch (e) {
        // Non-browser or localStorage error: use a global fallback with random init
        const g = globalThis as any;
        if (typeof g.__GEMINI_ROTATION_INDEX !== 'number') {
          const randomStart = Math.floor(Math.random() * n);
          g.__GEMINI_ROTATION_INDEX = (randomStart + 1) % n;
          return randomStart;
        }
        const start = g.__GEMINI_ROTATION_INDEX % n;
        g.__GEMINI_ROTATION_INDEX = (g.__GEMINI_ROTATION_INDEX + 1) % n;
        return start;
      }
    }

    const keys = getGeminiKeys();
    if (!keys || keys.length === 0) {
      console.error("Gemini API key(s) not configured");
      return "AI feature not configured. Please check the environment variables.";
    }

    // Enhanced prompt with better context and instructions
    const prompt = `You are an AI assistant for Anshuman Goel's portfolio website. You have access to Anshuman's complete professional profile and should provide helpful, accurate responses to visitors' questions. Consider the following detailed information:
${RESUME_CONTEXT}

Question: ${query}
Instructions for providing responses:
1. Voice and Tone:
   - Answer in Anshuman's voice (first person)
   - Be confident but humble
2. Content Guidelines:
   - Provide specific, data-backed information when available
   - Highlight achievements and metrics that support your answer
3. Response Structure:
  - Prefer concise answers, but always finish sentences and include proper punctuation. Do not truncate important details. And DON'T Exceed 2 lines in response.
  - Keep the response as condensed as possible while ensuring clarity and completeness.
  - Start with the most relevant information
5. Always:
   - Stay within the scope of the provided information
   - Maintain consistency with the portfolio website
Remember: You are representing a professional developer's portfolio. Your responses should reflect technical expertise while remaining accessible to all visitors.`;

    // Try each configured key in round-robin order. We consume a start index so
    // each call prefers a different primary key and will retry with others.
    const start = consumeStartIndex(keys.length);
    let lastErrorText: string | null = null;
    let data: GeminiResponse | null = null;
    let ok = false;

    for (let attempt = 0; attempt < keys.length; attempt++) {
      const key = keys[(start + attempt) % keys.length];
      try {
        const resp = await fetch(
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + key,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: prompt,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.3,
                topP: 0.6,
                topK: 30,
              },
            }),
          }
        );

        if (!resp.ok) {
          const txt = await resp.text();
          lastErrorText = `status=${resp.status} body=${txt}`;
          // try the next key
          continue;
        }

        data = await resp.json();
        ok = true;
        break;
      } catch (err: any) {
        lastErrorText = String(err?.message || err);
        // try next key
        continue;
      }
    }

    if (!ok || !data) {
      console.error("All Gemini keys failed", lastErrorText);
      const fallback = getFallbackResponse(query);
      if (fallback) return fallback;
      return `I apologize, but I'm having trouble processing your query at the moment. Please try again or rephrase your question.`;
    }

    

    let text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    // Validate and clean up the response
    if (!text || text.length < 10) {
      console.warn("Empty or very short response from API");
      const fallback = getFallbackResponse(query);
      if (fallback) {
        return fallback;
      }
      return "I'm sorry, but I couldn't generate a meaningful response. Please try rephrasing your question.";
    }

    return text;
  } catch (error) {
    console.error("Error in queryAI:", error);
    
    // Try to get a fallback response
    const fallback = getFallbackResponse(query);
    if (fallback) {
      return fallback;
    }
    
    return "I apologize, but I'm having trouble processing your request. Please try again in a moment.";
  }
}

export function isHardcodedQuery(query: string): boolean {
  const hardcodedKeywords = [
    // Navigation
    "projects",
    "contact",
    "resume",
    "theme",
    "cv",
    "github",
    "linkedin"
  ];

  const lowerQuery = query.toLowerCase().trim();
  
  // Check if query starts with or matches any hardcoded keyword (prefix matching)
  return hardcodedKeywords.some((keyword) =>
    keyword.startsWith(lowerQuery) || lowerQuery.startsWith(keyword)
  );
}
