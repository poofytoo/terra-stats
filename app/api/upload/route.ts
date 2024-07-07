// pages/api/upload.ts
import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import simpleGit, { SimpleGit } from 'simple-git';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const fileUrl = request.nextUrl.searchParams.get('fileUrl') ?? "";

  const response = await fetch(fileUrl);
  if (!response.ok) throw new Error(`Failed to fetch ${fileUrl}: ${response.statusText}`);
  const buffer = await response.buffer();

  // Step 3: Save the file to your project
  const fullPath: string = path.join(process.cwd(), "./data/data.html");
  fs.writeFileSync(fullPath, buffer);

  return new Response(JSON.stringify({ message: 'Hello from the API' }));
}

// export default async function GET(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'GET') {
//     return res.status(405).send({ message: 'Only GET requests allowed' });
//   }

//   const { fileUrl, filePath } = req.query;

//   // Validate input
//   if (typeof fileUrl !== 'string' || typeof filePath !== 'string') {
//     return res.status(400).json({ error: 'Invalid fileUrl or filePath query parameter' });
//   }

//   try {
//     // Step 2: Download the file
//     const response = await fetch(fileUrl);
//     if (!response.ok) throw new Error(`Failed to fetch ${fileUrl}: ${response.statusText}`);
//     const buffer = await response.buffer();

//     // Step 3: Save the file to your project
//     const fullPath: string = path.join(process.cwd(), filePath);
//     fs.writeFileSync(fullPath, buffer);

//     // Step 4: Use Git commands to commit and push
//     const git: SimpleGit = simpleGit();
//     await git.add(fullPath);
//     await git.commit('Add new file via Vercel function');
//     await git.push('origin', 'main'); // Replace 'main' with your branch name if different

//     res.status(200).json({ message: 'File uploaded and pushed to repo successfully' });
//   } catch (error) {
//     console.error('Error uploading file:', error);
//     res.status(500).json({ error: 'Error uploading file' });
//   }
// }
