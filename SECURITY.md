# Security Policy

## Security Status

**Current Status**: The project uses Electron v39.x and has no known vulnerabilities.

### Security Best Practices

For production deployments, we recommend:

1. **Content Security Policy (CSP)**: Add CSP headers to prevent XSS
2. **Context Isolation**: Enable in Electron for better security
3. **Node Integration**: Keep disabled in renderer process
4. **Regular Updates**: Monitor dependencies for security patches

### Reporting Security Issues

If you discover a security vulnerability, please email: jenni.b@gmail.com

Do not create public GitHub issues for security vulnerabilities.

## Dependency Security

Run `npm audit` regularly to check for new vulnerabilities:

```bash
npm audit
```

Last audit: December 2025
- **High**: 0
- **Moderate**: 0
- **Low**: 0
