# Triepod Frontend Template

A React-based frontend template for Triepod applications, integrated with Claude Desktop Commander.

## Quick Start

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```

## Build

To create a production build:
```
npm run build
```

## Dependencies

This project uses:
- React 18
- Material UI
- TypeScript
- React Router

## Dependency Update Notes

### Fixed Issues
- Updated Babel transform plugins to replace deprecated proposal plugins
- Added @jridgewell/sourcemap-codec to replace deprecated sourcemap-codec
- Added @rollup/plugin-terser to replace deprecated rollup-plugin-terser
- Updated glob, rimraf, and lru-cache to latest versions
- Updated React Scripts to v5.0.1
- Added custom .babelrc for proper transformations

### Remaining Warnings
Some dependency warnings may still appear during installation because they're nested dependencies that can't be directly updated without breaking changes:

- nth-check (used by svgo)
- postcss (used by resolve-url-loader)
- prismjs (used by react-syntax-highlighter)

These are internal dependencies of packages we use and would require major version changes to fix, which could potentially break functionality.

## Folder Structure

- `/src` - Application source code
- `/public` - Static assets
- `/src/components` - React components
- `/src/pages` - Page components
- `/src/utils` - Utility functions

## Scripts

- `npm start` - Start development server
- `npm run build` - Create production build
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
