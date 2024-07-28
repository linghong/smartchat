# SmartChat: A Personal AI Assistant

## Introduction

SmartChat is a multimodal AI assistant platform comprising two components: a local application (this repository) and a cloud-based GPU server.

### Local Application:

The local application is a full-stack application developed with Next.js and TypeScript, with plan to also run small AI models in a Python environment. It operates on a local computer, serving as the main interface for users to keep their most important information securely on their local machine.

The primary interface of the local application is a multimodal AI chat platform. This platform leverages various AI models and supports both standard chat and enhanced chat with RAG (Retrieval-Augmented Generation) capabilities. When users ask questions related to uploaded data, the chatbot fetches and references relevant sections from stored PDF data to provide accurate and precise answers.

### Cloud GPU Server:

The cloud-based GPU server is designed for running AI models or any AI tasks that require substantial GPU resources, which are not feasible to run locally. Refer to the [SmartChat-FastAPI](https://github.com/linghong/smartchat-fastapi) repository for more details.

## Features

### Chat Platform Using Various AI Models

This AI chat platform allows you to select from a variety of Generative AI models:

1. From APIs:
   1.OpenAI: GPT-4o,GPT-4o Mini, GPT4 Turbo, GPT-4, and GPT-3.5 Turbo
   2.Google: Gemini-1.5-flash and Gemini-1.5-pro
   3.Anthropic: Claude 3.5 Sonnet, Claude 3 Haiku, and Claude 3 Opus
   4.Open-source models hosted on Groq:
   Meta's Llama3.1-8b Instruct, Llama3.1-70b Instruct, Llama3-8b Instruct and Llama3-70b Instruct
   Mistral's Mixtral 8x7b
   Google's Gemma 7b and Gemma2 9b

2. From Open Sources Models Self-hosted in a GPU Server
   The platform can also relay messages to a remote backend (refer to the [SmartChat-FastAPI](https://github.com/linghong/smartchat-fastapi))repository, Once configured, this backend server can run open-source AI models.

The models generate responses to user messages, and send back to the SmartChat platform.

### Multimodal AI Models

Users can upload one or more images or take desktop screenshots, and ask questions about them, or combine them with text input, including fetched information from Retrieval-Augmented Generation (RAG). The chatbot can then provide a comprehensive response.

The following models support those capabilities:
1.GPT-4o and GPT4 Turbo
2.Gemini-1.5-Flash and Gemini-1.5-Pro
3.Claude 3.5 Sonnet, Claude 3 Haiku, and Claude-3-opus

### Local SQLite Database for Privacy

To ensure privacy and maintain control over critical information, the app uses TypeORM with SQLite to store chat messages, AI Assistant config information, and other critical content.

### Retrieval Augmented Generation (RAG) with PDFs

Users have the ability to upload documents in PDF format, with options to customize how their data is processed to be embedded to suit their preferences. Data extracted from the uploaded PDFs is chunked and embedded using an advanced embedding model before being securely stored in Pinecone, a high-performance vector database, ensuring efficient and precise retrieval of information when needed.

### AI Model Finetuning:

Users can refine AI models to meet their specific needs by uploading training data and selecting appropriate fine-tuning parameters. If fine-tuning OpenAI models, the requirements are sent to the OpenAI server. For open-source models, the requirements are sent to a self-hosted server, which can be set up using the code at [SmartChat-FastAPI](https://github.com/linghong/smartchat-fastapi). This server processes the fine-tuning requirements (which need to be developed), allowing for a more tailored user experience.

## Screenshots

Here are some screenshots that illustrate various features of the SmartChat platform:

### Chat Interface With Config Panel

<div align="center">
  <img src="images/chat-with-config.png" width="90%" alt="SmartChat Home" style="border: 2px solid black;">
</div>  
*The SmartChat home screen showing the chat interface without RAG initiated  and with the Config panel open.*

### Coding Display Example

<div align="center">
  <img src="images/chat-with-code.png" width="90%" alt="SmartChat With Code" style="border: 2px solid black;">
</div>  
* The SmartChat home screen showing the chat interface with the Config panel closed and displaying a coding block.*

### Visual Model Example

<div align="center">
  <img src="images/chat-with-image.png" width="90%" alt="SmartChat With Image">
</div>  
*The AI model GPT-4o is discussing the screenshot image with the user.*

### RAG Response Generation

<div align="center">
  <img src="images/pdf-rag.png" width="90%" alt="RAG Response Generation">
</div> 
*An example of the chatbot generating a response using embedded data.*

### PDF Upload Feature

<div align="center">
  <img src="images/rag-embedding.png" width="90%" alt="PDF Upload Feature">
</div>  
*A screenshot of the PDF upload interface, which allows users to process documents for embedding pdf file in Pinecone.*

### Finetuning Data Submissions Page

<div align="center">
  <img src="images/model-finetuning.png" width="90%" alt="Finetuning Data Submissions Page">
</div>
*This interface allows users to submit data to OpenAI for fine-tuning OpenAI models or to the SmartChat-FastAPI server for fine-tuning using open-source generative models hosted on the GPU, tailored to specific needs.*

## Getting Started

### Clone the Repository and Install Dependency:

support nodejs v18 and plus

```bash
yarn install
```

### Setup OpenAI and Pinecone

Sign up for an account on OpenAI, Google, Groq, Athropic, and Pinecone.
Generate the necessary API keys from the respective platforms.

### Create Pinecone Index

Access your Pinecone account and establish an index with the dimension set to 1536 and the metric set to cosine.

### Configure Environment Variables

Copy the .env.example file and rename it to .env.

```bash
cp .env.example .env
```

Open the newly created .env file and replace the placeholders with the actual keys you obtained from OpenAI, Google Gemini, Groq, Anthropic, and Pinecone.

### Manage Local SQLite Database

To ensure privacy and maintain control over critical information, the app uses TypeORM with SQLite to store chat content and settings.

The database configuration and initialization are handled in the `data-source.ts` file located in the `src/db` folder. All migration files are stored in the `src/db/migration` directory and can be managed using TypeORM CLI commands.
Generate a migration:

```bash
npx typeorm migration:generate -n YourMigrationName
```

Run a migration to apply it to your database:

```bash
npx typeorm migration:run
```

Revert the latest migration:

```bash
npx typeorm migration:revert

```

To run SQL query in the terminal, type:

```bash
sqlite3 database.sqlite
```

To exit the SQLite prompt, type:

```bash
sqlite> .quit
```

### Run the Development Server:

```bash
yarn dev
```

### Access the App

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Lint and CI/CD

## Deployment

You can deploy the app to any cloud environment, just as you would with other Next.js apps. For a seamless deployment experience, consider using the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme), which is recommended by the creators of Next.js.

## How to Contribute

Whether you want to report a bug, improve documentation, or contribute code, your help is greatly appreciated.

### Steps to Contribute

1. Fork and clone the Repository, install dependencies, ensure you have NodeJS(v18, v19, v20) installed, create a new branch for your feature or bugfix.

```
git clone https://github.com/linghong/smartchat.git
cd smartchat
yarn install
git checkout -b feature-or-bugfix-name
```

2. Implement your changes and write test code.

3. Run lint, prettier and tests: Ensure all tests pass and your code follows the project’s linting and formatting rules:

```bash
yarn lint
yarn prettier:check
yarn prettier:fix
yarn test
```

4. Commit your changes with a clear message and push to your fork. Open a pull request to the main repository, detailing your changes and any related issues.

## Issues and Feature Requests

If you encounter any problems or have suggestions for improvements, please open an issue. Provide as much detail as possible to help us understand and address the issue quickly.

We are always looking to improve SmartChat. If you have an idea for a new feature and want to contribute it, please open a feature request and describe your idea in detail.
