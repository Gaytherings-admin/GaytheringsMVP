# Deployment Guide - GitHub

## ⚠️ Important: GitHub Authentication

GitHub no longer accepts passwords for Git operations. You need to use a **Personal Access Token (PAT)**.

## Option 1: Create Personal Access Token (Recommended)

### Step 1: Create Token
1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a name: `GaytheringsMVP Deployment`
4. Select scopes:
   - ✅ `repo` (Full control of private repositories)
5. Click **"Generate token"**
6. **Copy the token immediately** (you won't see it again!)

### Step 2: Push Using Token
```bash
cd /home/harman/Documents/Gatherings

# Set remote with token
git remote set-url origin https://YOUR_TOKEN@github.com/Gaytherings-admin/GaytheringsMVP.git

# Push to repository
git push -u origin main
```

**Replace `YOUR_TOKEN` with the token you just created.**

## Option 2: Use GitHub CLI

```bash
# Install GitHub CLI (if not installed)
# Ubuntu/Debian:
sudo apt install gh

# Login
gh auth login

# Push
git push -u origin main
```

## Option 3: Manual Upload via GitHub Web

1. Go to: https://github.com/Gaytherings-admin/GaytheringsMVP
2. Click **"uploading an existing file"**
3. Drag and drop all files (except `node_modules`, `.env.local`, `.next`)
4. Commit directly

## Current Status

✅ **Code is committed locally** - ready to push
✅ **Remote is configured** - pointing to Gaytherings-admin/GaytheringsMVP
✅ **All files are staged** - including:
   - Booking form with email functionality
   - Documentation files
   - Banner section
   - API routes

## Quick Push Command (After Creating PAT)

```bash
# Replace YOUR_TOKEN with your Personal Access Token
git remote set-url origin https://YOUR_TOKEN@github.com/Gaytherings-admin/GaytheringsMVP.git
git push -u origin main
```

## Files Being Deployed

- ✅ `app/page.tsx` - Updated with banner and booking modal
- ✅ `app/api/booking/route.ts` - Email sending API
- ✅ `NEXTJS_DOCUMENTATION.md` - Complete Next.js guide
- ✅ `EMAIL_SETUP.md` - Email configuration guide
- ✅ `SETUP.md` - Project setup instructions
- ✅ `package.json` - Updated dependencies (nodemailer)
- ✅ All other project files

## Security Note

⚠️ **Never commit `.env.local`** - It's already in `.gitignore` and contains sensitive credentials.

