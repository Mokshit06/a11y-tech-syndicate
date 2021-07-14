import { Context, Rule } from '../utils/traverser';

const errorMessage =
  'Media elements such as <audio> and <video> must have a <track> for captions.';

type MediaElement = HTMLVideoElement | HTMLAudioElement;

const mediaRule = (node: MediaElement, context: Context) => {
  const muted = node.getAttribute('muted');

  if (muted === '') return;

  const trackChildren = [...node.children].filter(child => {
    return child.localName === 'track';
  }) as HTMLTrackElement[];

  if (trackChildren.length === 0) {
    context.report({
      node,
      message: errorMessage,
    });
    return;
  }

  const hasCaption = trackChildren.some(track => {
    const kind = track.kind;
    return kind.toLowerCase() === 'captions';
  });

  if (!hasCaption) {
    context.report({
      node,
      message: errorMessage,
    });
  }
};

const mediaHasCaption: Rule = {
  name: 'media-has-capition',
  visitor: {
    video: mediaRule,
    audio: mediaRule,
  },
};

export default mediaHasCaption;
