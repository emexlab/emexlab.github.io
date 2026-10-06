/*
 SPDX-License-Identifier: AGPL-3.0-or-later

 Copyright (C) 2026 emexlab

 This file is part of NyxianLoader.

 NyxianLoader is free software: you can redistribute it and/or modify
 it under the terms of the GNU Affero General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 NyxianLoader is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 GNU Affero General Public License for more details.

 You should have received a copy of the GNU Affero General Public License
 along with Nyxian. If not, see <https://www.gnu.org/licenses/>.
*/

//
// ObjC Classes
//
const NSString = ObjC.getClass("NSString");
const NSProcessInfo = ObjC.getClass("NSProcessInfo");
const UIDevice = ObjC.getClass("UIDevice");
const NSBundle = ObjC.getClass("NSBundle");
const UIViewController = ObjC.getClass("UIViewController");
const UILabel = ObjC.getClass("UILabel");
const UIColor = ObjC.getClass("UIColor");
const UIApplication = ObjC.getClass("UIApplication");
const NSURL = ObjC.getClass("NSURL");
const NSData = ObjC.getClass("NSData");
const NSFileManager = ObjC.getClass("NSFileManager");
const NSUserDefaults = ObjC.getClass("NSUserDefaults");
const LPUtils = ObjC.getClass("LPUtils");
const UIWindow = ObjC.getClass("UIWindow");

//
// Firmware Loader
//
function readTextFile(path)
{
    let text = ObjC.call(NSString, "stringWithContentsOfFile:encoding:error:", [ path, 4, null ]);
    if(text == null)
    {
        throw new Error("Could not read file: " + path);
    }
    return String(text);
}

function includeFromBundleResources(path)
{
    var mainBundle = ObjC.call(NSBundle, "mainBundle", []);
    var bundlePath = ObjC.call(mainBundle, "bundlePath", []);
    var source = readTextFile(bundlePath + "/" + path);
    return eval(source);
}

function includeFromROM(path)
{
    let romPath = ObjC.callCReturnsObject("NSHomeDirectory", []) + "/Documents/Boot/ROM";
    let source = readTextFile(romPath + "/" + path);
    return eval(source);
}

//
// Dependencies
//
includeFromROM("LoaderUI.js");
includeFromROM("ZIP.js");

//
// Global
//
var loaderUI = new LoaderUIViewController();
var recoveryUI = null;

/* compatibility stub for the old API */
class Boot {
    static appendVerboseLog(str)
    {
        loaderUI.appendLog(str);
    }
}

function downloadFile(url, destinationPath)
{
    if(typeof(url) === "string")
    {
        url = ObjC.call(NSURL, "URLWithString:", [url]);
    }

    if(url == null)
    {
        return false;
    }

    let fm = ObjC.call(NSFileManager, "defaultManager", []);
    let finalPath = ObjC.call(NSString, "stringWithString:", [destinationPath]);

    if(!ObjC.call(finalPath, "isAbsolutePath", []))
    {
        let tempURL = ObjC.call(fm, "temporaryDirectory", []);
        let tempPath = ObjC.call(tempURL, "path", []);

        finalPath = ObjC.call(tempPath, "stringByAppendingPathComponent:", [finalPath]);
    }

    let parentPath = ObjC.call(finalPath, "stringByDeletingLastPathComponent", []);
    let created = ObjC.call(fm, "createDirectoryAtPath:withIntermediateDirectories:attributes:error:", [parentPath, true, null, null]);
    if(!created)
    {
        ObjC.callC("NSLog", ["failed to create parent directory: " + parentPath]);
        return false;
    }

    let data = ObjC.call(NSData, "dataWithContentsOfURL:", [url]);
    if(data == null)
    {
        return false;
    }

    var ok = ObjC.call(data, "writeToFile:atomically:", [finalPath, true]);
    return !!ok;
}

