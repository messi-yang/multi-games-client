const Env = {
  API_SCHEMA: process.env.API_SCHEMA || 'http',
  API_SOCKET_SCHEMA: process.env.API_SOCKET_SCHEMA || 'ws',
  API_HOST_NAME: process.env.API_HOSTNAME || 'localhost',
  API_PORT: process.env.API_PORT !== undefined ? process.env.API_PORT : '8080',
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    dirs: ['src'],
  },
  images: {
    remotePatterns: [
      {
        protocol: Env.API_SCHEMA,
        hostname: Env.API_HOST_NAME,
        port: Env.API_PORT,
      },
    ],
  },
  env: {
    API_URL: `${Env.API_SCHEMA}://${Env.API_HOST_NAME}:${Env.API_PORT}`,
    API_SOCKET_URL: `${Env.API_SOCKET_SCHEMA}://${Env.API_HOST_NAME}:${Env.API_PORT}`,
  },
};

module.exports = nextConfig;
