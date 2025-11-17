/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    spa: true,               // single-page app mode
    serverComponents: false, // disable RSC
    turbo: false             // use SWC instead of turbopack
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
