import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next writes a managed block into CLAUDE.md on every build and dev start.
  // CLAUDE.md is the project contract and changing it is Tural's call, so a
  // build silently editing it risks a future session committing a contract
  // change nobody decided on. This turns that generator off.
  agentRules: false,
};

export default nextConfig;
