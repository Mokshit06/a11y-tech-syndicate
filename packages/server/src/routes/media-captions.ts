import type { protos } from '@google-cloud/speech';
import { SpeechClient } from '@google-cloud/speech';
import axios from 'axios';
import type { Request, Response } from 'express';
import type { Readable } from 'stream';
import prisma from '../lib/prisma';
import AudioWritableStream from '../utils/audio-writable-stream';
import convertToAudio from '../utils/convert-to-audio';
import generateWebVTT from '../utils/generate-web-vtt';
import credentials from '../utils/google-credentials';

const client = new SpeechClient({
  credentials,
});

const inflightRequests = new Map<string, Promise<any>>();

export default async function mediaCaptions(req: Request, res: Response) {
  const url = req.query.url as string;

  if (!url) {
    return res.status(400).send('`url` query param is required');
  }

  const dbCaption = await prisma.captions.findUnique({
    where: { url },
  });

  if (dbCaption) {
    return res.send(dbCaption.caption);
  }

  if (inflightRequests.has(url)) {
    console.log('CONCURRENT REQUEST');
    await inflightRequests.get(url);
  }

  let dedupeResolver: (val?: Promise<any>) => void;
  inflightRequests.set(url, new Promise(resolve => (dedupeResolver = resolve)));

  try {
    console.time('video-fetch');
    const { data: videoStream } = await axios.get<Readable>(url, {
      responseType: 'stream',
    });
    console.timeEnd('video-fetch');

    // TODO convert to duplex stream
    const audioStream = new AudioWritableStream();

    console.time('convert-to-audio');
    await convertToAudio(videoStream, audioStream);
    console.timeEnd('convert-to-audio');

    console.time('audio-buffer');
    const audioBuffer = audioStream.body;
    console.timeEnd('audio-buffer');

    const request: protos.google.cloud.speech.v1.IRecognizeRequest = {
      config: {
        encoding: 'FLAC',
        languageCode: 'en-US',
        enableWordTimeOffsets: true,
        model: 'video',
      },
      audio: {
        content: audioBuffer.toString('base64'),
      },
    };

    console.time('generate-captions');

    // TODO change to `recognizeStream` api
    // and take duplex stream as arg
    const [response] = await client.recognize(request);
    const captions = generateWebVTT(response);
    console.timeEnd('generate-captions');

    await prisma.captions.create({
      data: {
        url,
        caption: captions,
      },
    });

    res.send(captions);
  } catch (error) {
    console.error(error);
    res.status(500).send(`Something went wrong\n${error}`);
  } finally {
    dedupeResolver!();
    inflightRequests.delete(url);
  }
}
