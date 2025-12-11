#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(FocusFlowNotification, NSObject)

RCT_EXTERN_METHOD(showCompletionNotification:(NSString *)title
                  message:(NSString *)message)

RCT_EXTERN_METHOD(requestNotificationPermission:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
