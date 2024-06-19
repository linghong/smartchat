# SmartChat: A Next.js Chatbot Platform

SmartChat is a cutting-edge chatbot platform and full-stack application developed with Next.js[Next.js](https://nextjs.org/) and TypeScript. It offers users the ability to upload PDF documents, which are then segmented and stored within the Pinecone vector database. When users pose questions related to the uploaded data, the chatbot fetches and references the relevant sections from the stored PDF data to provide precise answers.

## Features

### Chatbot Using Various AI Models

This AI chat platform allows you to select from a variety of Generative AI models, including:
1.OpenAI's GPT-4o, GPT4 Turbo, GPT-4, and GPT-3.5
2.Googles' Gemini-1.5-flash and Gemini-1.5-pro
3.Open-source models hosted on Groq:
Meta's LLaMA3-8b and LLaMa3-70b
Mistral's Mixtral 8x7b
Google's Gemma 7b

The platform can also relay messages to a remote backend (refer to the [SmartChat-FastAPI](https://github.com/linghong/smartchat-fastapi))repository, Once configured, this backend server can run open-source AI models.

These models generate responses to user messages, and send back to the SmatChat platform.

### Multimodal Response

Users can upload one or more images and ask questions about them, or combine them with text input, including fetched information from Retrieval-Augmented Generation (RAG). The chatbot can then provide a comprehensive response.

The following models support those capabilities: GPT-4o and GPT4 Turbo, Gemini-1.5-Flash and Gemini-1.5-Pro.

### PDF Upload:

Users have the ability to upload documents in PDF format, with options to customize how their data is processed to suit their preferences.

### Vector Database Storage:

Data extracted from the uploaded PDFs undergoes a series of transformations. It is chunked and embedded using an advanced embedding model before being securely stored in Pinecone, a high-performance vector database, ensuring efficient and precise retrieval of information when needed.

### Intelligent Responses:

Empowered by the Retrieval-Augmented Generation (RAG), the chatbot can intelligently reference specific parts of the uploaded data to deliver contextually aware responses to user inquiries.

### AI Model Finetuning:

Users can refine AI models to meet their specific needs by uploading training data and selecting appropriate fine-tuning parameters. The fine-tuning requirements are sent to the server, which can be set up using the code at [SmartChat-FastAPI](https://github.com/linghong/smartchat-fastapi). This server processes the fine-tuning requirements, allowing for a more tailored user experience.

## Screenshots

Here are some screenshots that illustrate various features of the SmartChat platform:

### SmartChat Home Interface

<div align="center" padding: 10px;">
  <img src="images/chat-no-rag.png" width="90%" alt="SmartChat Home">
</div>  
*The SmartChat home screen showing the chat interface without RAG initiated.*

### RAG Response Generation

<div align="center" padding: 10px;">
  <img src="images/chat-with-rag.png" width="90%" alt="RAG Response Generation">
</div> 
*Example of the chatbot generating a response using embedded data.*

### PDF Upload Feature

<div align="center" padding: 10px;">
  <img src="images/pdf-upload.png" width="90%" alt="PDF Upload Feature">
</div>  
*Screenshot of the PDF upload interface, which allows users to process documents for chatbot interaction.*

### Finetuning Data Submissions Page

<div align="center" padding: 10px;">
  <img src="images/finetuning.png" width="90%" alt="Finetuning Data Submissions Page">
</div>
*This interface allows users to submit data to OpenAI for fine-tuning OpenAI models or to the SmartChat-FastAPI server for fine-tuning using open-source generative models hosted on the GPU, tailored to specific needs.*
 
## Getting Started

### Clone the Repository and Install Dependency:

```bash
nvm use v20.14.0
yarn install
```

### Setup OpenAI and Pinecone

Sign up for an account on OpenAI and Pinecone.
Generate the necessary API keys from the respective platforms.

### Create Pinecone Index

Access your Pinecone account and establish an index with the dimension set to 1536 and the metric set to cosine.

### Configure Environment Variables

Copy the .env.example file and rename it to .env.

```bash
cp .env.example .env
```

Open the newly created .env file and replace the placeholders with the actual keys you obtained from OpenAI, Google Gemini, Groq, and Pinecone.

### Run the Development Server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

### Access the App

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

You can deploy the app to any cloud environment, just as you would with other Next.js apps. For a seamless deployment experience, consider using the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme), which is recommended by the creators of Next.js.
