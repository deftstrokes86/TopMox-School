/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Log unhandled promise rejections in production too
  onError: (error) => {
    console.error("Unhandled error:", error);
  }
};

export default nextConfig;
