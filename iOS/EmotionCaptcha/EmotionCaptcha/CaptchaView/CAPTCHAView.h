//
//  CAPTCHAView.h
//  EmotionCaptcha
//
//  Created by Daniel Strebinger on 12.02.18.
//  Copyright © 2018 Daniel Strebinger. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <QuartzCore/QuartzCore.h>
#import "CaptchaProtocol.h"
#import "CaptchaTypes.h"
#import "CaptchaControl.h"

@interface CAPTCHAView : UIView
@property (strong, nonatomic) IBOutlet UIView *captchaContainerView;

@end
