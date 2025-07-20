# Hack for Gaza - Medical Triage App

A medical decision support system built with Next.js and Serwist for offline functionality.

## 🚀 Getting Started

### Development

```bash
npm run dev
```

The development server will start at `http://localhost:3000`.

**Note**: Service workers are disabled in development mode to prevent infinite compile loops. This is intentional and will not affect your development workflow.

### Production Build

```bash
npm run build
npm start
```

Service workers are automatically enabled in production builds.

## 🔧 Serwist Configuration

This project uses Serwist for service worker functionality. The configuration has been optimized to prevent infinite compile loops:

### Key Changes Made:

1. **Stable Revision**: Changed from `crypto.randomUUID()` to a stable version string (`"1.0.0"`) to prevent continuous rebuilds.

2. **Development Mode Disabled**: Service workers are disabled in development mode using `disable: process.env.NODE_ENV === "development"`.

3. **Conditional Registration**: The `ServiceWorkerRegistration` component only registers service workers in production mode.

### Configuration Files:

- `next.config.ts`: Main Serwist configuration
- `src/app/sw.ts`: Service worker implementation
- `src/components/ServiceWorkerRegistration.tsx`: Client-side registration logic

## 🏗️ Project Structure

```
hack-for-gaza/
├── src/
│   ├── app/
│   │   ├── sw.ts                 # Service worker implementation
│   │   ├── ~offline/             # Offline fallback page
│   │   └── ...
│   ├── components/
│   │   ├── ServiceWorkerRegistration.tsx
│   │   └── ...
│   └── ...
├── public/
│   ├── sw.js                     # Generated service worker (production only)
│   └── ...
└── next.config.ts                # Serwist configuration
```

## 🐛 Troubleshooting

### Infinite Compile Loop

If you experience infinite compile loops with Serwist:

1. **Check Environment**: Ensure `NODE_ENV=development` is set for development
2. **Clear Cache**: Delete `public/sw.js` and restart the dev server
3. **Verify Configuration**: Check that `disable: process.env.NODE_ENV === "development"` is set in `next.config.ts`

### Service Worker Issues

- Service workers are disabled in development mode by design
- For testing service worker functionality, use production builds
- Check browser console for service worker registration messages

## 📱 PWA Features

- Offline functionality with fallback pages
- Service worker caching strategies
- Push notification support (configured but not implemented)
- Install prompt for mobile devices

## 🛠️ Tech Stack

- **Framework**: Next.js 15.4.2
- **Service Worker**: Serwist 9.1.0
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Fonts**: Geist Sans/Mono

## 📄 License

This project is part of the Hack for Gaza initiative.
