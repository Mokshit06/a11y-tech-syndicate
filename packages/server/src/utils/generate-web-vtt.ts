import type { protos } from '@google-cloud/speech';

function format(seconds: string) {
  const secondsNum = Number(seconds);
  const hours = Math.floor(secondsNum / 3600)
    .toString()
    .padStart(2, '0');
  const minutes = Math.floor(secondsNum / 60)
    .toString()
    .padStart(2, '0');
  const sec = Math.floor(secondsNum % 60)
    .toString()
    .padStart(2, '0');
  const ms = seconds.substr(-1);

  return `${hours}:${minutes}:${sec}.${ms}00`;
}

export default function generateWebVTT(
  response: protos.google.cloud.speech.v1.IRecognizeResponse
) {
  const result = response.results?.[0].alternatives?.[0]!;
  let text = `WEBVTT\n\n`;
  let currentStringArr: string[] = [];
  let currentTime: string;
  let currentEnd: string;

  if (!result.words) return text;

  for (const wordInfo of result.words) {
    const startMs = wordInfo.startTime?.nanos! / 100_000_000;
    const endMs = wordInfo.endTime?.nanos! / 100_000_000;
    const startSeconds = `${wordInfo.startTime?.seconds}.${startMs}`;
    const endSeconds = `${wordInfo.endTime?.seconds}.${endMs}`;

    if (typeof currentTime! === 'undefined') {
      currentTime = startSeconds;
    }

    if (Number(startSeconds) <= Number(currentTime) + 3) {
      currentStringArr.push(wordInfo.word!);
    } else {
      text += `${format(currentTime)} --> ${format(
        currentEnd!
      )}\n- ${currentStringArr.join(' ')}\n\n`;

      currentStringArr = [wordInfo.word!];
      currentTime = startSeconds;
    }

    currentEnd = endSeconds;
  }

  text += `${format(currentTime!)} --> ${format(
    currentEnd!
  )}\n- ${currentStringArr.join(' ')}\n\n`;

  return text;
}
