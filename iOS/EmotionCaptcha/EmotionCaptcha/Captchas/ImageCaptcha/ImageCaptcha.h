//
//  ImageCaptcha.h
//  EmotionCaptcha
//
//  Created by Daniel Strebinger on 12.02.18.
//  Copyright © 2018 Daniel Strebinger. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "CaptchaProtocol.h"

@interface ImageCaptcha : UIView <CaptchaProtocol, UICollectionViewDataSource, UICollectionViewDelegate>
@property (strong, nonatomic) IBOutlet UIView *captchaView;
@property (strong, nonatomic) IBOutlet UICollectionViewFlowLayout *collectionViewFlowLayout;
@property (strong, nonatomic) IBOutlet UICollectionView *collectionView;
@end
