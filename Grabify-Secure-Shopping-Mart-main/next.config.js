/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
  env: {
    DLL_SECRET: process.env.DLL_SECRET,
  },
}

module.exports = nextConfig

