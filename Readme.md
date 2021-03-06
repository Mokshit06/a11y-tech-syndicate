# a11y

## Requirements

- ffmpeg
- node
- yarn
- chrome

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

4. Add the path of the `private_key`, `client_email` and `client_id` from the json file downloaded in `packages/server/.env`

```bash
GOOGLE_PRIVATE_KEY="..."
GOOGLE_CLIENT_EMAIL="..."
GOOGLE_CLIENT_ID="..."
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

9. Open any website and click `ctrl` + `shift` + `i`. There should be a new panel called `a11y`. Click `Start` to run the
   the accessibility suite and show the stats.

10. To see the accessibility stats of a specific element, open the `Elements` tab, click on the element and from the sidebar panes, select `a11y`.

### Info

The server trims the audios and videos to max 10s and has a limit of generating alt text for 30 images.
These can be disabled but are there so as to prevent accidental processing of large files and additional billing.
