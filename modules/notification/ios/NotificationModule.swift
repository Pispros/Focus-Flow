import Foundation
import UserNotifications
import AudioToolbox
import React

@objc(FocusFlowNotification)
class NotificationModule: NSObject {
  
  override init() {
    super.init()
    requestNotificationPermission()
  }
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
  
  private func requestNotificationPermission() {
    let center = UNUserNotificationCenter.current()
    center.requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
      if let error = error {
        print("[NotificationModule] Permission error: \(error)")
      } else {
        print("[NotificationModule] Notification permission granted: \(granted)")
      }
    }
  }
  
  @objc
  func showCompletionNotification(_ title: String, message: String) {
    print("[NotificationModule] showCompletionNotification called with title: \(title), message: \(message)")
    
    // Trigger haptic vibration directly from native (works even in background)
    triggerVibration()
    
    let content = UNMutableNotificationContent()
    content.title = title
    content.body = message
    content.sound = .default
    
    // Create trigger (immediate)
    let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 0.1, repeats: false)
    
    // Create request
    let request = UNNotificationRequest(
      identifier: UUID().uuidString,
      content: content,
      trigger: trigger
    )
    
    print("[NotificationModule] Scheduling notification with ID: \(request.identifier)")
    
    // Schedule notification
    UNUserNotificationCenter.current().add(request) { error in
      if let error = error {
        print("[NotificationModule] Error showing notification: \(error)")
      } else {
        print("[NotificationModule] Notification posted successfully")
      }
    }
  }
  
  private func triggerVibration() {
    // Vibrate multiple times for 4 seconds total (matching Android pattern)
    DispatchQueue.main.async {
      // First vibration
      AudioServicesPlaySystemSound(kSystemSoundID_Vibrate)
      
      // Second vibration after 1.5s
      DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
        AudioServicesPlaySystemSound(kSystemSoundID_Vibrate)
      }
      
      // Third vibration after 3s
      DispatchQueue.main.asyncAfter(deadline: .now() + 3.0) {
        AudioServicesPlaySystemSound(kSystemSoundID_Vibrate)
      }
      
      print("[NotificationModule] Vibration triggered (triple pattern)")
    }
  }
  
  @objc
  func requestNotificationPermission(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    let center = UNUserNotificationCenter.current()
    center.requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
      if let error = error {
        reject("PERMISSION_ERROR", "Failed to request notification permission", error)
      } else {
        resolve(granted)
      }
    }
  }
}
