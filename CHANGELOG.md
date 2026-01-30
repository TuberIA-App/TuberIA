# Changelog

All notable changes to the TuberIA project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-01-30

**TuberIA v1.1 -- Production Hardening & Observability**

### Added

- Dependabot configuration for automated dependency updates across Docker, GitHub Actions, and npm packages
- JSDoc documentation with `@examples` across frontend and backend codebases
- `CONTRIBUTING.md` with development workflow, commit conventions, and pull request guidelines
- `llms.txt` providing structured project context for LLM-assisted development

### Changed

- License changed from MIT to PolyForm Noncommercial 1.0.0 to protect against unauthorized commercial use
- Repository professionalized for production: removed all `console.log` statements, translated code comments to English, cleaned up academic documentation artifacts
- Enhanced `.env.example` files with inline security guidelines and configuration documentation

### Fixed

- Sentry initialization no longer throws errors when environment variables are not configured

### Security

- Integrated Sentry error tracking across frontend and backend with AI/LLM monitoring, token usage tracking, custom spans for OpenRouter API calls, model fallback chain observability, BullMQ worker monitoring, and sensitive data filtering
- Restricted CORS to explicitly allowed origins and added dedicated rate limiting for authentication endpoints
- Added Trivy security scanner as a GitHub Action to detect vulnerabilities on every pull request
- Implemented security verification checklist for pre-deployment audits
- Published `SECURITY.md` vulnerability disclosure policy and `.well-known/security.txt`

## [1.0.0] - 2025-12-12

**TuberIA v1.0 -- Final MVP Release**

### Added

- YouTube anti-blocking system with rotative user agents and exponential backoff retries (1s, 2s, 4s, 8s) to handle transcript fetch failures gracefully
- Optional HTTP/HTTPS proxy support via `YOUTUBE_PROXY_URL` for environments where YouTube access is restricted
- Smart error classification that distinguishes recoverable errors (network timeouts, rate limits, server errors) from permanent failures (video not found, transcripts disabled)
- Credential masking in all log output to prevent accidental secret exposure
- Secure logout endpoint with JWT token revocation backed by a Redis blacklist, ensuring invalidated tokens cannot be reused
- Ultra-resilient AI summarization with automatic model rotation and fallback chain (`nova-2-lite-v1:free` → `nova-2-lite-v1` → `grok-4-fast` → `glm-4.5`) to guarantee summary generation even when individual models are unavailable
- Instant summary generation when following a new channel: the latest video is processed automatically so users see value immediately
- Dashboard with real statistics including time saved, summaries read, and channels followed
- "My Channels" and "My Feed" pages with infinite scroll for seamless browsing
- Follow/Unfollow button available across all views (search results, channel detail, feed)
- Smart redirect that sends authenticated users directly to the dashboard instead of the landing page
- CI/CD pipeline via GitHub Actions: pushing to `main` triggers automatic deployment to the production VPS through Docker
- Caddy reverse proxy with automatic HTTPS certificate provisioning and renewal
- Enhanced health checks and structured logging using Winston with Docker-friendly JSON output
- Persistent Redis configuration for token blacklist and performance cache durability across restarts
- YouTube proxy setup documentation and troubleshooting guide

### Changed

- Retry behavior for transcript fetching is now configurable via `YOUTUBE_TRANSCRIPT_MAX_RETRIES` and `YOUTUBE_TRANSCRIPT_RETRY_DELAY` environment variables
- User agent string is rotated on every retry attempt to reduce blocking probability

### Fixed

- Critical bugs in the transcription pipeline that caused failures in transcript parsing, database persistence, and worker job completion
- Navigation bugs and visual inconsistencies across the frontend application

### Security

- JWT token lifecycle management: login, automatic refresh, and secure logout with server-side token blacklist
- Input validation and structured error handling enforced on all API endpoints
- Anti-blocking measures with rotative user agents prevent YouTube from identifying and blocking automated requests

## [0.2.0] - 2025-12-05

**TuberIA v0.2 -- Beta MVP**

### Added

- Redis integration with dual-client architecture: one dedicated to BullMQ job queuing and one for application-level caching and idempotency checks
- BullMQ asynchronous queue system for video transcription and summarization with built-in monitoring capabilities
- Background workers for transcription and summarization with graceful shutdown handling to prevent data loss during deployments
- RSS feed polling automation using `node-cron` at 30-minute intervals to detect new videos from followed channels
- Idempotency layer using Redis to prevent duplicate summary generation when the same video is processed multiple times
- Performance caching with 60-second TTL for frequently accessed endpoints
- Optimized MongoDB indexes for common query patterns to improve read performance
- Health check endpoint reporting real-time status of Redis and MongoDB connections
- Channel management API: follow and unfollow channels with input validation and duplicate prevention
- User dashboard statistics endpoint (summaries read, channels followed, time saved)
- "My Channels" endpoint returning enriched channel metadata
- Video feed endpoint with pagination support for followed channels
- Channel search API supporting both full YouTube URLs and `@username` format
- Comprehensive API documentation covering authentication, user management, channels, videos, and infrastructure endpoints
- Full channel detail page with backend integration displaying channel info and video history
- Channel search UI with real-time follow/unfollow toggle
- Separate public header component for unauthenticated users
- Smart home page redirection based on authentication state
- Docker Compose configuration for Redis with health checks and data persistence
- Deployment guides for Docker and Caddy reverse proxy setup

### Fixed

- Session handling bugs that caused premature logouts
- Navigation flow issues between public and authenticated routes
- Visual adjustments for consistency across components

## [0.1.0] - 2025-11-28

**TuberIA v0.1 -- Initial Release**

### Added

- Complete JWT authentication system with user registration, login, and automatic token refresh
- YouTube channel search service supporting both full URL and `@username` lookup
- Video transcription service using the YouTube transcript API with error handling and retry logic
- AI-powered video summarization via OpenRouter API with support for multiple models including free-tier options
- MongoDB data models: `User`, `Channel`, `Video`, and `UserChannel` (many-to-many relationship)
- Express middleware suite: JWT authentication, request validation, centralized error handling, and rate limiting
- Winston-based structured logging and graceful server shutdown on SIGTERM/SIGINT
- Full test suite with unit and integration tests using Vitest and Supertest
- React single-page application with client-side routing and authentication flow
- Authentication UI with login and registration forms including client-side validation
- Dashboard interface displaying user statistics and video feed
- Channel search page with follow/unfollow functionality
- Video detail page with Markdown-rendered AI summaries
- Responsive and accessible component design across all pages
- API integration layer with Axios featuring automatic token attachment and refresh on 401 responses
- Protected route system using React context for authentication state management
- Docker containerization for both frontend and backend services
- CORS configuration and security headers for production readiness
- Production-ready Express server with environment-based configuration

[1.1.0]: https://github.com/TuberIA-App/TuberIA/compare/v1.0...v1.1.0
[1.0.0]: https://github.com/TuberIA-App/TuberIA/compare/v0.2...v1.0
[0.2.0]: https://github.com/TuberIA-App/TuberIA/compare/v0.1...v0.2
[0.1.0]: https://github.com/TuberIA-App/TuberIA/releases/tag/v0.1