function extractPayloadIPA()
{
    var fm = ObjC.call(NSFileManager, "defaultManager", []);
    var tempPath = ObjC.callCReturnsObject("NSTemporaryDirectory", []);
    var ipaPath = ObjC.call(tempPath, "stringByAppendingPathComponent:", ["Payload.ipa"]);
    var destinationPath = ObjC.call(tempPath, "stringByAppendingPathComponent:", ["Payload"]);

    ObjC.call(fm, "removeItemAtPath:error:", [ destinationPath, null ]);
    if(!ObjC.call(fm, "createDirectoryAtPath:withIntermediateDirectories:attributes:error:", [ destinationPath, true, null, null ]))
    {
        loaderUI.appendLog("[USBoot] Failed to create destination path for extractions");
        return;
    }

    if(!ObjC.call(fm, "fileExistsAtPath:", [ ipaPath ]))
    {
        loaderUI.appendLog("[USBoot] Assets missing");
        return;
    }

    loaderUI.appendLog("[USBoot] IPA:" + ipaPath);
    loaderUI.appendLog("[USBoot] Extracting to: " + destinationPath);

    return unzipArchiveAtPath(ipaPath, destinationPath);;
}

function findAppInPayload()
{
    var fm = ObjC.call(NSFileManager, "defaultManager", []);
    var tempPath = ObjC.callCReturnsObject("NSTemporaryDirectory", []);
    var payloadPath = ObjC.call(tempPath, "stringByAppendingPathComponent:", ["Payload/Payload"]);

    loaderUI.appendLog("[USBoot] payload path: " + payloadPath);

    var contents = ObjC.call(fm, "contentsOfDirectoryAtPath:error:", [ payloadPath, null ]);

    for(var i = 0; i < contents.length; i++)
    {
        if(contents[i].endsWith(".app"))
        {
            return payloadPath + "/" + contents[i];
        }
    }

    return null;
}

function JEFIRestartSelf()
{
    var workspace = $send($class("LSApplicationWorkspace"), "defaultWorkspace");
    var config = $send($send($class("_LSOpenConfiguration"), "alloc"), "init");
    var bundleID = $send($send($class("NSBundle"), "mainBundle"), "bundleIdentifier");

    var completionBlock = $block(["void", "bool", "id"], function(success, error) {
        ObjC.callC("ptrace", [31, 0, 0, 0]);
        ObjC.callC("raise", [9]);
    });

    for(var i = 0; i < 2; i++)
    {
        ObjC.callOnMain(workspace, "openApplicationWithBundleIdentifier:configuration:completionHandler:",  [bundleID, config, completionBlock]);
    }
}

function JEFIShutdownSelf()
{
    let sharedApplication = ObjC.callOnMain(UIApplication, "sharedApplication", []);
    ObjC.callOnMain(sharedApplication, "suspend", []);
    ObjC.callC("exit", [0]);
}

function LCHasCertificate()
{
    var defaults = $send($class("NSUserDefaults"), "standardUserDefaults");
    var data = $send(defaults, "objectForKey:", "LCCertificateData");
    var password = $send(defaults, "objectForKey:", "LCCertificatePassword");

    loaderUI.appendLog("[USBoot] code signature data: " + data);
    loaderUI.appendLog("[USBoot] code signature password: " + ((password == null) ? password : "<obfucated>"));

    return data != null && password != null;
}

function JumpIntoIt(application)
{
    let fm = ObjC.call(NSFileManager, "defaultManager", []);
    if(!ObjC.call(fm, "fileExistsAtPath:", [application]))
    {
        return false;
    }

    loaderUI.appendLog("[USBoot] loading bootentry");

    let dylib = application + "/Frameworks/bootentry.dylib";
    var handle = ObjC.callC("dlopen", [ { type: "filesystem", value: dylib }, 10 ]);
    if(handle == null || handle === 0)
    {
        loaderUI.appendLog("[USBoot] handle: 0x" + handle.toString(16));
        loaderUI.appendLog("[USBoot] path: " + dylib);
        loaderUI.appendLog("[USBoot] dlopen err: " + ObjC.callC("dlerror", []));
        loaderUI.showNoSignWithSubtitle("Failed to load bootentry executable.");
        return null;
    }

    /* so people can again flawlessly change the volume */
    ObjC.call(ObjC.getClass("NXVolumeChangeScanner"), "disarm", []);

    return true;
}

