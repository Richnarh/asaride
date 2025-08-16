import { logger } from '@/utils/logger';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: `.env.${env}` });

export const initializeDatabase = async (): Promise<DataSource> => {
  try {
    const isProduction = env === 'production';

    const AppDataSource = new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: ['src/entities/*.ts'],
      synchronize: isProduction ? false : true,
      logging: isProduction ? ['error'] : false,
    });

    await AppDataSource.initialize();
    logger.info(`Database connected in ${env} mode`);
    return AppDataSource;
  } catch (error) {
    logger.error('Database connection error:', error);
    process.exit(1);
  }
};