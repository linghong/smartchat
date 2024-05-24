require('@testing-library/jest-dom')

process.env.PINECONE_INDEX_NAME = 'test-index'
process.env.OPENAI_API_KEY = 'test'
process.env.GROQ_API_KEY = 'fake-api-key'

const { TextEncoder, TextDecoder } = require('util');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

