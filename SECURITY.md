# Security Policy

## Supported Versions

We actively support the following versions of TuberIA with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of TuberIA seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them through one of these methods:

1. **GitHub Private Vulnerability Reporting**: Use the "Security" tab in this repository to [privately report a vulnerability](https://github.com/TuberIA-App/TuberIA/security/advisories/new).

### What to Include

Please include the following information in your report:

- Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting, authentication bypass)
- Full paths of source file(s) related to the issue
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

### Response Timeline

- **Acknowledgment**: Within 48 hours
- **Initial assessment**: Within 7 days
- **Resolution target**: Within 30 days for critical issues

### What to Expect

1. We will acknowledge receipt of your vulnerability report
2. We will provide an initial assessment of the severity
3. We will work with you to understand and resolve the issue
4. We will notify you when the vulnerability is fixed
5. We will credit you in our security advisories (unless you prefer to remain anonymous)

## Security Best Practices for Contributors

If you're contributing to TuberIA, please follow these security guidelines:

1. **Never commit secrets**: API keys, passwords, tokens should NEVER be in code
2. **Use environment variables**: All sensitive configuration should be in `.env` files
3. **Validate input**: Always validate and sanitize user input
4. **Keep dependencies updated**: Regularly update npm packages
5. **Follow the principle of least privilege**: Request only necessary permissions

## Security Measures in Place

TuberIA implements the following security measures:

- **Authentication**: JWT-based authentication with refresh tokens
- **Rate Limiting**: Protection against brute force attacks (1000 req/15min general, 10 req/15min for auth)
- **Input Validation**: express-validator for request validation
- **Security Headers**: Helmet.js for HTTP security headers
- **CORS**: Configured for specific origins in production
- **Secrets Management**: Docker secrets for production credentials
- **Dependency Scanning**: Automated via Dependabot and Trivy

## Acknowledgments

We would like to thank the following individuals for responsibly disclosing security issues:

*No vulnerabilities have been reported yet.*

---

This security policy is based on recommended practices and may be updated as the project evolves.
