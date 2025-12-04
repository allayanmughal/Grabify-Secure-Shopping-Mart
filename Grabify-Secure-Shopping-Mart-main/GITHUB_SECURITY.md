# 🔒 GitHub Repository Protection Guide

## Protecting Your Grabify Project on GitHub

This guide outlines multiple strategies to protect your project from unauthorized access and cloning.

---

## 🛡️ Method 1: Private Repository (RECOMMENDED)

### Setup Private Repository:

1. **Create Repository as Private**
   - When creating repo on GitHub, select **"Private"** option
   - Only you and invited collaborators can access

2. **Manage Access**
   - Go to: Repository → Settings → Manage access
   - Add collaborators with specific permissions:
     - **Read**: Can view only
     - **Write**: Can push code
     - **Admin**: Full control

### Benefits:
- ✅ Free on GitHub (private repos are free)
- ✅ Complete control over who sees your code
- ✅ Can be made public later if needed

---

## 🔑 Method 2: Protect Sensitive Data

### NEVER Commit These Files:

```
.env
.env.local
.env.production
.firebase/
serviceAccountKey.json
DLL_SECRET (in code)
Firebase API Keys (hardcoded)
```

### Use Environment Variables:

Create a `.env.example` file (safe to commit):

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# DLL Secret (Server-side only)
DLL_SECRET=your_secret_here

# Admin Secret Code
ADMIN_SECRET_CODE=GRABIFY_ADMIN_2025
```

**Important**: Never commit `.env` files!

---

## 📜 Method 3: License Restrictions

### Add a License File:

Create `LICENSE` file with your terms. Example:

```
MIT License

