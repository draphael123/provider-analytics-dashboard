# Deployment Guide

## GitHub Repository
✅ Code has been pushed to: https://github.com/draphael123/provider-analytics-dashboard.git

## Vercel Deployment

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. Go to [Vercel](https://vercel.com) and sign in with your GitHub account
2. Click "Add New Project"
3. Import the repository: `draphael123/provider-analytics-dashboard`
4. Vercel will auto-detect the Vite framework
5. Configure build settings (should be auto-detected):
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
6. Click "Deploy"

### Option 2: Deploy via Vercel CLI

1. Install Vercel CLI globally:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from project directory:
   ```bash
   vercel
   ```

4. Follow the prompts to link your project

### Option 3: Deploy via GitHub Integration

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Select "Import Git Repository"
4. Choose `provider-analytics-dashboard`
5. Vercel will automatically:
   - Detect Vite framework
   - Set up build settings
   - Deploy on every push to main branch

## Post-Deployment

After deployment, your app will be available at:
- `https://provider-analytics-dashboard.vercel.app` (or your custom domain)

The Excel file in the `public` folder will be accessible at:
- `https://your-domain.vercel.app/Doxy - Over 20 minutes (9).xlsx`

## Environment Variables

No environment variables are required for this project.

## Build Configuration

The project uses:
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Node Version**: 18.x or higher (auto-detected by Vercel)

## Troubleshooting

If you encounter issues:

1. **Build fails**: Check that all dependencies are in `package.json`
2. **File not found**: Ensure the Excel file is in the `public` folder
3. **Routing issues**: The `vercel.json` includes SPA rewrite rules

## Continuous Deployment

Once connected to Vercel, every push to the `main` branch will automatically trigger a new deployment.

