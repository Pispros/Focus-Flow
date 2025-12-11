# FocusFlow - Release Build Guide

## 🔑 Setup Release Signing

### Step 1: Generate Your Keystore (If you haven't already)

```bash
keytool -genkeypair -v -keystore fcflow.jks -alias fcflow -keyalg RSA -keysize 2048 -validity 10000
```

You'll be prompted to enter:

- Keystore password (remember this!)
- Key password (can be same as keystore password)
- Your name and organization details

**Important:** Keep this keystore file safe! You'll need it for all future app updates.

### Step 2: Configure Your Keystore

1. Copy the template file:

```bash
cp android/keystore.properties.template android/keystore.properties
```

2. Edit `android/keystore.properties` and fill in your values:

```properties
storeFile=/path/to/your/fcflow.jks
storePassword=YOUR_KEYSTORE_PASSWORD
keyAlias=fcflow
keyPassword=YOUR_KEY_PASSWORD
```

**Note:** You can use either:

- Absolute path: `/home/user/keys/fcflow.jks`
- Relative path from `android/app/`: `../../keys/fcflow.jks`

### Step 3: Build Your Release

That's it! Now you can build your signed release:

```bash
cd android
./gradlew assembleRelease
```

## 📦 Build Output

**Signed Release APK:** `android/app/build/outputs/apk/release/app-release.apk`
**Size:** ~62 MB

## 🚀 Building for Production

### Android Release APK

```bash
cd android
./gradlew assembleRelease
```

The signed APK will be generated at:

```
android/app/build/outputs/apk/release/app-release.apk
```

### Android App Bundle (AAB) for Google Play

```bash
cd android
./gradlew bundleRelease
```

The signed AAB will be generated at:

```
android/app/build/outputs/bundle/release/app-release.aab
```

## 📱 Installing the Release APK

### Via ADB

```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

### Via File Transfer

Transfer `app-release.apk` to your device and install manually.

## 🔒 Security Notes

1. **Keystore Backup:** Your `.jks` keystore file is critical. Back it up securely in multiple locations!
2. **Git Protection:** Keystore files (`.jks`, `.keystore`) and `keystore.properties` are excluded from git
3. **Password Security:** Never commit passwords to git. The `keystore.properties` file is git-ignored
4. **Never Lose the Keystore:** If you lose this keystore, you cannot update your app on the Play Store
5. **Keep Passwords Safe:** Store them in a password manager or secure vault

## 🎨 App Icons

App icons have been configured for both platforms:

**Android:**

- All densities: mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi
- Adaptive icons for Android 8.0+
- Location: `android/app/src/main/res/mipmap-*`

**iOS:**

- All required sizes (20x20 to 1024x1024)
- watchOS and macOS icons included
- Location: `ios/focusFlow/Images.xcassets/AppIcon.appiconset/`

## 📝 Version Management

Update version in `android/app/build.gradle`:

```gradle
defaultConfig {
    versionCode 1      // Integer: increment for each release
    versionName "1.0"  // String: user-visible version
}
```

## 🔄 Release Checklist

- [x] Release keystore generated
- [x] Signing configuration in `gradle.properties`
- [x] Build configuration in `app/build.gradle`
- [x] Keystore secured and backed up
- [x] App icons configured
- [x] Successful release build
- [ ] Test on physical device
- [ ] Verify all features work
- [ ] Check permissions in production
- [ ] Update version numbers
- [ ] Create release notes

## 🎯 Next Steps for Play Store Release

1. **Test Thoroughly:** Install and test the release APK on real devices
2. **Create App Bundle:** Run `./gradlew bundleRelease` for Play Store
3. **Screenshots:** Prepare app screenshots for store listing
4. **Store Listing:** Prepare description, privacy policy, etc.
5. **Upload to Play Console:** Upload the AAB file to Google Play Console
6. **Submit for Review:** Complete the release process

## 🍎 iOS Release (Requires macOS)

For iOS release builds, you'll need:

1. macOS with Xcode installed
2. Apple Developer Account ($99/year)
3. App Store Connect setup

```bash
cd ios
pod install
# Open focusFlow.xcworkspace in Xcode
# Archive and distribute through Xcode
```

---

**Important:** Keep your keystore and passwords safe! They are required for all future app updates.
