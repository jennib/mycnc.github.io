# Security Policy

## Known Security Considerations

### Electron Version (Moderate Risk)

**Current Status**: The project uses Electron v28.x, which has 3 moderate severity vulnerabilities related to ASAR integrity.

**Recommended Fix**: Upgrade to Electron v35.7.5 or higher.

**Why Not Fixed Yet**: Upgrading from Electron v28 to v35 is a major version jump (7 versions) that could introduce breaking changes. This requires:
- Testing all Electron APIs
- Updating electron-builder configuration
- Full regression testing
- Potential code changes in main process

**Risk Assessment**: 
- **Severity**: Moderate
- **Impact**: ASAR file integrity bypass (packaging/distribution issue)
- **Mitigation**: Affects packaged/distributed applications, not development
- **Timeline**: Planned for future major version update

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

Last audit: November 2024
- **High**: 0
- **Moderate**: 3 (Electron - documented above)
- **Low**: 0
