import './utils/dotenv';
import { SpeechClient } from '@google-cloud/speech';
import type { protos } from '@google-cloud/speech';
import express from 'express';
import axios from 'axios';
import { Readable } from 'stream';
import AudioWritableStream from './utils/audio-writable-stream';
import convertToAudio from './utils/convert-to-audio';
import generateWebVTT from './utils/generate-web-vtt';
import cors from 'cors';
import prisma from './utils/prisma';

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('`GOOGLE_APPLICATION_CREDENTIALS` env variable not defined');
  process.exit(1);
}

const app = express();

app.use(
  cors({
    origin(origin, cb) {
      cb(null, true);
    },
  })
);

const client = new SpeechClient();

app.get('/captions', async (req, res) => {
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

  try {
    console.time('video-fetch');
    const { data: videoStream } = await axios.get<Readable>(url, {
      responseType: 'stream',
    });
    console.timeEnd('video-fetch');
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
        content: Buffer.from(audioBuffer).toString('base64'),
      },
    };

    console.time('generate-captions');
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
  }
});

const port = process.env.PORT || 5000;
const url = `http://localhost:${port}`;

app.listen(port, () => {
  console.log(`Server started on ${url}`);
});
