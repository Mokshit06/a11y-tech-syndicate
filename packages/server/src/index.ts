import cors from 'cors';
import express from 'express';
import mediaCaptions from './routes/media-captions';
import imageDescription from './routes/image-description';
import './utils/dotenv';

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('`GOOGLE_APPLICATION_CREDENTIALS` env variable not defined');
  process.exit(1);
}

const app = express();

app.use(
  cors({
    origin(origin, cb) {
      cb(null, true);
    },
  })
);

app.get('/captions', mediaCaptions);
app.get('/description', imageDescription);

const port = process.env.PORT || 5000;
const url = `http://localhost:${port}`;

app.listen(port, () => {
  console.log(`Server started on ${url}`);
});
