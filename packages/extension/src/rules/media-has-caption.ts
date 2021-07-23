import { useCaptions } from '../devpanel/components/caption';
import isReact from '../utils/is-react';
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
  track.src = `${process.env.API_ENDPOINT}/captions?url=${encodeURIComponent(
    node.src
  )}`;
  track.kind = 'captions';
  track.srclang = 'en';

  const text = document.createTextNode(
    "Sorry, your browser doesn't support embedded videos"
  );

  if (node.localName === 'audio') {
    track.addEventListener('cuechange', e => {
      const { track } = e.target as any as { track: TextTrack };

      let captionArr: string[] = [];

      [...track.activeCues!].forEach(x => {
        if (x instanceof VTTCue) {
          captionArr.push(x.text.replace(/^- /, ''));
        }
      });

      if (!captionArr.length) return;

      const caption = captionArr.join(' ');

      useCaptions.getState().updateCaption(caption);
    });

    node.addEventListener('play', () => {
      useCaptions.getState().updatePlaying(true);
    });
  }

  node.appendChild(track);
  node.appendChild(text);
}

function mediaRule(node: MediaElement, context: Context) {
  const muted = node.getAttribute('muted');

  if (muted === '') return;

  const trackChildren = [...node.children].filter(child => {
    return child.localName === 'track';
  }) as HTMLTrackElement[];

  if (trackChildren.length === 0) {
    context.warn({
      node,
      message: errorMessage,
    });

    appendTrackElement(node);

    context.fix({
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
    context.warn({
      node,
      message: errorMessage,
    });

    appendTrackElement(node);

    context.fix({
      node,
      message: successMessage,
    });

    return;
  }

  context.pass({
    message: '',
    node,
  });
}

const noop = () => {};

function mediaObserverRule(node: MediaElement, context: Context) {
  mediaRule(node, context);

  const mutationObserver = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        // don't report issues to panel
        // this would usually be called only
        // when react reconciles dom and removes
        // the track element
        mediaRule(node, {
          error: noop,
          fix: noop,
          pass: noop,
          warn: noop,
        });
      }
    }
  });

  mutationObserver.observe(node, {
    childList: true,
    subtree: true,
    attributes: true,
  });
}

const mediaHasCaption: Rule = {
  name: 'media-has-capition',
  visitor: {
    video: mediaObserverRule,
    audio: mediaObserverRule,
  },
};

export default mediaHasCaption;
