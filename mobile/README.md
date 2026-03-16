# Adaptive Business Suite Mobile

Expo Go-first mobile operating system for a car rental entrepreneur that can also shift into personal or hybrid execution mode.

## Purpose

This app is the mobile shell for an AI-native adaptive business operating system:

- the app is the interface, memory, and operational body
- the assistant layer interprets commands and proposes workspace changes
- the product remains useful without a live model
- the workspace can be reshaped through presets, commands, and configuration

## Architecture Summary

The mobile app is organized into five layers:

1. App shell: auth, onboarding, adaptive navigation, global command bar, settings, persistent session
2. Operational core: dashboard, fleet, bookings, customers, maintenance, tasks, notes, calendar, finance, alerts, check-in/out
3. Intelligence layer: deterministic assistant, suggestion pipeline, mock model router, fallback recommendations
4. Adaptation layer: workspace presets, custom fields, custom widgets, quick actions, history, rollback
5. Persistence layer: Zustand store with AsyncStorage, local-first records, model settings, assistant memory, change history

## Features

- Local sign up and login
- Onboarding presets for `Car Rental`, `Personal`, `Hybrid`, and `Custom`
- Command-center dashboard with widgets, reminders, and quick actions
- Fleet, bookings, customers, maintenance, tasks, notes, calendar, finance, and alerts
- Guided quick check-in / check-out flow
- Global command bar plus embedded assistant screen
- Deterministic assistant commands with proposal, preview, apply, dismiss, and rollback
- Model orchestration settings with placeholder providers and no-model fallback mode
- Workspace customization with dynamic modules, custom fields, widgets, and quick actions
- Local persistent storage with clean upgrade points for future backend sync

## Project Structure

```text
mobile/
  App.tsx
  app.json
  src/
    app/               navigation and theme
    components/        reusable UI and overlays
    domain/            types and seed data
    screens/           screen composition
    services/          assistant, customization, sync abstractions
    state/             persisted Zustand store and selectors
```

## Setup

```bash
cd mobile
npm install
npm run typecheck
npx expo-doctor
npm start
```

Then open the project in Expo Go by scanning the QR code from the Metro terminal.

## Expo Go Compatibility

- Uses Expo-supported packages only
- Keeps storage local-first with `@react-native-async-storage/async-storage`
- Avoids custom native modules that would force a development build
- Future backend sync is isolated behind `src/services/syncGateway.ts`
- Future model providers are isolated behind `src/services/assistant.ts`

## Backend Integration Note

The app is fully usable without a backend. When the Railway backend is live, add its public base URL in the mobile Settings screen. The current build keeps that integration isolated so Expo Go remains the first-class local target.

## Future Development Build Upgrade

The current codebase is structured so a later upgrade can add:

- camera/photo capture for vehicle condition workflows
- richer offline sync and background tasks
- stronger push notifications
- live model providers and private/local inference options
- deeper record sync with authenticated backend APIs

These additions should fit behind the existing service abstractions without major screen rewrites.
