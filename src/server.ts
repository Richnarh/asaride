import createApp from '@/app';
import { logger } from './utils/logger';

const startEngine = async () => {
  const app = await createApp();
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
}

startEngine().catch((error) => {
  logger.error('Failed to start server:', error);
  process.exit(1);
});