Copyright (c) 2024 [Your Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to use
the Software for educational purposes only.

Commercial use, modification, and distribution are PROHIBITED without explicit
written permission from the copyright holder.
```

### Popular Restrictive Licenses:

1. **Proprietary License** - All rights reserved
2. **Custom License** - Define your own terms
3. **Educational Use Only** - Restrict to learning purposes

---

## 🔐 Method 4: Code Protection Strategies

### 1. Server-Side Secrets Only

**✅ GOOD** - Secrets in environment variables:
```typescript
const DLL_SECRET = process.env.DLL_SECRET; // Server-side only
```

**❌ BAD** - Secrets in client code:
```typescript
const DLL_SECRET = "my-secret"; // NEVER do this!
```

### 2. Use GitHub Secrets for CI/CD

For automated deployments:
- Repository → Settings → Secrets and variables → Actions
- Add secrets that can be used in GitHub Actions
- Never exposed in code or logs

### 3. Obfuscate Critical Logic

Move sensitive business logic to server-side:
- All product CRUD goes through `/app/api/` routes
- DLL password verification happens server-side
- Client never sees secrets

---

## 🚫 Method 5: GitHub Repository Settings

### Enable Branch Protection:

1. Go to: Settings → Branches
2. Add branch protection rule for `main`/`master`
3. Options:
   - ✅ Require pull request reviews
   - ✅ Require status checks
   - ✅ Require conversation resolution
   - ✅ Do not allow bypassing

### Enable Security Features:

1. **Dependabot Alerts**
   - Settings → Security & analysis
   - Enable: "Dependabot alerts"
   - Get notified of vulnerabilities

2. **Secret Scanning**
   - Settings → Security & analysis
   - Enable: "Secret scanning"
   - GitHub scans for exposed secrets

3. **Private Vulnerability Reporting**
   - Allow responsible disclosure

---

## 📝 Method 6: Documentation Protection

### Add Copyright Notice:

At the top of important files:

```typescript
/**
 * Copyright (c) 2024 [Your Name/Company]
 * 
 * This software is proprietary and confidential.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 * 
 * For licensing inquiries, contact: [your-email]
 */
```

### Add README Warnings:

```markdown
## ⚠️ IMPORTANT

This repository contains proprietary code. 
- Unauthorized access is prohibited
- Do not share credentials or API keys
- Contact owner for access requests
```

---

## 🎯 Method 7: Alternative Distribution Methods

### Instead of Public GitHub:

1. **Private Repository + Invitations**
   - Only invite specific people
   - Control access granularly

2. **GitHub Gists** (for code snippets only)
   - Not for full projects

3. **Bitbucket Private** (Alternative to GitHub)
   - Free private repos

4. **Self-Hosted Git**
   - GitLab self-hosted
   - Gitea
   - Complete control

5. **Direct Distribution**
   - Send code via secure channels
   - Password-protected ZIP files
   - Encrypted archives

---

## ✅ Recommended Setup for Your Project:

### Step 1: Create Private Repository

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Grabify Secure Shopping Mart"

# Create private repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/grabify-secure-mart.git
git branch -M main
git push -u origin main
```

**⚠️ Important**: Make sure repository is set to **Private** on GitHub!

### Step 2: Create .env.example

```bash
# Copy this template, never commit actual .env
cp .env.example .env.local
# Edit .env.local with real values
```

### Step 3: Add Security Headers

Create `SECURITY.md`:

```markdown
# Security Policy

## Supported Versions

Only the latest version is supported.

## Reporting a Vulnerability

DO NOT open a public issue. Contact [your-email] directly.
```

---

## 🔍 How to Check What's Exposed:

### Before Pushing to GitHub:

```bash
# Check for sensitive data
grep -r "DLL_SECRET" .
grep -r "firebase.*key" .
grep -r "serviceAccount" .
grep -r "@.*\.com" . --include="*.env*"

# Check git history
git log --all --full-history -- "*secret*"
git log --all --full-history -- "*.env*"
```

### Remove Sensitive Data from History:

If you accidentally committed secrets:

```bash
# Install git-filter-repo
pip install git-filter-repo

# Remove file from all history
git filter-repo --path .env --invert-paths

# Force push (WARNING: Rewrites history)
git push origin --force --all
```

---

## 📋 Checklist Before Uploading:

- [ ] Repository set to **Private**
- [ ] `.env` files in `.gitignore`
- [ ] All secrets moved to environment variables
- [ ] `.env.example` created (without real values)
- [ ] No API keys hardcoded in code
- [ ] No passwords in comments or code
- [ ] Firebase service account keys excluded
- [ ] DLL_SECRET only in environment variables
- [ ] License file added
- [ ] README updated with security notes
- [ ] Branch protection enabled
- [ ] Secret scanning enabled

---

## 🆘 If Secrets Are Exposed:

1. **Immediately**:
   - Revoke all exposed API keys
   - Regenerate Firebase service account
   - Change all passwords
   - Rotate DLL_SECRET

2. **Remove from Git**:
   - Use `git filter-repo` to remove from history
   - Force push (rewrites history)

3. **Monitor**:
   - Check GitHub Security tab for alerts
   - Monitor Firebase usage
   - Watch for unauthorized access

---

## 💡 Best Practices:

1. **Always use Private repos** for personal/proprietary projects
2. **Never commit secrets** - use environment variables
3. **Review before committing** - check what you're adding
4. **Use `.gitignore`** - comprehensive ignore file
5. **Regular audits** - scan for exposed secrets
6. **Limit collaborators** - only invite trusted people
7. **Use branch protection** - prevent accidental pushes
8. **Enable security features** - use GitHub's built-in tools

---

## 📞 Need Help?

- GitHub Docs: https://docs.github.com/en/repositories
- Security Best Practices: https://docs.github.com/en/code-security
- Environment Variables: https://nextjs.org/docs/basic-features/environment-variables

---

**Remember**: Once code is on GitHub (even private), anyone with access can clone it. 
The best protection is:
1. ✅ Private repository
2. ✅ No secrets in code
3. ✅ Limit access to trusted collaborators
4. ✅ Use environment variables for all sensitive data

