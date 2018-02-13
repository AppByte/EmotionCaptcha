//
//  CAPTCHAView.m
//  EmotionCaptcha
//
//  Created by Daniel Strebinger on 12.02.18.
//  Copyright © 2018 Daniel Strebinger. All rights reserved.
//

#import "CAPTCHAView.h"

@interface CAPTCHAView()
@property (strong, nonatomic) IBOutlet UIView *captchaView;
@property CaptchaTypes currentCaptchaType;
@property UIView<CaptchaProtocol> *currentCaptcha;
@end

@implementation CAPTCHAView

-(id)initWithCoder:(NSCoder *)aDecoder
{
    self = [super initWithCoder:aDecoder];
    NSLog(@"%@", NSStringFromCGRect(self.frame));
    [self configureView];
    return self;
}

-(id)initWithFrame:(CGRect)frame {
    NSLog(@"%@", NSStringFromCGRect(self.frame));
    self = [super initWithFrame:frame];
    [self configureView];
    return self;
}

-(id)initWith:(CaptchaTypes)type
{
    self = [super init];
    self.currentCaptchaType = type;
    [self configureView];
    return self;
}

/**
 * Configures the captcha view.
 */
-(void)configureView {
    
    NSBundle *frameworkBundle = [NSBundle bundleForClass:[ImageCaptcha self]];
    UIImageView *backgroundView = [[UIImageView alloc] initWithImage:[UIImage imageNamed:@"beach-tracks_b.jpg" inBundle:frameworkBundle compatibleWithTraitCollection:nil]];
    [self addSubview:backgroundView];
    [frameworkBundle loadNibNamed:NSStringFromClass([self class]) owner:self options:nil];
    [self addSubview:self.captchaView];
    self.captchaView.clipsToBounds = true;
    self.captchaContainerView.layer.borderColor = [UIColor grayColor].CGColor;
    self.captchaContainerView.layer.borderWidth = 0.9f;
    self.captchaContainerView.layer.cornerRadius = 13;
    
    if (self.currentCaptchaType == nil)
    {
        self.currentCaptchaType = IMAGECAPTCHA;
    }
    
    switch (self.currentCaptchaType) {
        case IMAGECAPTCHA:
            self.currentCaptcha = [[ImageCaptcha alloc] initWithFrame:self.bounds];
            [self.captchaContainerView addSubview:self.currentCaptcha];
            break;
        default:
            break;
    }
}

@end
