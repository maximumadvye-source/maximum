# Deployment Guide — Vercel (Next.js App Router)

This guide explains how to deploy the project located in the `maximum-main` folder to Vercel. It includes detailed steps for both the Vercel Dashboard (Git integration) and CLI deployment.

Important: this repository contains the actual app under the `maximum-main` folder. Make sure Vercel builds from that folder (root directory) so it finds `package.json` and `vercel.json` correctly.

---

## 1 — Pre-checks (Local)
- Confirm `package.json` exists at `maximum-main/package.json`.
- Confirm `next.config.js` and `app/` folder exist.
- Confirm `vercel.json` in the repository root and `maximum-main/vercel.json` (if needed). Both are optional but helpful.

Test locally:
```bash
cd maximum-main
npm install
npm run build
```
If the build succeeds, the project is ready for production deployment.

---

## 2 — Vercel Dashboard (recommended for Git integration)
1. Log into Vercel and open your Project (create a new project if it doesn't exist).
2. In the Project Settings → General:
   - **Root Directory**: set to `maximum-main` (this is critical so Vercel finds the app's `package.json`).
   - **Framework Preset**: set to `Next.js`.
   - **Install Command**: `npm install` (or `npm ci` for CI installs).
   - **Build Command**: `npm run build`.
   - **Output Directory**: `.next`.
3. Node Version:
   - Ensure Node is set to `18.x` (or `20.x`) in the Project -> Settings environment if Vercel offers the option. If not available, it will pick the version from `engines.node` in `package.json` if present. Our package.json includes `"engines": { "node": ">=18" }`.
4. Environment variables:
   - Add any production environment variables required by your app (found in `.env.example` or `.env.local`).
5. Git Integration (if using GitHub/GitLab):
   - Connect the repository. In the project settings, ensure the **Root Directory** is still `maximum-main` for the selected repository.
   - Trigger a redeploy (e.g., push a commit or click the “Deploy” button).

---

## 3 — CLI Deployment (if using `vercel` CLI)
From the parent workspace root or anywhere, prefer setting the current working directory to the app folder.

Preferred approach (recommended):
```bash
cd maximum-main
vercel --prod
```
Or, to deploy from any path, use:
```bash
vercel --prod --cwd "$(pwd)/maximum-main"
```

The CLI publishes the folder you pass through `--cwd`, so always make sure it points to `maximum-main`.

---

## 4 — Troubleshooting

- `ENOENT: Could not read package.json`: Vercel attempted to run `npm install` from a folder without `package.json`. Fixes: 
  - Set **Root Directory** in Vercel Dashboard to `maximum-main`.
  - Ensure you deploy from `maximum-main` or pass `--cwd` pointing to `maximum-main` when using CLI.
  - Make sure `vercel.json` is present at repo root and has `rootDirectory: "maximum-main"` to guide Vercel if necessary.

- `Node version problem`: If the build fails due to Node version, set Node in Vercel to 18.x or 20.x or set `engines.node` in `package.json`.

- `Image optimization (sharp)` warning: Not required to build, but installing `sharp` in production will enable faster image optimization.

---

## 5 — Post-deploy validation
1. Review Build Logs in Vercel → Deployments for errors or warnings: make sure the build ran in `maximum-main` (the logs show path and commands executed).
2. If the build fails due to missing packages, check `package.json` and devDependency correlation.
3. If everything completes, Vercel will provide a domain for preview and production.

---

If you'd like, I can add a quick `VERCEL_DEPLOY.md` checklist into the repo root and also include the local build command snippet and a link to Vercel docs. Let me know if you'd also like a short release checklist to copy into PRs.
