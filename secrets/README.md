# Docker Secrets Directory

This directory contains sensitive data for production deployment using Docker secrets.

## ⚠️ IMPORTANT: Security Notice

**NEVER commit actual secret files to git!** The `.gitignore` in this directory ensures secret files are not tracked.

## Required Secret Files for Production

Create the following files in this directory before deploying to production:

### 1. `jwt_secret.txt`
Your JWT secret key (at least 32 characters)
```bash
openssl rand -base64 32 > jwt_secret.txt
```

### 2. `jwt_refresh_secret.txt`
Your JWT refresh token secret (at least 32 characters, different from jwt_secret)
```bash
openssl rand -base64 32 > jwt_refresh_secret.txt
```

### 3. `openrouter_api_key.txt`
Your OpenRouter API key
```bash
echo "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" > openrouter_api_key.txt
```

## Quick Setup

Run these commands from the project root to generate all secrets:

```bash
# Generate JWT secret
openssl rand -base64 32 > secrets/jwt_secret.txt

# Generate JWT refresh secret
openssl rand -base64 32 > secrets/jwt_refresh_secret.txt

# Add your OpenRouter API key (replace with your actual key)
echo "sk-or-v1-your-key-here" > secrets/openrouter_api_key.txt

# Verify files were created
ls -la secrets/
```

## Security Best Practices

1. ✅ **Never commit**: Secret files are ignored by git
2. ✅ **Rotate regularly**: Change secrets periodically
3. ✅ **Secure permissions**: `chmod 600 secrets/*.txt` on Linux/Mac
4. ✅ **Backup securely**: Store backups in encrypted vault (not git)
5. ✅ **Different per environment**: Use different secrets for dev/staging/prod

## Using Secrets in Production

Docker Compose will automatically mount these files into containers at `/run/secrets/` as read-only files.

In your Node.js code, read them like this:

```javascript
import { readFileSync } from 'fs';

// Read Docker secret
const jwtSecret = readFileSync('/run/secrets/jwt_secret', 'utf8').trim();
```

For development, continue using `.env` files as usual.
