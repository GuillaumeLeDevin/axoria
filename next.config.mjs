/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['axoria-blog-educ.b-cdn.net'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'axoria-blog-educ.b-cdn.net',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;