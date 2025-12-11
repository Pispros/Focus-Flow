import Foundation
import UserNotifications

@objc(BackgroundTimer)
class BackgroundTimerModule: NSObject {
    
    private var timer: Timer?
    private var endTime: TimeInterval = 0
    private var durationMinutes: Int = 0
    private var sessionId: Int = 0
    
    @objc
    func scheduleTimerCheck(_ endTimeMillis: Double, durationMinutes: Int, sessionId: Int) {
        self.endTime = endTimeMillis / 1000.0 // Convert to seconds
        self.durationMinutes = durationMinutes
        self.sessionId = sessionId
        
        let delay = max(0, endTime - Date().timeIntervalSince1970)
        
        print("🕒 [BackgroundTimer] Scheduling timer check for \(delay) seconds from now")
        
        // Cancel existing timer
        cancelTimerCheck()
        
        // Schedule timer
        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }
            
            self.timer = Timer.scheduledTimer(
                timeInterval: delay,
                target: self,
                selector: #selector(self.timerFired),
                userInfo: nil,
                repeats: false
            )
            
            // Ensure timer runs in background
            RunLoop.current.add(self.timer!, forMode: .common)
        }
        
        print("🕒 [BackgroundTimer] Timer scheduled successfully")
    }
    
    @objc
    func cancelTimerCheck() {
        print("🕒 [BackgroundTimer] Cancelling timer check")
        timer?.invalidate()
        timer = nil
    }
    
    @objc
    private func timerFired() {
        print("🕒 [BackgroundTimer] Timer fired! Checking if expired...")
        
        let now = Date().timeIntervalSince1970
        
        if now >= endTime {
            print("🕒 [BackgroundTimer] Timer expired! Showing notification")
            showCompletionNotification()
        }
        
        timer = nil
    }
    
    private func showCompletionNotification() {
        let title = "Focus Session Complete! 🎉"
        let body = "Great job! You completed \(durationMinutes) \(durationMinutes == 1 ? "minute" : "minutes") of focused work."
        
        let content = UNMutableNotificationContent()
        content.title = title
        content.body = body
        content.sound = .default
        
        let request = UNNotificationRequest(
            identifier: "focusflow_completed_\(sessionId)",
            content: content,
            trigger: nil // Deliver immediately
        )
        
        UNUserNotificationCenter.current().add(request) { error in
            if let error = error {
                print("❌ [BackgroundTimer] Error showing notification: \(error)")
            } else {
                print("✅ [BackgroundTimer] Notification shown successfully")
            }
        }
    }
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return true
    }
}