function showPasswordAlert(parentVC, title, message, onPasswordEntered)
{
    /* need those classes */
    let UIAlertController = $class("UIAlertController");
    let UIAlertAction = $class("UIAlertAction");

    let alert = ObjC.callOnMain(UIAlertController, "alertControllerWithTitle:message:preferredStyle:", [title, message, 1]);
    var configBlock = $block(["void", "id"], function(textField) {
        $send(textField, "setSecureTextEntry:", true);
        $send(textField, "setPlaceholder:", "Password");
    });

    ObjC.callOnMain(alert, "addTextFieldWithConfigurationHandler:", [configBlock]);

    /* callback blocks */
    var okBlock = $block(["void", "id"], function(action) {
        var textFields = $send(alert, "textFields");
        var textField = $send(textFields, "firstObject");
        var password = $send(textField, "text");

        if(typeof onPasswordEntered === "function")
        {
            onPasswordEntered(String(password));
        }
    });

    /* actions */
    var okAction = ObjC.callOnMain(UIAlertAction, "actionWithTitle:style:handler:", ["OK", 0, okBlock]);
    var cancelAction = ObjC.callOnMain(UIAlertAction, "actionWithTitle:style:handler:", ["Cancel", 1, null]);

    /* presentation  */
    ObjC.callOnMain(alert, "addAction:", [okAction]);
    ObjC.callOnMain(alert, "addAction:", [cancelAction]);
    ObjC.callOnMain(parentVC, "presentViewController:animated:completion:", [alert, true, null]);
}

function showMainRecoveryMenu(c)
{
    c.setRecoveryHeader("USBoot Recovery\nUSBoot 1.0");
    c.setRecoveryItems([
        { title: "Reboot system now",
          onSelect: function(c){
            JEFIRestartSelf();
          }
        },
        { title: "Import code signature",
          onSelect: function(c){
              c.browseRecovery(ObjC.callCReturnsObject("NSHomeDirectory", []), {
                  root: ObjC.callCReturnsObject("NSHomeDirectory", []),
                  header: "USBoot Files",
                  onBack: showMainRecoveryMenu,
                  onFile: function(path, name, c){
                      c.setRecoveryHeader("File\n" + name);
                      c.setRecoveryItems([
                          { title: "<< Back",
                            onSelect: function(cc){
                                cc.browseRecovery(cc._fmParent(path), cc._fmOptions);
                            }
                          },
                          { title: "Import as .p12 certificate",
                            onSelect: function(cc){
                                var fm = ObjC.call($class("NSFileManager"), "defaultManager", []);
                                showPasswordAlert(loaderUI._vc, "Importing Certificate", "The password is required to import a .p12 certificate.", function(password) {
                                    cc.recoveryLog("Password passed: \"" + password + "\" for file at " + path);

                                    let url = ObjC.call(NSURL, "fileURLWithPath:", [path]);
                                    let data = ObjC.call(NSData, "dataWithContentsOfURL:options:error:", [url, 0, null]);
                                    if(!data)
                                    {
                                        cc.recoveryLog("ERROR: Failed to read the data of file at " + path, "error");
                                        return;
                                    }
                                    else
                                    {
                                        cc.recoveryLog("Got data object " + data + " of file at " + path);
                                    }

                                    let validateBlock = $block(["void", "int", "id"], function(status, someWords) {
                                        if(status == 0)
                                        {
                                            $set(LPUtils, {
                                                certificateData: data,
                                                certificatePassword: password,
                                            });
                                            cc.recoveryLog("Successfully imported certificate at " + path);
                                        }
                                        else
                                        {
                                            cc.recoveryLog("ERROR: Failed to import certificate at " + path + ": " + someWords + " (" + status + ")", "error");
                                        }
                                    });

                                    ObjC.call(LPUtils, "validateCertificateWithCertificateData:withPassword:WithCompletionHandler:", [ data, password, validateBlock ]);
                                });
                            }
                          },
                          { title: "Delete",
                            onSelect: function(cc){
                                var fm = ObjC.call($class("NSFileManager"), "defaultManager", []);
                                ObjC.call(fm, "removeItemAtPath:error:", [ path, null ]);
                                cc.browseRecovery(cc._fmParent(path), cc._fmOptions);
                            }
                          },
                      ]);
                  }
              });
          }
        },
        { title: "Wipe data / factory reset",
          onSelect: function(c){
              let fm = ObjC.call(NSFileManager, "defaultManager", []);
              if(ObjC.call(fm, "removeItemAtPath:error:", [ ObjC.callCReturnsObject("NSHomeDirectory", []) + "/Documents/manifest", null ]))
              {
                  c.recoveryLog("Removed manifest (next reboot manifest will be redownloaded and restrapped)");
              }
              else
              {
                  c.recoveryLog("ERROR: Failed to remove manifest", "error");
              }
          }
        },
        { title: "USBoot Files",
          onSelect: function(c){
              c.browseRecovery(ObjC.callCReturnsObject("NSHomeDirectory", []), {
                  root: ObjC.callCReturnsObject("NSHomeDirectory", []),
                  header: "USBoot Files",
                  onBack: showMainRecoveryMenu,
                  onFile: function(path, name, c){
                      c.setRecoveryHeader("File\n" + name);
                      c.setRecoveryItems([
                          { title: "<< Back",
                            onSelect: function(cc){
                                cc.browseRecovery(cc._fmParent(path), cc._fmOptions);
                            }
                          },
                          { title: "Delete",
                            onSelect: function(cc){
                                var fm = ObjC.call($class("NSFileManager"), "defaultManager", []);
                                ObjC.call(fm, "removeItemAtPath:error:", [ path, null ]);
                                cc.browseRecovery(cc._fmParent(path), cc._fmOptions);
                            }
                          },
                      ]);
                  }
              });
          }
        },
        { title: "System Files",
          onSelect: function(c){
              c.browseRecovery("/", {
                  root: "/",
                  header: "System Files",
                  onBack: showMainRecoveryMenu,
                  onFile: function(path, name, c){
                      c.setRecoveryHeader("File\n" + name);
                      c.setRecoveryItems([
                          { title: "<< Back",
                            onSelect: function(cc){
                                cc.browseRecovery(cc._fmParent(path), cc._fmOptions);
                            }
                          },
                          { title: "Delete",
                            onSelect: function(cc){
                                var fm = ObjC.call($class("NSFileManager"), "defaultManager", []);
                                ObjC.call(fm, "removeItemAtPath:error:", [ path, null ]);
                                cc.browseRecovery(cc._fmParent(path), cc._fmOptions);
                            }
                          },
                      ]);
                  }
              });
          }
        },
        { title: "Power off",
          onSelect: function(c){
              JEFIShutdownSelf();
          }
        },
    ]);
}

