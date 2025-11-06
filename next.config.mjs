/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
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