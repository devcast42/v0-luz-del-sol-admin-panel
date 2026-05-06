/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ['*.vusercontent.net', '*.vercel.app', '*.v0.app', '*.v0.dev'],
}

export default nextConfig
