#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(BackgroundTimer, NSObject)

RCT_EXTERN_METHOD(scheduleTimerCheck:(double)endTimeMillis
                  durationMinutes:(NSInteger)durationMinutes
                  sessionId:(NSInteger)sessionId)

RCT_EXTERN_METHOD(cancelTimerCheck)

@end
