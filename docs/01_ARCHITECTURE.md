# TouristGuide Mobile App Architecture & Design Guidelines

This document outlines the architecture, theme guidelines, and feature component setup for the TouristGuide mobile application.

---

## 🎨 Visual Aesthetic & Theme Rules

The mobile application utilizes a vibrant, energetic visual language configured in `tailwind.config.js` and `constants/theme.ts`:

- **Primary Color**: Energetic Coral / Orange (`#FF5A5F`)
- **Secondary Color**: Electric Teal / Cyan (`#00D1C4`)
- **Background**: Warm Off-white (`#F7F9FA`)
- **Bottom Tab Layout**: Active tab items render in a glowing rounded container pill with Coral background (`#FF5A5F`) and crisp white icon.

---

## 📱 Mobile Tech Stack

- **Framework**: Expo SDK 52 + React Native 0.76
- **Navigation**: Expo Router v4 (File-based navigation)
- **Styling**: NativeWind v4 (Tailwind CSS)
- **Icons**: Lucide React Native
- **State & Data Fetching**: TanStack Query (React Query) v5
- **Animations**: React Native Reanimated v3
- **Graphics & Screenshots**: `react-native-view-shot` + `expo-linear-gradient`
- **Location & Camera**: `expo-location`, `expo-image-picker`, `expo-media-library`

---

## 📂 Core Folder Structure

```
TouristGuide/
├── app/
│   ├── _layout.tsx           # Root layout with QueryClient & Onboarding Guard
│   ├── onboarding.tsx        # 3-slide Reanimated onboarding carousel
│   ├── share-preview.tsx     # Universal social share screen
│   ├── add-spot.tsx          # "Add New Discovery" UGC spot submission screen
│   └── (tabs)/
│       ├── _layout.tsx       # Glowing pill bottom tab layout
│       ├── index.tsx         # "Explore" feed with infinite scrolling
│       ├── map.tsx           # Interactive Map screen with custom markers & bottom overlay
│       └── saved.tsx         # Bookmarked spots screen
├── components/
│   ├── LocationCard.tsx      # Location card component with distance badge & action buttons
│   ├── SuggestSpotModal.tsx  # UGC spot submission modal
│   ├── UGCImageSelector.tsx  # Dotted coral camera/gallery image picker component
│   └── VibrantShareCard.tsx  # ViewShot-wrapped sunset gradient story template
├── constants/
│   ├── theme.ts              # Semantic theme colors (Colors.primary, Colors.markers)
│   └── locations.ts          # Shared location interfaces & default coordinates
├── services/
│   └── api.ts                # Central API service & TanStack Query hooks
└── utils/
    └── share.ts              # Universal OS share sheet & deep link generator
```

---

## 🚀 Key Feature Components

### 1. Explore Feed (`app/(tabs)/index.tsx`)
- Lush Electric Teal to Deep Blue `<LinearGradient>` top header.
- White floating search bar with pop-out shadow (`shadow-lg`).
- Horizontal category chips with distinct bold color signatures (`Historical` = Purple, `Dining` = Amber, `Events` = Coral).
- Infinite scroll feed connected to `useExploreInfiniteQuery`.

### 2. Interactive Map (`app/(tabs)/map.tsx`)
- `expo-location` dynamic permission check with automatic camera animation.
- Category-tinted map markers (`Colors.markers`).
- Sliding bottom modal overlay displaying location preview cards.

### 3. Universal Sharing (`app/share-preview.tsx` & `components/VibrantShareCard.tsx`)
- 9:16 portrait sunset gradient story card template (`LinearGradient colors={['#FF5A5F', '#FF8E53', '#7C3AED']}`).
- Captured via `react-native-view-shot` into a high-res PNG.
- Invokes native OS share sheet using `Share.share` with punchy payload format:
  `"✨ Look what I just discovered using TravelApp! 📍 [Location Name] - [Short Excerpt Description]. Check it out here: https://mytravelapp.com/[PlaceID]"`
