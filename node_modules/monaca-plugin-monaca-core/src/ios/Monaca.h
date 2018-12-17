//
//  Monaca.h
//  Monaca
//
//  Created by Shikata on 03/07/2014.
//
//

#import <Cordova/CDV.h>

@interface Monaca : CDVPlugin

-(void)getRuntimeConfiguration:(CDVInvokedUrlCommand*)command;
-(void)invokeBrowser:(CDVInvokedUrlCommand*)command;

@end
