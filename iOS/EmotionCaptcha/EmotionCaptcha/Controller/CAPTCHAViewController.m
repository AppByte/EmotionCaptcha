//
//  CAPTCHAViewController.m
//  EmotionCaptcha
//
//  Created by Daniel Strebinger on 13.02.18.
//  Copyright © 2018 Daniel Strebinger. All rights reserved.
//

#import "CAPTCHAViewController.h"

@interface CAPTCHAViewController ()
@property (nonatomic, strong) CAPTCHAView *captchaView;
@end

@implementation CAPTCHAViewController

- (void)viewDidLoad {
    [super viewDidLoad];
    
    UINavigationItem* navItem = [[UINavigationItem alloc] initWithTitle:@"CAPTCHA"];
    UIBarButtonItem* cancelBtn = [[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemCancel target:self action:@selector(onTapCancel:)];
    navItem.leftBarButtonItem = cancelBtn;
    UIBarButtonItem* doneBtn = [[UIBarButtonItem alloc] initWithBarButtonSystemItem:UIBarButtonSystemItemDone target:self action:@selector(onTapDone:)];
    navItem.rightBarButtonItem = doneBtn;
    [self.navigationController.navigationBar setItems:@[navItem]];
    
    self.captchaView = [[CAPTCHAView alloc] init];
    [self.view addSubview:self.captchaView];
    [self.captchaView setFrame:self.view.bounds];
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
    // Dispose of any resources that can be recreated.
}

/*
#pragma mark - Navigation

// In a storyboard-based application, you will often want to do a little preparation before navigation
- (void)prepareForSegue:(UIStoryboardSegue *)segue sender:(id)sender {
    // Get the new view controller using [segue destinationViewController].
    // Pass the selected object to the new view controller.
}
*/

@end
