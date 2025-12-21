// config/cache.js
const { createClient } = require('redis');
const logger = require('../utils/logger');

let client;

const connectRedis = async () => {
  try {
    client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    client.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    await client.connect();
    logger.info('Connected to Redis');
    return client;
  } catch (error) {
    logger.error('Redis connection error:', error);
    process.exit(1);
  }
};

const getClient = () => {
  if (!client) {
    throw new Error('Redis client not initialized');
  }
  return client;
};

const disconnectRedis = async () => {
  if (client) {
    await client.quit();
    logger.info('Disconnected from Redis');
  }
};

module.exports = {
  connectRedis,
  disconnectRedis,
  getClient
};