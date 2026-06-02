import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  mongoURI: process.env.MONGO_URI!,
}));
