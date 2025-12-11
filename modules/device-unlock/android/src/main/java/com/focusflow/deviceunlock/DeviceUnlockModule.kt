package com.focusflow.deviceunlock

import android.app.KeyguardManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import androidx.lifecycle.DefaultLifecycleObserver
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.ProcessLifecycleOwner

class DeviceUnlockModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private var receiver: BroadcastReceiver? = null
    private var listenerCount = 0
    private var lastKnownLockState: Boolean? = null
    private val handler = Handler(Looper.getMainLooper())
    private var lockCheckRunnable: Runnable? = null
    private val keyguardManager: KeyguardManager by lazy {
        reactApplicationContext.getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager
    }

    init {
        Log.d(TAG, "DeviceUnlockModule initialized")
        setupLifecycleObserver()
    }

    override fun getName(): String {
        return "DeviceUnlock"
    }

    @ReactMethod
    fun addListener(eventName: String) {
        listenerCount++
        Log.d(TAG, "addListener called: $eventName, count: $listenerCount")
        if (listenerCount == 1) {
            registerReceiver()
        }
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        listenerCount -= count
        Log.d(TAG, "removeListeners called: $count, remaining: $listenerCount")
        if (listenerCount == 0) {
            unregisterReceiver()
        }
    }

    @ReactMethod
    fun isDeviceLocked(promise: Promise) {
        try {
            val isLocked = keyguardManager.isKeyguardLocked
            Log.d(TAG, "isDeviceLocked: $isLocked")
            promise.resolve(isLocked)
        } catch (e: Exception) {
            Log.e(TAG, "Error checking device lock state", e)
            promise.reject("ERROR", "Failed to check device lock state", e)
        }
    }

    private fun setupLifecycleObserver() {
        try {
            ProcessLifecycleOwner.get().lifecycle.addObserver(object : DefaultLifecycleObserver {
                override fun onStop(owner: LifecycleOwner) {
                    // App went to background - ONLY notify if device is actually locked
                    // Don't send lock event just because app is in background
                    Log.d(TAG, "App went to background, checking if device is locked...")
                    val isLocked = keyguardManager.isKeyguardLocked
                    if (isLocked && lastKnownLockState != true) {
                        Log.d(TAG, "Device is locked while app in background")
                        lastKnownLockState = true
                        val params = Arguments.createMap().apply {
                            putDouble("timestamp", System.currentTimeMillis().toDouble())
                        }
                        sendEvent("onDeviceLock", params)
                    } else {
                        Log.d(TAG, "Device is unlocked, app continues in background (countdown continues)")
                    }
                }

                override fun onStart(owner: LifecycleOwner) {
                    // App came to foreground - check if device state changed
                    Log.d(TAG, "App came to foreground, checking lock state...")
                    checkLockStateAndNotify()
                }
            })
        } catch (e: Exception) {
            Log.e(TAG, "Error setting up lifecycle observer", e)
        }
    }

    private fun checkLockStateAndNotify() {
        val isLocked = keyguardManager.isKeyguardLocked
        Log.d(TAG, "Current lock state: $isLocked, last known: $lastKnownLockState")
        
        if (lastKnownLockState != isLocked) {
            lastKnownLockState = isLocked
            val params = Arguments.createMap().apply {
                putDouble("timestamp", System.currentTimeMillis().toDouble())
            }
            
            if (isLocked) {
                Log.d(TAG, "Device lock detected via state check!")
                sendEvent("onDeviceLock", params)
            } else {
                Log.d(TAG, "Device unlock detected via state check!")
                sendEvent("onDeviceUnlock", params)
            }
        }
    }

    private fun startPeriodicLockCheck() {
        stopPeriodicLockCheck()
        
        lockCheckRunnable = object : Runnable {
            override fun run() {
                checkLockStateAndNotify()
                handler.postDelayed(this, 2000) // Check every 2 seconds
            }
        }
        
        handler.post(lockCheckRunnable!!)
        Log.d(TAG, "Started periodic lock state checking")
    }

    private fun stopPeriodicLockCheck() {
        lockCheckRunnable?.let {
            handler.removeCallbacks(it)
            lockCheckRunnable = null
            Log.d(TAG, "Stopped periodic lock state checking")
        }
    }

    private fun sendEvent(eventName: String, params: WritableMap?) {
        Log.d(TAG, "Sending event: $eventName")
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    companion object {
        private const val TAG = "DeviceUnlockModule"
    }
    private fun registerReceiver() {
        if (receiver != null) {
            Log.d(TAG, "Receiver already registered")
            return
        }

        Log.d(TAG, "Registering broadcast receiver for device lock/unlock events")

        receiver = object : BroadcastReceiver() {
            override fun onReceive(ctx: Context?, intent: Intent?) {
                Log.d(TAG, "Broadcast received: ${intent?.action}")
                when (intent?.action) {
                    Intent.ACTION_USER_PRESENT -> {
                        Log.d(TAG, "Device unlocked by user (USER_PRESENT - password/PIN/pattern entered)!")
                        lastKnownLockState = false
                        val params = Arguments.createMap().apply {
                            putDouble("timestamp", System.currentTimeMillis().toDouble())
                        }
                        sendEvent("onDeviceUnlock", params)
                    }
                    Intent.ACTION_SCREEN_ON -> {
                        Log.d(TAG, "Screen turned on (SCREEN_ON - manual power button or auto wake)!")
                        // Check actual lock state, don't assume unlocked
                        checkLockStateAndNotify()
                    }
                    Intent.ACTION_SCREEN_OFF -> {
                        Log.d(TAG, "Device locked (SCREEN_OFF - manual power button or auto screen timeout)!")
                        lastKnownLockState = true
                        val params = Arguments.createMap().apply {
                            putDouble("timestamp", System.currentTimeMillis().toDouble())
                        }
                        sendEvent("onDeviceLock", params)
                    }
                }
            }
        }

        val filter = IntentFilter().apply {
            addAction(Intent.ACTION_USER_PRESENT)
            addAction(Intent.ACTION_SCREEN_ON)
            addAction(Intent.ACTION_SCREEN_OFF)
        }

        Log.d(TAG, "Registering receiver with filter")
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            reactApplicationContext.registerReceiver(receiver, filter, Context.RECEIVER_NOT_EXPORTED)
        } else {
            reactApplicationContext.registerReceiver(receiver, filter)
        }
        Log.d(TAG, "Receiver registered successfully")
        
        // Start periodic checking as backup for cases where broadcasts don't fire
        startPeriodicLockCheck()
    }

    private fun unregisterReceiver() {
        Log.d(TAG, "Unregistering receiver")
        stopPeriodicLockCheck()
        receiver?.let {
            try {
                reactApplicationContext.unregisterReceiver(it)
            } catch (e: Exception) {
                // Receiver might already be unregistered
            }
            receiver = null
        }
    }

    override fun onCatalystInstanceDestroy() {
        unregisterReceiver()
    }
}
