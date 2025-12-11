# Quick Release Signing Setup

## 3 Simple Steps to Configure Release Signing

### 1️⃣ Generate Your Keystore (if you haven't already)

```bash
keytool -genkeypair -v -keystore fcflow.jks -alias fcflow -keyalg RSA -keysize 2048 -validity 10000
```

Follow the prompts to enter passwords and your details.

### 2️⃣ Create Your Configuration File

```bash
cp keystore.properties.template keystore.properties
```

### 3️⃣ Edit `keystore.properties`

Open `android/keystore.properties` and fill in:

```properties
# Path to your fcflow.jks file (absolute or relative to android/app/)
storeFile=/home/yourname/path/to/fcflow.jks

# The password you entered when creating the keystore
storePassword=your_keystore_password

# Key alias (default: fcflow)
keyAlias=fcflow

# Key password (usually same as storePassword)
keyPassword=your_key_password
```

## ✅ That's It!

Now you can build your release:

```bash
cd android
./gradlew assembleRelease
```

Your signed APK will be at:

```
android/app/build/outputs/apk/release/app-release.apk
```

## 🔒 Security

The `keystore.properties` file is automatically ignored by git for security.

**IMPORTANT:**

- Backup your `.jks` file safely!
- Never commit it to git
- You need it for ALL future app updates
