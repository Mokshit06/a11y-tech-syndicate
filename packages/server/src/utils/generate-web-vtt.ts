import type { protos } from '@google-cloud/speech';

export default function generateWebVTT(
  response: protos.google.cloud.speech.v1.IRecognizeResponse
) {
  const result = response.results?.[0].alternatives?.[0]!;
  let text = `WEBVTT\n\n`;
  let currentStringArr: string[] = [];
  let currentTime: string;

  result.words?.forEach((wordInfo, index) => {
    const startMs = Number(wordInfo.startTime?.nanos) / 1e6;
    const endMs = Number(wordInfo.endTime?.nanos) / 1e6;
    const startSeconds = `${String(wordInfo.startTime?.seconds).padStart(
      2,
      '0'
    )}.${String(startMs).padEnd(3, '0')}`;
    const endSeconds = `${String(wordInfo.endTime?.seconds).padStart(
      2,
      '0'
    )}.${String(endMs).padEnd(3, '0')}`;

    if (typeof currentTime === 'undefined') {
      currentTime = startSeconds;
    }

    if (
      Number(startSeconds) <= Number(currentTime) + 3 &&
      result.words!.length - 1 !== index
    ) {
      currentStringArr.push(wordInfo.word!);
    } else {
      text += `00:${currentTime} --> 00:${endSeconds}\n- ${currentStringArr.join(
        ' '
      )}\n\n`;
      currentStringArr = [wordInfo.word!];
      currentTime = startSeconds;
    }
  });

  return text;
}
