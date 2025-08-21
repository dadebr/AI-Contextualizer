import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },

  webpack: (config, { webpack, isServer }) => {
    // Resolver problemas com handlebars e require.extensions
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };

    // Ignorar avisos do handlebars
    config.externals = config.externals || [];
    config.externals.push({
      handlebars: 'handlebars'
    });

    return config;
  },
};

export default nextConfig;
