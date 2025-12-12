# YouTube Proxy and User Agent Configuration

## Overview

This document explains how to configure YouTube transcription with rotative user agents and optional proxy support to prevent YouTube from blocking requests.

## Features

### 1. Rotative User Agents (Always Active)
- **Automatically enabled** for all YouTube transcript requests
- Uses the `user-agents` library to generate random, realistic user agent strings
- A new random user agent is created for each transcript request
- Helps prevent YouTube from detecting automated requests

### 2. Optional Proxy Support
- **Configurable via environment variables**
- If configured, all YouTube transcript requests will be routed through the proxy
- Supports HTTP and HTTPS proxies with or without authentication

## Configuration

### Environment Variables

Add the following to your `.env` file:

```bash
# YouTube Proxy Configuration (Optional)
# Leave empty to disable proxy usage (will use rotative user agents only)
# Format: http://USERNAME:PASSWORD@IP:PORT or http://IP:PORT
YOUTUBE_PROXY_URL=
```

### Example Configurations

#### Without Proxy (User Agents Only)
```bash
# Leave YOUTUBE_PROXY_URL empty or comment it out
# YOUTUBE_PROXY_URL=
```

In this mode:
- ✅ Rotative user agents are active
- ❌ No proxy is used
- Requests go directly to YouTube with random user agents

#### With Proxy (Authenticated)
```bash
# Proxy with username and password
YOUTUBE_PROXY_URL=http://USERNAME:PASSWORD@IP:PORT
```

Example:
```bash
YOUTUBE_PROXY_URL=http://myuser:mypass@123.456.789.012:8080
```

#### With Proxy (No Authentication)
```bash
# Proxy without authentication
YOUTUBE_PROXY_URL=http://IP:PORT
```

Example:
```bash
YOUTUBE_PROXY_URL=http://123.456.789.012:8080
```

## Security Best Practices

### Development Environment
Add the proxy URL to your local `.env` file:
```bash
YOUTUBE_PROXY_URL=http://USERNAME:PASSWORD@IP:PORT
```

**Important**: Never commit your `.env` file to Git (it's already in `.gitignore`)

### Production Environment
For production on DigitalOcean, Heroku, or other cloud platforms:

1. **Never commit proxy credentials to Git**
2. **Use environment variables or secrets management**

#### DigitalOcean App Platform
1. Go to your app in the DigitalOcean dashboard
2. Navigate to Settings → App-Level Environment Variables
3. Add a new variable:
   - **Key**: `YOUTUBE_PROXY_URL`
   - **Value**: `http://USERNAME:PASSWORD@IP:PORT`
   - **Scope**: All components or specific to backend
4. Save and redeploy

#### DigitalOcean Droplet (VPS)
```bash
# SSH into your droplet
ssh root@your-droplet-ip

# Edit your .env file
cd /path/to/TuberIA/backend
nano .env

# Add this line:
YOUTUBE_PROXY_URL=http://USERNAME:PASSWORD@IP:PORT

# Save (Ctrl+X, Y, Enter)

# Restart your application
pm2 restart all
# or
systemctl restart your-app-service
```

#### Other Platforms
- **Heroku**: `heroku config:set YOUTUBE_PROXY_URL="http://USERNAME:PASSWORD@IP:PORT"`
- **AWS**: Use AWS Secrets Manager or Parameter Store
- **Docker**: Pass via `-e` flag or docker-compose environment section

## How It Works

### Architecture

```
YouTube Transcript Request
    ↓
1. Create random User-Agent (user-agents library)
    ↓
2. Check if YOUTUBE_PROXY_URL is configured
    ↓
3a. If proxy configured:          3b. If no proxy:
    - Route via proxy                 - Direct connection
    - Use custom fetch functions      - Default fetch
    - Apply user agent                - Apply user agent
    ↓
YouTube API
```

### Request Flow

The `youtube-transcript-plus` library makes three types of HTTP requests:

1. **Video Page Fetch (GET)**: Fetches the YouTube video page
2. **Player Fetch (POST)**: Calls YouTube's Innertube API to get caption tracks
3. **Transcript Fetch (GET)**: Downloads the actual transcript data

All three requests are automatically:
- Configured with a random user agent
- Routed through the proxy (if configured)

### Implementation Details

The configuration is created in `src/utils/youtubeProxyConfig.util.js`:

```javascript
import { createYoutubeTranscriptConfig } from '../../utils/youtubeProxyConfig.util.js';

// In videoTranscription.js
const config = createYoutubeTranscriptConfig();
const transcript = await fetchTranscript(videoUrl, config);
```

## Troubleshooting

### YouTube Still Blocking Requests
1. **Verify proxy is working**: Test the proxy independently
2. **Check proxy credentials**: Ensure username/password are correct
3. **Monitor logs**: Look for "Fetching ... via proxy" messages
4. **Try different videos**: Some videos may have transcripts disabled

### Proxy Connection Errors
1. **Verify proxy URL format**: Must be `http://USERNAME:PASSWORD@IP:PORT`
2. **Check proxy is accessible**: Test from your server's network
3. **Firewall rules**: Ensure outbound connections to proxy are allowed

### Rate Limiting Still Occurring
1. **Add delays**: Implement rate limiting on your application side
2. **Rotate proxies**: Use multiple proxies if available
3. **Cache transcripts**: Store transcripts in your database to reduce requests

## Performance Considerations

- **User agent rotation**: Negligible performance impact (< 1ms per request)
- **Proxy overhead**: Adds ~50-200ms latency depending on proxy location and quality
- **Caching**: Consider implementing caching to reduce YouTube requests

## Maintenance

### Updating Proxy Credentials
If you need to change proxy credentials:

1. Update the environment variable in `.env` (dev) or your platform's settings (prod)
2. Restart your application
3. No code changes required

### Rotating User Agents
User agents are automatically rotated on each request. The `user-agents` library is regularly updated with new user agent strings. To get the latest:

```bash
npm update user-agents
```

## Additional Resources

- [youtube-transcript-plus Documentation](https://github.com/ericmmartin/youtube-transcript-plus)
- [user-agents Library](https://www.npmjs.com/package/user-agents)
- [https-proxy-agent Documentation](https://www.npmjs.com/package/https-proxy-agent)
