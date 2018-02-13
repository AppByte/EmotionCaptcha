//
//  ImageCaptcha.h
//  EmotionCaptcha
//
//  Created by Daniel Strebinger on 12.02.18.
//  Copyright © 2018 Daniel Strebinger. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "CaptchaTypes.h"
#import "CaptchaProtocol.h"
#import "ImageCaptcha.h"

@interface CaptchaControl : UIView
-(void)setCaptcha:(CaptchaTypes)type;
@end
