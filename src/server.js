// Entry point: load settings from .env, then start the web server.
import 'dotenv/config';
import app from './app.js';

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`Task Manager API listening on http://localhost:${PORT}`);
});
