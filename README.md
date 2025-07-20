# AI-Powered Parking System

A cross-platform mobile app (React Native + Expo) that connects parking owners (hosts) with users seeking parking spots. Features real-time booking, secure payments, and AI-powered vehicle check-in.

---

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Running](#setup--running)
- [Key Flows](#key-flows)
- [Configuration](#configuration)
- [Contribution](#contribution)

---

## Overview
This app enables:
- **Users** to find, book, and pay for parking spots.
- **Hosts** to list, manage, and earn from their parking spaces.
- **AI/ML**: Vehicle check-in uses number plate recognition for secure access.

---

## Features

### For Users (Parking Seekers)
- Sign Up / Login
- Find parking on a map, filter by distance
- View parking details (features, price, address, etc.)
- Book parking for specific time slots
- Check availability in real-time
- Pay securely via Stripe (add/manage cards)
- Manage bookings: view, cancel, check-in (with number plate verification)
- Wallet: manage payment methods, view transactions
- Profile: view and update user info

### For Hosts (Parking Owners)
- Sign Up / Login
- Create new parking spots (location, images, features)
- Dashboard: view revenue stats (daily/weekly/monthly)
- Manage parkings: update, delete, view all
- Bookings management: view all bookings, confirm check-ins, mark vehicles as visited
- Wallet: view earnings, manage payout methods
- Profile: view and update host info

---

## Tech Stack
- **Frontend**: React Native (Expo), Redux Toolkit, React Navigation
- **Backend API**: Consumed via Axios (auth, parking, booking, payment endpoints)
- **Payments**: Stripe integration
- **Location & Maps**: Google Maps, device geolocation
- **AI/ML**: Number plate recognition for check-in (backend service)

---

## Project Structure
- `src/app/` — Main app screens and navigation (User & Host flows)
- `Redux/` — State management (user, parking, booking slices)
- `src/api/` — API endpoints and HTTP service
- `src/assets/` — Images, fonts, videos
- `android/` — Native Android project files
- `package.json` — Project dependencies and scripts

---

## Setup & Running

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Start the app**
   ```bash
   npx expo start
   ```
   - Open in Expo Go, Android emulator, or iOS simulator.
3. **Backend**
   - Ensure the backend API (auth, parking, booking, payment, number plate recognition) is running and accessible (see `src/api/constants.js` for the base URL).

---

## Key Flows

### User Flow
1. Onboarding → Sign Up / Login → Home (Find Parking, Bookings, Wallet, Profile)
2. Find and book parking → Pay via Stripe → Check-in with number plate verification

### Host Flow
1. Onboarding → Host Sign Up / Login → Host Home (Dashboard, Create Parking, Bookings, Wallet, Profile)
2. Add/manage parkings → View bookings → Confirm check-ins and manage revenue

---

## Configuration
- **Google Maps API Key**: Required for maps (see `app.json` and Android/iOS config)
- **Stripe Publishable Key**: Set in `src/app/index.tsx`
- **Backend URL**: Set in `src/api/constants.js`

---

## Contribution
- Fork and clone the repo
- Create feature branches for changes
- Submit pull requests for review

---

## License
[MIT](LICENSE)
