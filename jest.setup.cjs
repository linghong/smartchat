require('@testing-library/jest-dom')
process.env.PINECONE_API_KEY='fake-pinecone'
process.env.PINECONE_INDEX_NAME = 'test-index'
process.env.OPENAI_API_KEY = 'test'
process.env.GROQ_API_KEY = 'fake-api-key'
process.env.GEMINI_API_KEY = 'fake-gemini'
process.env.NEXT_PUBLIC_API_URL='http://localhost:3000'
process.env.NEXT_PUBLIC_SERVER_SECRET_KEY='fake'

const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder
global.TextDecoder = TextDecoder