//
// Firmware Setup
//
function main()
{
    let app = ObjC.callOnMain(UIApplication, "sharedApplication", []);
    let connectedScenes = ObjC.callOnMain(app, "connectedScenes", []);
    let scene = ObjC.callOnMain(connectedScenes, "anyObject", []);
    let window = ObjC.callOnMain(ObjC.callOnMain(UIWindow, "alloc", []), "initWithWindowScene:", [scene]);

    let subclass = ObjC.callCReturnsObject("objc_allocateClassPair", [ UIViewController, "ARBHiddenStatusVC", 0 ]);
    let getppidIMP = ObjC.callC("dlsym", [ -2, { type: "cStr", value: "getppid" } ]);
    let prefersStatusBarHiddenSEL = ObjC.callC("sel_registerName", [ { type: "cStr", value: "prefersStatusBarHidden" } ]);
    let prefersInterfaceOrientationLockedSEL = ObjC.callC("sel_registerName", [ { type: "cStr", value: "prefersInterfaceOrientationLocked" } ]);
    ObjC.callC("class_addMethod", [ subclass, prefersStatusBarHiddenSEL, getppidIMP, { type: "cStr", value: "B@:" } ]);
    ObjC.callC("class_addMethod", [ subclass, prefersInterfaceOrientationLockedSEL, getppidIMP, { type: "cStr", value: "B@:" } ]);
    ObjC.callC("objc_registerClassPair", [ subclass ]);

    let rootVC = ObjC.callOnMain(subclass, "new", []);
    $set(window, {
        rootViewController: rootVC
    });
    ObjC.callOnMain(window, "makeKeyAndVisible", []);

    loaderUI.putAlive(false);
    loaderUI.mount(rootVC);

    var mode = Number(ObjC.call(ObjC.getClass("NXVolumeChangeScanner"), "scanFor:", [1.5]));
    if(mode == 2)
    {
        loaderUI.enterRecovery({});
        showMainRecoveryMenu(loaderUI);
        return;
    }

    if(mode == 1)
    {
        loaderUI.setVerbose(mode == 1);
    }
    else
    {
        loaderUI.putAlive(true);
    }
    let verbose = mode == 1;
    loaderUI.setVerbose(verbose);

    if(verbose)
    {
        loaderUI.appendLog("USBoot Version 1.0");
        loaderUI.appendLog(" ");
        loaderUI.appendLog("   |\\__/,|   (`\\");
        loaderUI.appendLog(" _.|o o  |_   ) )");
        loaderUI.appendLog("-(((---(((--------");
        loaderUI.appendLog(" ");
        loaderUI.appendLog("(c) emexLabs 2026");
        loaderUI.appendLog(" ");

        ObjC.callC("sleep", [3]);
    }

    loaderUI.appendLog("[USBoot] app: " + app);
    loaderUI.appendLog("[USBoot] connectedScenes: " + connectedScenes);
    loaderUI.appendLog("[USBoot] scene: " + scene);
    loaderUI.appendLog("[USBoot] window: " + window);
    loaderUI.appendLog("[USBoot] rootVC: " + rootVC);

    /* Checking for code signature presence */
    if(!LCHasCertificate())
    {
        loaderUI.appendLog("[USBoot] code signature missing");
        loaderUI.showNoSignWithSubtitle("No code signature is present please reopen the app while holding VolumeDOWN to enter Recovery Mode.");
        return;
    }

    /* TODO: Resign and validate somehow */
    let ret = JumpIntoIt(ObjC.callCReturnsObject("NSHomeDirectory", []) + "/Documents/Boot/Entry/Nyxian.app");
    if(ret == true || ret == null)
    {
        return;
    }

    loaderUI.setSubtitle("Downloading Assets…");
    loaderUI.setProgressPercent(5);

    loaderUI.appendLog("[USBoot] downloading missing firmware");
    if(!downloadFile("https://emexlabs.org/bootstrap/Nyxian_0.11.5_3.ipa", "Payload.ipa"))
    {
        loaderUI.appendLog("[USBoot] downloading assets failed");
        loaderUI.showNoSignWithSubtitle("Failed to download assets. Check your network connection.");
        return;
    }
    else
    {
        loaderUI.appendLog("[USBoot] downloaded firmware");
    }

    loaderUI.setSubtitle("Extracting Assets…");
    loaderUI.setProgressPercent(10);

    loaderUI.appendLog("[USBoot] extracting firmware");
    if(!extractPayloadIPA())
    {
        loaderUI.appendLog("[USBoot] extracting assets failed");
        loaderUI.showNoSignWithSubtitle("Failed to extract assets.");
        return;
    }
    else
    {
        loaderUI.appendLog("[USBoot] extracted firmware");
    }

    /* gotta resign Nyxian */
    loaderUI.appendLog("[USBoot] searching for firmware");
    loaderUI.setSubtitle("Signing Assets…");
    loaderUI.setProgressPercent(15);

    var application = findAppInPayload();
    if(application != null)
    {
        loaderUI.appendLog("[USBoot] signing firmware");
        loaderUI.appendLog("[USBoot] application path: " + application);
        if(!ObjC.call(LPUtils, "signAppBundleWithZSign:", [ ObjC.call(NSURL, "fileURLWithPath:", [ application ]) ]))
        {
            loaderUI.appendLog("[USBoot] failed to sign application bundle");
            loaderUI.showNoSignWithSubtitle("Failed to sign Assets.");
            return;
        }
        else
        {
            loaderUI.appendLog("[USBoot] signed firmware");

            /* basically the initial install */
            let applicationLastPathComponent = ObjC.call(application, "lastPathComponent", []);
            let newApplicationPath = ObjC.callCReturnsObject("NSHomeDirectory", []) + "/Documents/Boot/Entry/" + applicationLastPathComponent;
            let fm = ObjC.call(NSFileManager, "defaultManager", []);
            if(!ObjC.call(fm, "moveItemAtPath:toPath:error:", [ application, ObjC.callCReturnsObject("NSHomeDirectory", []) + "/Documents/Boot/Entry/" + applicationLastPathComponent, null ]))
            {
                loaderUI.showNoSignWithSubtitle("Failed to install Assets.");
                return;
            }
            application = newApplicationPath;

            loaderUI.setSubtitle("Loading Bootentry…");
            loaderUI.setProgressPercent(25);

            JumpIntoIt(newApplicationPath);

            /* don't touch loder UI after this point */
        }
    }
}

main();
