import { AnimatePresence, motion } from 'framer-motion';
import { render } from 'preact';
import create from 'zustand';
import './caption.css';

type CaptionState = {
  caption: string;
  updateCaption(newCaption: string): void;
  updatePlaying(newPlaying: boolean): void;
  playing: boolean;
};

export const useCaptions = create<CaptionState>(set => ({
  caption: '',
  playing: false,
  updatePlaying: newPlaying => set({ playing: newPlaying }),
  updateCaption: newCaption => set({ caption: newCaption }),
}));

export default function Caption() {
  const { playing, caption, updatePlaying } = useCaptions();

  if (!caption || !playing) return null;

  return (
    <AnimatePresence>
      {caption && playing ? (
        <motion.div
          drag
          onDoubleClick={() => {
            updatePlaying(false);
          }}
          dragConstraints={{ current: document.documentElement }}
          whileTap={{ scale: 0.98 }}
          className="a11y-audio-caption"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          key="caption"
        >
          {caption}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

let captionNode = document.querySelector('#caption-node-a11y');

if (!captionNode) {
  const node = document.createElement('div');
  node.id = 'caption-node-a11y';
  document.body.appendChild(node);
  captionNode = node;
}

render(<Caption />, captionNode);
