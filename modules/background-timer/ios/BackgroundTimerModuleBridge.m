import Foundation

@objc(BackgroundTimerModuleBridge)
class BackgroundTimerModuleBridge: NSObject {
    
    @objc
    static func moduleName() -> String! {
        return "BackgroundTimer"
    }
    
    @objc
    static func requiresMainQueueSetup() -> Bool {
        return true
    }
}
