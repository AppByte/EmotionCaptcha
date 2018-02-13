//
//  ImageCaptcha.m
//  EmotionCaptcha
//
//  Created by Daniel Strebinger on 12.02.18.
//  Copyright © 2018 Daniel Strebinger. All rights reserved.
//

#import "CaptchaControl.h"

@interface CaptchaControl()
@property (strong, nonatomic) IBOutlet UIView *captchaView;
@property (strong, nonatomic) IBOutlet UIView *currentCaptchaContainer;
@property UIView<CaptchaProtocol> *currentCaptcha;

@end

@implementation CaptchaControl

-(id)initWithCoder:(NSCoder *)aDecoder {
    self = [super initWithCoder:aDecoder];
    [self configureView];
    return self;
}

- (void)encodeWithCoder:(nonnull NSCoder *)aCoder {
    [super encodeWithCoder:aCoder];
    [self configureView];
}


-(id)initWithFrame:(CGRect)frame {
    self = [super initWithFrame:frame];
    [self configureView];
    return self;
}

/**
 * Configures the captcha view.
 */
-(void)configureView {
    NSBundle *frameworkBundle = [NSBundle bundleForClass:[CaptchaControl self]];    
    [frameworkBundle loadNibNamed:NSStringFromClass([self class]) owner:self options:nil];
    [self addSubview:self.captchaView];
    [self.captchaView setFrame:self.captchaView.superview.bounds];
}

-(void)setCaptcha:(CaptchaTypes)type
{
    if (self.currentCaptcha != nil)
    {
        [self willRemoveSubview:self.currentCaptcha];
    }
    
    switch(type)
    {
        case IMAGECAPTCHA:
            self.currentCaptcha = [[ImageCaptcha alloc] initWithFrame:self.currentCaptchaContainer.bounds];
            [self.currentCaptchaContainer addSubview:self.currentCaptcha];
            break;
        case AUDIOCAPTCHA:
            break;
    }
}
@end
