import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
          initial={{ opacity: 0, y: 50, scale: 0.7 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          key="caption"
        >
          {caption}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
