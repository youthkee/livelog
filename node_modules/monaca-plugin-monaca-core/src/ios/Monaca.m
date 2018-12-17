//
//  Monaca.m
//  Monaca
//
//  Created by Shikata on 03/07/2014.
//
//

#import "Monaca.h"

@implementation Monaca

- (void)pluginInitialize
{
//    NSString* disableCookieSetting = [((CDVViewController*)self.viewController).settings objectForKey:@"monaca:disablecookie"];

//    if (disableCookieSetting != nil && ![disableCookieSetting isKindOfClass:[NSNull class]] && [disableCookieSetting isEqualToString:@"true"]) {
//        [[NSHTTPCookieStorage sharedHTTPCookieStorage] setCookieAcceptPolicy:NSHTTPCookieAcceptPolicyOnlyFromMainDocumentDomain];
//    }else{
//        [[NSHTTPCookieStorage sharedHTTPCookieStorage] setCookieAcceptPolicy:NSHTTPCookieAcceptPolicyAlways];
//    }
}

-(void)getRuntimeConfiguration:(CDVInvokedUrlCommand*)command
{
    NSString* deviceId;

    if ([[NSUserDefaults standardUserDefaults] objectForKey:@"UUID"] == nil)
    {
        CFUUIDRef uuidObj = CFUUIDCreate(nil);
        NSString *uuidString = (__bridge_transfer NSString*)CFUUIDCreateString(nil, uuidObj);
        CFRelease(uuidObj);
        [[NSUserDefaults standardUserDefaults] setObject:uuidString forKey:@"UUID"];
        [[NSUserDefaults standardUserDefaults] synchronize];
        deviceId = uuidString;
    }else{
        deviceId = [[NSUserDefaults standardUserDefaults] objectForKey:@"UUID"];
    }

    NSString* url = [((CDVViewController*)self.viewController).settings objectForKey:@"monaca:monacabackendurl"];
    NSString* backendId = [((CDVViewController*)self.viewController).settings objectForKey:@"monaca:monacabackendid"];
    NSString* apiKey = [((CDVViewController*)self.viewController).settings objectForKey:@"monaca:monacabackendapikey"];

    CDVPluginResult* result;

    NSMutableDictionary *deviceData = [NSMutableDictionary new];
    [deviceData setObject:deviceId forKey:@"deviceId"];
    if (url != nil) {
        [deviceData setObject:url forKey:@"url"];
    }
    if (backendId != nil) {
        [deviceData setObject:backendId forKey:@"backendId"];
    }
    if (apiKey != nil) {
        [deviceData setObject:apiKey forKey:@"apiKey"];
    }
    if ([self isMonacaDebugger]) {
        [deviceData setObject:@"1" forKey:@"isMonacaDebugger"];
    }

    result = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsDictionary:deviceData];
    [self.commandDelegate sendPluginResult:result callbackId:command.callbackId];
}

-(BOOL)isMonacaDebugger
{
    Class c = NSClassFromString(@"MDUtility");
    if (c != nil) {
        return YES;
    }
    return NO;
}


-(void)invokeBrowser:(CDVInvokedUrlCommand*)command
{
    if ([command.arguments isKindOfClass:[NSArray class]]
        && command.arguments.count > 0) {

        NSString *urlString = [command.arguments objectAtIndex:0];

        if (urlString) {
            [[UIApplication sharedApplication] openURL:[NSURL URLWithString:urlString]];
        }
    }
}

@end
