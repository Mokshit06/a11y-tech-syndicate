# a11y

## Setup

1. Install the dependencies.

```bash
yarn install
```

2. Copy `.env.example` files to `.env`.

```bash
cp packages/extension/.env.local packages/extension/.env
cp packages/server/.env.local packages/server/.env
```

3. Create google service account and add Speech-to-Text and Vision API to the libaries.

4. Add the path of the `json` file downloaded in `packages/server/.env`

```bash
GOOGLE_APPLICATION_CREDENTIALS="path/to/json"
```

5. Create database and run migrations.

```bash
yarn prisma migrate dev
```

6. Open `chrome://extensions` in your browser and turn on `Developer Mode`.

7. Click on the `Load unpacked` button, navigate to the `packages/extension` directory and open it.

8. Start extension and server in dev mode. This will start esbuild and nodemon in watch mode.

```bash
yarn dev
```

### Info

The server trims the audios and videos to max 10s and has a limit of generating alt text for 30 images.
These can be disabled but are there so as to avoid accidental processing of large files and additional billing.
