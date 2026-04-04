import { config } from './config';
import app from './app';

app.listen(config.port, () => {
  console.log(`🚀 Zorvyn Finance Backend running on port ${config.port}`);
  console.log(`📍 Environment: ${config.nodeEnv}`);
  console.log(`🔗 http://localhost:${config.port}/health`);
});
