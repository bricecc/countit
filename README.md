# CountIt

CountIt is a smart, portable tracking web application that allows you to count habits, events, and items. It features local guest mode, cloud synchronization via a lightweight backend, and multi-language support (English, French, German).

## Features

- **Counters**: Create customizable counters with colors and categories.
- **History Tracking**: Optionally track the exact timestamp of every count.
- **Data Portability**: Import/Export your data as JSON at any time.
- **Dual Mode**: 
  - **Local Mode**: Works entirely in the browser using LocalStorage.
  - **Cloud Sync**: Sign in to sync data to a SQLite backend.
- **Internationalization**: Fully translated into English, French, and German.

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   ```
   The backend runs on `http://localhost:3001`.

3. **Run the Frontend**
   Serve the root directory using a static file server (e.g., Live Server, `npx serve`, or open `index.html` via a local server setup).

## Technologies

- **Frontend**: React 19 (via ESM imports), Tailwind CSS, Lucide Icons (SVG).
- **Backend**: Node.js, Express, SQLite3.
- **Auth**: JWT, bcrypt.
