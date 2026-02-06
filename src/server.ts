
import app from './app';
import { CONFIG } from './config';

const PORT = CONFIG.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});