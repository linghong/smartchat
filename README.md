# SmartChat: A Next.js Chatbot Platform

SmartChat is a state-of-the-art chatbot platform developed using [Next.js](https://nextjs.org/) and TypeScript.  It offers users the ability to upload PDF documents, which are then segmented and stored within the Pinecone vector database. When users pose questions to the chatbot, if their inquiries relate to the uploaded data, the chatbot fetches and references relevant sections from the stored PDF data to provide precise answers.

## Features:
### PDF Upload: 
Users can upload their documents in PDF format.
### Vector Database Storage: 
Processed data from the PDF is stored in Pinecone's vector database for quick retrievals.
### Intelligent Responses: 
The chatbot is capable of referencing specific parts of the uploaded data to answer user questions.
## Getting Started

### Clone the Repository and Install Dependency:
```bash
yarn install
```

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


