import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `next dev` writes a managed block into CLAUDE.md when it starts. Not
  // `next build` — the generator lives in server/lib/start-server.js, so it
  // never runs on Vercel; this is a local-only annoyance that reappears every
  // time the dev server starts. CLAUDE.md is the project contract and changing
  // it is Tural's call, so a tool editing it unasked risks a future session
  // committing a contract change nobody decided on. This turns it off.
  agentRules: false,
};

export default nextConfig;
