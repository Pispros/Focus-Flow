package com.focusflow.backgroundtimer

import android.content.Context
import android.os.Handler
import android.os.Looper
import android.util.Log
import androidx.work.*
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.util.concurrent.TimeUnit

class BackgroundTimerModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "BackgroundTimer"
    }

    @ReactMethod
    fun scheduleTimerCheck(endTimeMillis: Double, durationMinutes: Int, sessionId: Int) {
        val endTime = endTimeMillis.toLong()
        val delay = maxOf(0L, endTime - System.currentTimeMillis())
        
        Log.d(TAG, "Scheduling timer check for $delay ms from now (end: $endTime)")
        
        // Cancel any existing work
        WorkManager.getInstance(reactContext).cancelUniqueWork(WORK_TAG)
        
        // Create input data
        val inputData = workDataOf(
            "endTime" to endTime,
            "durationMinutes" to durationMinutes,
            "sessionId" to sessionId
        )
        
        // Schedule one-time work to trigger at the right time
        val workRequest = OneTimeWorkRequestBuilder<TimerWorker>()
            .setInitialDelay(delay, TimeUnit.MILLISECONDS)
            .setInputData(inputData)
            .addTag(WORK_TAG)
            .build()
        
        WorkManager.getInstance(reactContext)
            .enqueueUniqueWork(WORK_TAG, ExistingWorkPolicy.REPLACE, workRequest)
        
        Log.d(TAG, "Timer check scheduled successfully")
    }

    @ReactMethod
    fun cancelTimerCheck() {
        Log.d(TAG, "Cancelling timer check")
        WorkManager.getInstance(reactContext).cancelUniqueWork(WORK_TAG)
    }

    companion object {
        private const val TAG = "BackgroundTimer"
        private const val WORK_TAG = "focusflow_timer_check"
        var reactContextRef: ReactApplicationContext? = null
    }
    
    init {
        reactContextRef = reactContext
    }
}

class TimerWorker(
    context: Context,
    workerParams: WorkerParameters
) : Worker(context, workerParams) {

    override fun doWork(): Result {
        val endTime = inputData.getLong("endTime", 0L)
        val durationMinutes = inputData.getInt("durationMinutes", 0)
        val sessionId = inputData.getInt("sessionId", 0)
        
        Log.d(TAG, "TimerWorker executing - checking if timer expired")
        Log.d(TAG, "End time: $endTime, Current: ${System.currentTimeMillis()}")
        
        if (System.currentTimeMillis() >= endTime) {
            Log.d(TAG, "Timer expired! Triggering completion from background")
            
            // Send event to JS to handle completion (if app is running)
            // If app is not running, the AppState handler will catch up when it returns
            sendTimerCompletedEvent(sessionId, durationMinutes)
        }
        
        return Result.success()
    }

    private fun sendTimerCompletedEvent(sessionId: Int, durationMinutes: Int) {
        Handler(Looper.getMainLooper()).post {
            try {
                val reactContext = BackgroundTimerModule.reactContextRef
                if (reactContext != null && reactContext.hasActiveReactInstance()) {
                    val params = Arguments.createMap().apply {
                        putInt("sessionId", sessionId)
                        putInt("durationMinutes", durationMinutes)
                        putDouble("timestamp", System.currentTimeMillis().toDouble())
                    }
                    
                    reactContext
                        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                        .emit("onTimerCompleted", params)
                    
                    Log.d(TAG, "✅ Sent timerCompleted event to JS")
                } else {
                    Log.d(TAG, "⚠️ React context not available - app will handle on resume")
                }
            } catch (e: Exception) {
                Log.e(TAG, "❌ Failed to send event", e)
            }
        }
    }

    companion object {
        private const val TAG = "TimerWorker"
    }
}
