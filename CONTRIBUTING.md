# Contributing to TuberIA

Thank you for your interest in contributing to TuberIA! This document provides guidelines for contributing to the project.

## Getting Started

1. **Fork the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/TuberIA.git
   cd TuberIA
   ```

2. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Set up the development environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   docker compose up -d
   ```

4. **Make your changes**

5. **Test your changes**
   ```bash
   cd backend && npm test
   cd frontend && npm run build
   ```

6. **Commit your changes**
   ```bash
   git commit -m "feat: add your feature description"
   ```

7. **Push and create a Pull Request**
   ```bash
   git push origin feature/your-feature-name
   ```

## Code Style Guidelines

- **Language**: All code comments and documentation must be in English
- **Formatting**: Follow existing code patterns and formatting
- **Naming**: Use descriptive variable and function names
- **Testing**: Include tests for new features when applicable

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

## Pull Request Process

1. Ensure your code follows the project's style guidelines
2. Update documentation if needed
3. Add tests for new functionality
4. Ensure all tests pass
5. Request review from maintainers

## Reporting Issues

When reporting issues, please include:

- Clear title and description
- Steps to reproduce the issue
- Expected vs actual behavior
- Environment details (OS, Node version, Docker version)
- Screenshots if applicable

## Questions?

Feel free to open an issue for questions or reach out to the maintainers.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
