package com.focusflow.notification

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.media.AudioAttributes
import android.media.RingtoneManager
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class NotificationModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val CHANNEL_ID = "focus_flow_completion"
        private const val CHANNEL_NAME = "Focus Session Completed"
        private const val CHANNEL_DESCRIPTION = "Notifications for completed focus sessions"
    }

    init {
        createNotificationChannel()
    }

    override fun getName(): String {
        return "FocusFlowNotification"
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val importance = NotificationManager.IMPORTANCE_HIGH
            val channel = NotificationChannel(CHANNEL_ID, CHANNEL_NAME, importance).apply {
                description = CHANNEL_DESCRIPTION
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 1000, 500, 1000, 500, 1000)
                
                // Set custom sound
                val soundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
                val audioAttributes = AudioAttributes.Builder()
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                    .build()
                setSound(soundUri, audioAttributes)
            }

            val notificationManager =
                reactApplicationContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    @ReactMethod
    fun requestNotificationPermission(promise: Promise) {
        // On Android 13+, notification permission is handled by the system automatically
        // when we try to post a notification. We just resolve true.
        promise.resolve(true)
    }

    @ReactMethod
    fun showCompletionNotification(title: String, message: String) {
        android.util.Log.d("NotificationModule", "showCompletionNotification called with title: $title, message: $message")
        
        val context = reactApplicationContext
        val appIcon = context.applicationInfo.icon

        android.util.Log.d("NotificationModule", "Creating notification with app icon: $appIcon")

        // Trigger vibration directly from native (works even when app is in background)
        triggerVibration()

        val builder = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(appIcon)
            .setContentTitle(title)
            .setContentText(message)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setVibrate(longArrayOf(0, 1000, 500, 1000, 500, 1000))
            .setDefaults(NotificationCompat.DEFAULT_SOUND)

        val notificationManager = NotificationManagerCompat.from(context)
        
        // Check if notifications are enabled
        val areNotificationsEnabled = notificationManager.areNotificationsEnabled()
        android.util.Log.d("NotificationModule", "Notifications enabled: $areNotificationsEnabled")
        
        if (!areNotificationsEnabled) {
            android.util.Log.w("NotificationModule", "Notifications are disabled for this app")
        }

        try {
            val notificationId = System.currentTimeMillis().toInt()
            android.util.Log.d("NotificationModule", "Posting notification with ID: $notificationId")
            notificationManager.notify(notificationId, builder.build())
            android.util.Log.d("NotificationModule", "Notification posted successfully")
        } catch (e: SecurityException) {
            android.util.Log.e("NotificationModule", "Notification permission not granted", e)
        } catch (e: Exception) {
            android.util.Log.e("NotificationModule", "Error posting notification", e)
        }
    }

    private fun triggerVibration() {
        try {
            val vibrator = reactApplicationContext.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
            val pattern = longArrayOf(0, 1000, 500, 1000, 500, 1000)
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator.vibrate(VibrationEffect.createWaveform(pattern, -1))
                android.util.Log.d("NotificationModule", "Vibration triggered (API 26+)")
            } else {
                @Suppress("DEPRECATION")
                vibrator.vibrate(pattern, -1)
                android.util.Log.d("NotificationModule", "Vibration triggered (legacy)")
            }
        } catch (e: Exception) {
            android.util.Log.e("NotificationModule", "Error triggering vibration", e)
        }
    }
}
