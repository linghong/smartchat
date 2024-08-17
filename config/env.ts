const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
if (!OPENAI_API_KEY) throw new Error('Missing OpenAI API key');

// for connecting to Google's Gemini Generative AI models
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) console.error('Missing Google Gemini API key');

// for connecting to Anthropic's Claude Generative AI models
const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
if (!CLAUDE_API_KEY) console.error('Missing CLAUDE API key');

// For connecting to remote FastAPI server
const NEXT_PUBLIC_SERVER_SECRET_KEY = process.env.NEXT_PUBLIC_SERVER_SECRET_KEY;
if (!NEXT_PUBLIC_SERVER_SECRET_KEY)
  console.error('Sever secret key is missing');

// url address for this app's Next.js backend
const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;
if (!NEXT_PUBLIC_API_URL) throw new Error('Missing API url');

// for connecting to Groq server
const GROQ_API_KEY = process.env.GROQ_API_KEY;
if (!GROQ_API_KEY) console.error('Missing GROQ API key');

// for connecting to Pinecone vector database
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
if (!PINECONE_API_KEY) throw new Error('Missing Pinecone API key');

const PINECONE_INDEX_NAME = process.env.PINECONE_INDEX_NAME;
if (!PINECONE_INDEX_NAME) console.error('Missing Pinecone index name');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('Missing required JWT_SECRET');

const DEFAULT_USERNAME = process.env.DEFAULT_USERNAME;
const DEFAULT_PASSWORD = process.env.DEFAULT_PASSWORD;
if (!DEFAULT_USERNAME || !DEFAULT_PASSWORD) {
  throw new Error('Missing required default username and password');
}

export {
  GEMINI_API_KEY,
  CLAUDE_API_KEY,
  GROQ_API_KEY,
  NEXT_PUBLIC_API_URL,
  OPENAI_API_KEY,
  PINECONE_API_KEY,
  PINECONE_INDEX_NAME,
  NEXT_PUBLIC_SERVER_SECRET_KEY,
  JWT_SECRET,
  DEFAULT_USERNAME,
  DEFAULT_PASSWORD
};
