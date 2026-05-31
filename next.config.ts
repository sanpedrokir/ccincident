import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    EMAIL_API_KEY: process.env.EMAIL_API_KEY ?? '',
    EMAIL_FROM: process.env.EMAIL_FROM ?? '',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? '',
    CRON_SECRET: process.env.CRON_SECRET ?? '',
  },
};

export default nextConfig;
