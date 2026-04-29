import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_ACTIONS === "true";
const repoName = "nos-dashboard";

const nextConfig: NextConfig = {
  output: isGithubPages ? "export" : undefined,
  images: {
    unoptimized: true,
  },
  trailingSlash: isGithubPages,
  assetPrefix: isGithubPages ? `/${repoName}` : undefined,
  basePath: isGithubPages ? `/${repoName}` : undefined,
};

export default nextConfig;
