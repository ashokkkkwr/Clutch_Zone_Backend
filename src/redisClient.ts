// import 'dotenv/config';               // ensure .env is loaded (if using dotenv)
// import { createClient } from 'redis';

// const redisHost = process.env.REDIS_HOST || 'localhost';
// const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);

// const redisClient = createClient({
//   socket: {
//     host: redisHost,
//     port: redisPort,
//   },
// });

// redisClient.on('error', err => {
//   console.error('Redis Client Error', err);
// });

// redisClient.connect()
//   .then(() => console.log(`Redis Client Connected to ${redisHost}:${redisPort}`))
//   .catch(err => console.error('Redis Client Connection Error', err));

// export default redisClient;
