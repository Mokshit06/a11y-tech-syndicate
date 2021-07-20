/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */

import { useState } from 'react';
import styles from '../styles/Home.module.css';

export default function Home() {
  const [text, setText] = useState('');
  return (
    <div>
      {/* Some spanish text */}
      <h1>hola mundo este es un texto</h1>
      <form>
        {/* Input without label */}
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          type="text"
        />
      </form>
      <ul>
        {/* List with paragraph child instead of list item */}
        <p
          aria-label="Some label"
          style={{ color: 'red', background: 'green' }}
        >
          Hello
        </p>
      </ul>
      {/* Empty heading tag */}
      <h1>{text}</h1>
      {/* Image without alt text */}
      <img
        src="https://img.webmd.com/dtmcms/live/webmd/consumer_assets/site_images/article_thumbnails/other/cat_relaxing_on_patio_other/1800x1200_cat_relaxing_on_patio_other.jpg"
        height="500"
      />
      {/* Video without track */}
      <video
        src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4"
        controls
      />
      {/* Audio without track */}
      <audio
        src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/friday.mp4"
        controls
      />
    </div>
  );
}
