import { Writable } from 'stream';

export default class AudioWritableStream extends Writable {
  #body: any[] = [];

  _write(
    chunk: any,
    encoding: BufferEncoding,
    callback: (error?: Error | null) => void
  ) {
    this.#body.push(chunk);
    callback();
  }

  get body() {
    const chunks = [];

    for (const chunk of this.#body) {
      if (Buffer.isBuffer(chunk)) {
        chunks.push(chunk);
      } else {
        chunks.push(Buffer.from(String(chunk)));
      }
    }

    return Buffer.concat(chunks);
  }
}
