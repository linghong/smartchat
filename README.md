# SmartChat: A Next.js Chatbot Platform

SmartChat is a state-of-the-art chatbot platform developed using [Next.js](https://nextjs.org/) and TypeScript.  It offers users the ability to upload PDF documents, which are then segmented and stored within the Pinecone vector database. When users pose questions to the chatbot, if their inquiries relate to the uploaded data, the chatbot fetches and references relevant sections from the stored PDF data to provide precise answers.

## Features
### Chatbot Using Various AI Models
This AI chat platform can allow you to select from various OpenAI LLM models, and then forward user messages to OpenAI to generate responses.

The platform can also relay messages to a remote backend (refer to the SmartChat-fastAPI repository), which, once configured, can run open-source AI models.

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
Open the newly created .env file and replace the placeholders with the actual keys you obtained from OpenAI and Pinecone.

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


