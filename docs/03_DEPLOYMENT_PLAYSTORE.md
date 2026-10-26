# EAS Build & Google Play Console Distribution Guide

This document outlines the deployment process for building an Android App Bundle (`.aab`) with EAS and releasing it on the Google Play Console Internal Testing track.

---

## ⚙️ EAS Configuration (`eas.json`)

```json
{
  "cli": {
    "version": ">= 12.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "distribution": "store",
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

---

## 🛠️ Build & Compilation Commands

```bash
# 1. Install EAS CLI globally & login
npm install -g eas-cli
npx eas login

# 2. Link local project with Expo account
npx eas project:init

# 3. Trigger remote production build (.aab App Bundle)
npx eas build --platform android --profile production
```

When prompted: *"Generate a new Android Keystore?"* $\rightarrow$ Select **Yes** so EAS manages keystore credentials automatically.

---

## 📋 Google Play Console Pre-Release Checklist

Before uploading your first `.aab` package, complete these required sections in Google Play Console:

1. **App Access**: Set to *"All functionality is available without special access"*.
2. **Target Age & Content Rating**: Complete Content Rating Questionnaire and set target age to **13+**.
3. **Data Safety Declarations**:
   - **Location Data**: Declare *Precise Location* for app functionality (discovering spots and positioning on map).
   - **Photos & Camera**: Declare *Photos/Videos* for user-generated spot submissions.
4. **Privacy Policy Link**:
   - Host your policy on GitHub Pages (e.g. `https://username.github.io/privacy`).
   - Paste URL in **App content** $\rightarrow$ **Privacy Policy**.

---

## 🚀 Internal Testing & Tester Email List Distribution

1. In Google Play Console sidebar, navigate to **Testing** $\rightarrow$ **Internal testing**.
2. Click **Create new release** and drag & drop your signed `.aab` file.
3. Review warnings (Google Play App Signing is activated automatically).
4. Go to the **Testers** tab $\rightarrow$ click **Create email list** (add up to 100 tester Gmail accounts).
5. Copy the generated **"Join on Android"** / **"Join on the web"** invitation link and send it to your team!
