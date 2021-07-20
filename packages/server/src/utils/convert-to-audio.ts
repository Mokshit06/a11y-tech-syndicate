import { Readable, Writable } from 'stream';
import ffmpeg from 'fluent-ffmpeg';

export default async function convertToAudio(
  readbleStream: Readable,
  writableStream: Writable
) {
  return new Promise((resolve, reject) => {
    ffmpeg(readbleStream)
      // set max time to 10s
      // gcp max limit it 60min
      .setDuration(10)
      .audioChannels(1)
      .format('flac')
      .on('end', () => {
        resolve(null);
      })
      .on('error', err => {
        reject(err);
      })
      .pipe(writableStream);
  });
}
