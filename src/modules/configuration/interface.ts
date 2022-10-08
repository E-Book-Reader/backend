export default interface Configuration {
  server: {
    port: number;
    cors: string;
    prefix: string;
    secret: string;
  };
  database: {
    host: string;
    port: number;
    user: string;
    name: string;
    password: string;
  };
  google: {
    id: string;
    secret: string;
    uris: {
      auth: string;
      token: string;
    };
    scopes: string[];
    redirects: string[];
  };
}
