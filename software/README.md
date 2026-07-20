# Pulse — Wearable Health Monitor

Apple-native companion dashboard for a wearable health device. Live vitals, historical trends, and daily activity goals — fully functional against a mock data layer today, ready to swap to Supabase later.

## Stack

- React + Vite + TypeScript
- Tailwind CSS (theme tokens for light/dark)
- Framer Motion (spring motion)
- Recharts (gradient-styled charts)
- lucide-react (SF Symbols–style icons)

## Data layer

All data flows through `src/data/readingsProvider.ts`. The UI never talks to a backend directly.

Right now the provider generates realistic random-walk readings (30 days of history, new sample every 30s). When a Supabase project exists, rewrite **only** that file to use the JS client + realtime — see the comment block at the top of the file.

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

Deploy the `dist/` folder to Vercel or Netlify.
