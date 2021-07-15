import { Context, Rule } from '../utils/traverser';

const errorMessage =
  'Media elements such as <audio> and <video> must have a <track> for captions.';
const successMessage = 'Captions generated for media elements!';

type MediaElement = HTMLVideoElement | HTMLAudioElement;

function appendTrackElement(node: MediaElement) {
  if (!node.src || node.src.startsWith('blob:')) return;

  node.crossOrigin = '';

  const track = document.createElement('track');
  track.default = true;
  track.src = `${
    import.meta.env.VITE_API_ENDPOINT
  }/captions?url=${encodeURIComponent(node.src)}`;
  track.kind = 'captions';
  track.srclang = 'en';

  const text = document.createTextNode(
    "Sorry, your browser doesn't support embedded videos"
  );

  node.appendChild(track);
  node.appendChild(text);
}

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

    appendTrackElement(node);

    context.success({
      node,
      message: successMessage,
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

    appendTrackElement(node);

    context.success({
      node,
      message: successMessage,
    });

    return;
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
