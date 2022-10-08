import Configuration from './interface';

export default (): Configuration => ({
  server: {
    prefix: 'api',
    secret: process.env.SECRET,
    port:
      parseInt(process.env.SERVER_PORT, 10) ||
      3001 /*remove || (or), with validation if not set it will throw an error and crash the application */,
  },
  database: {
    host: process.env.DATABASE_HOST,
    port:
      parseInt(process.env.DATABASE_PORT, 10) ||
      3306 /*remove || (or), with validation if not set it will throw an error and crash the application */,
    user: process.env.DATABASE_USER,
    name: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
  },
  google: {
    id: process.env.GOOGLE_CLIENT_ID,
    secret: process.env.GOOGLE_CLIENT_SECRET,
    uris: {
      auth: process.env.GOOGLE_AUTH_URI,
      token: process.env.GOOGLE_TOKEN_URI,
    },
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ],
    redirects: [
      'http://localhost',
      'https://e-erader.com',
      'http://localhost:8080/auth/callback',
      'http://localhost:3000/login/callback',
    ],
  },
});
