/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://novainstitute.gt.tc/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
