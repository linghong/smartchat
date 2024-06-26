require('@testing-library/jest-dom');
process.env.PINECONE_API_KEY = 'fake-pinecone-api-key';
process.env.PINECONE_INDEX_NAME = 'fake-pinecone-index';
process.env.OPENAI_API_KEY = 'fake-openai-api-key';
process.env.GROQ_API_KEY = 'fake-groq-api-key';
process.env.GEMINI_API_KEY = 'fake-gemini-api-key';
process.env.CLAUDE_API_KEY = 'fake-claude-api-key';
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';
process.env.NEXT_PUBLIC_SERVER_SECRET_KEY = 'fake-server-secret';

const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
