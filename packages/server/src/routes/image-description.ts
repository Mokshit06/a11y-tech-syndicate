import type { Request, Response } from 'express';
import { ImageAnnotatorClient } from '@google-cloud/vision';
import axios from 'axios';
import prisma from '../lib/prisma';

const client = new ImageAnnotatorClient();

export default async function imageDescription(req: Request, res: Response) {
  const url = req.query.url as string;

  if (!url) {
    return res.status(400).send('`url` query param is required');
  }

  const dbDescription = await prisma.description.findUnique({
    where: { url },
  });

  if (dbDescription) {
    return res.send(dbDescription.description);
  }

  try {
    const { data: imageArrBuffer } = await axios.get(url, {
      responseType: 'arraybuffer',
    });
    const imgBuffer = Buffer.from(imageArrBuffer);
    const [result] = await client.labelDetection(imgBuffer);

    if (!result.labelAnnotations?.length) {
      return res.send('');
    }

    const [description] = result.labelAnnotations;

    await prisma.description.create({
      data: {
        url,
        description: description.description!,
      },
    });

    res.send(description.description);
  } catch (error) {
    console.error(error);
    res.status(500).send(`Something went wrong\n${error}`);
  }
}
