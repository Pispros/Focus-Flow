import Foundation
import UIKit

@objc(DeviceUnlock)
class DeviceUnlockModule: RCTEventEmitter {
    private var isObserving = false
    private var hasListeners = false
    
    override init() {
        super.init()
    }
    
    override func supportedEvents() -> [String]! {
        return ["onDeviceUnlock", "onDeviceLock"]
    }
    
    override func startObserving() {
        hasListeners = true
        if !isObserving {
            isObserving = true
            registerNotifications()
        }
    }
    
    override func stopObserving() {
        hasListeners = false
        if isObserving {
            isObserving = false
            unregisterNotifications()
        }
    }
    
    @objc
    func isDeviceLocked(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        // On iOS, we can't directly check lock state from user space
        // But we can use protected data availability as a proxy
        let isLocked = !UIApplication.shared.isProtectedDataAvailable
        resolve(isLocked)
    }
    
    private func registerNotifications() {
        let notificationCenter = NotificationCenter.default
        
        // Protected data becomes available when device is unlocked
        // This fires ONLY when the device is unlocked (both manual and automatic lock)
        notificationCenter.addObserver(
            self,
            selector: #selector(handleDeviceUnlock),
            name: UIApplication.protectedDataDidBecomeAvailableNotification,
            object: nil
        )
        
        // Protected data becomes unavailable when device is locked
        // This fires for BOTH manual lock button press AND automatic screen timeout
        notificationCenter.addObserver(
            self,
            selector: #selector(handleDeviceLock),
            name: UIApplication.protectedDataWillBecomeUnavailableNotification,
            object: nil
        )
        
        // Also listen for app becoming active (screen unlock, app returning to foreground)
        notificationCenter.addObserver(
            self,
            selector: #selector(handleDeviceUnlock),
            name: UIApplication.didBecomeActiveNotification,
            object: nil
        )
        
        // And app entering background (potential lock - user switching apps or locking screen)
        notificationCenter.addObserver(
            self,
            selector: #selector(handleDeviceLock),
            name: UIApplication.willResignActiveNotification,
            object: nil
        )
    }
    
    private func unregisterNotifications() {
        NotificationCenter.default.removeObserver(self)
    }
    
    @objc
    private func handleDeviceUnlock() {
        guard hasListeners else { return }
        
        print("🔓 [DeviceUnlock] Device unlocked detected (passcode/biometrics/screen on)")
        let timestamp = Date().timeIntervalSince1970 * 1000 // milliseconds
        sendEvent(withName: "onDeviceUnlock", body: ["timestamp": timestamp])
    }
    
    @objc
    private func handleDeviceLock() {
        guard hasListeners else { return }
        
        print("🔒 [DeviceUnlock] Device locked detected (manual lock button or auto screen timeout)")
        let timestamp = Date().timeIntervalSince1970 * 1000 // milliseconds
        sendEvent(withName: "onDeviceLock", body: ["timestamp": timestamp])
    }
    
    deinit {
        unregisterNotifications()
    }
    
    @objc
    override static func requiresMainQueueSetup() -> Bool {
        return true
    }
}
