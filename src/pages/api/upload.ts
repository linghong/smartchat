import type { NextApiRequest, NextApiResponse } from 'next'
import * as formidable from 'formidable'
import fs from 'fs'

import { OptionType } from '@/src/types/common'
import  ingestDataToPinecone from '@/src/services/ingestDataToPinecone'

export const config = {
  api: {
    bodyParser: false, // Disabling Next.js's body parser as we 're using formidable's
  }
}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST' ){
    return res.status(405).json({ message: 'Method not allowed'})
  }
  
  try {
    const { fields, files } = await new Promise<{ fields: any, files: any }> ((resolve, reject) => {
      const form = new formidable.IncomingForm()
      
      form.parse(req, (err: Error | null, fields: { [key: string]: any }, files: { [key: string]: formidable.File[] | undefined }) => {
        if(err) return reject(err)
        resolve({fields, files})
      })
    })

    const uploadedFileArray = files['file']  
    const uploadedFile = uploadedFileArray && uploadedFileArray[0] || undefined

    if(!uploadedFile) {
      return res.status(500).json({
        error: 'Something wrong with the uploaded file.'
      })
    }

    const chunkSize: number = parseInt(fields.chunkSize, 10)
    const chunkOverlap: number = parseInt(fields.chunkOverlap, 10)
    const fileCategory: OptionType = JSON.parse(fields.fileCategory).value.toLowerCase()
    const embeddingModel: OptionType = JSON.parse(fields.embeddingModel).value.toLowerCase()
   
    const indexName = process.env.PINECONE_INDEX_NAME
    const namespace = fileCategory + '-' + embeddingModel
    if(!indexName) return res.status(500).json({
     error: "Missing Pinecone index name."
    })
    if(!namespace) return res.status(500).json({
      error: "Missing Pinecone name space."
    })
    
    await ingestDataToPinecone(uploadedFile.filepath, namespace, indexName, chunkSize, chunkOverlap)
    
    console.log( 'remove file link ...')
    // delete the file after using it
    await fs.promises.unlink(uploadedFile.filepath);

    res.status(200).json({message: 'File uploaded successfully.', fileName: uploadedFile.originalFilename})

  } catch (e) {
    console.error("Error processing form:", e);
    return res.status(500).json({
      error: 'Failed to Upload File.',
    });
  }
}