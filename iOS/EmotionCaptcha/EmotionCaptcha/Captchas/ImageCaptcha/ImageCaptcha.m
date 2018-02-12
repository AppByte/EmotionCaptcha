//
//  ImageCaptcha.m
//  EmotionCaptcha
//
//  Created by Daniel Strebinger on 12.02.18.
//  Copyright © 2018 Daniel Strebinger. All rights reserved.
//

#import "ImageCaptcha.h"

@implementation ImageCaptcha

-(id)initWithCoder:(NSCoder *)aDecoder {
    self = [super initWithCoder:aDecoder];
    [self configureView];
    return self;
}

- (void)encodeWithCoder:(nonnull NSCoder *)aCoder {
    [super encodeWithCoder:aCoder];
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
    [[NSBundle bundleForClass:[ImageCaptcha self]] loadNibNamed:NSStringFromClass([self class]) owner:self options:nil];
    [self addSubview:self.captchaView];
    [self.captchaView setFrame:self.frame];
    self.collectionView.frame = CGRectMake(35, 150, 345, 345);
    self.collectionView.scrollEnabled = false;
    [self.collectionView registerNib:[UINib nibWithNibName:@"ImageCaptchaCell" bundle:[NSBundle bundleForClass:[ImageCaptcha self]]] forCellWithReuseIdentifier:@"Cell"];
    [self.collectionViewFlowLayout  setItemSize:CGSizeMake(170, 170)];
}

- (NSInteger)numberOfItemsInSection:(NSInteger)section
{
    return 1;
}

-(NSInteger)collectionView:(UICollectionView *)collectionView numberOfItemsInSection:(NSInteger)section
{
    return 4;
}

- (nonnull __kindof UICollectionViewCell *)collectionView:(nonnull UICollectionView *)collectionView cellForItemAtIndexPath:(nonnull NSIndexPath *)indexPath {
    UICollectionViewCell *cell = [self.collectionView dequeueReusableCellWithReuseIdentifier:@"Cell" forIndexPath:indexPath];
    return cell;
}
@end
