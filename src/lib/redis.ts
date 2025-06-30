import Redis from 'ioredis';

const redis = new Redis(process.env.NEXT_PUBLIC_REDIS_URL!, {
    lazyConnect: true,
    maxRetriesPerRequest: null,
    tls: {}
});

redis.on('error', (err) => {
  console.error('[Redis 오류 발생]', err);
});

export default redis;