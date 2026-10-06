/*
 * USBoot - UserspaceBootloader
 *
 * Manifest
 *
 */

/* ObjC classes */
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

/* Helper Functions */
function GetHomePath()
{
    let dataContainerDir = ObjC.callCReturnsObject("NSHomeDirectory", []);
    return dataContainerDir;
}

function GetDocumentsPath()
{
    return GetHomePath() + "/" + "Documents";
}

function GetBootPath()
{
    return GetDocumentsPath() + "/" + "Boot";
}

function GetROMPath()
{
    return GetBootPath() + "/" + "ROM";	/* The path were the BootROM is */
}

function GetEntryPath()
{
    return GetBootPath() + "/" + "Entry";
}

function ClearDataContainer()
{
    let path = GetDocumentsPath();
    let fileManager = ObjC.call(NSFileManager, "defaultManager", []);
    let enumerator = ObjC.call(fileManager, "enumeratorAtPath:", [ path ]);

    var sub = ObjC.call(enumerator, "nextObject", []);
    while(sub != null)
    {
        let fullPath = path + "/" + sub;
        ObjC.call(fileManager, "removeItemAtPath:error:", [ fullPath, null ]);
        sub = ObjC.call(enumerator, "nextObject", []);
    }

    let defaults = ObjC.call(NSUserDefaults, "standardUserDefaults", []);
    let bundle = ObjC.call(NSBundle, "mainBundle", []);
    let domain = ObjC.call(bundle, "bundleIdentifier", []);

    ObjC.call(defaults, "removePersistentDomainForName:", [ domain ]);
    ObjC.call(defaults, "synchronize", []);
}

function CreateBootPathStructure()
{
    let fileManager = ObjC.call(NSFileManager, "defaultManager", []);

    if(!ObjC.call(fileManager, "createDirectoryAtPath:withIntermediateDirectories:attributes:error:", [ GetROMPath(), true, null, null ]) ||
       !ObjC.call(fileManager, "createDirectoryAtPath:withIntermediateDirectories:attributes:error:", [ GetEntryPath(), true, null, null ]))
    {
        ObjC.callC("exit", [0]);
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

    var finalPath = ObjC.call(NSString, "stringWithString:", [destinationPath]);
    if(!ObjC.call(finalPath, "isAbsolutePath", []))
    {
        var fm = ObjC.call(NSFileManager, "defaultManager", []);
        var tempURL = ObjC.call(fm, "temporaryDirectory", []);
        var tempPath = ObjC.call(tempURL, "path", []);
        finalPath = ObjC.call(tempPath, "stringByAppendingPathComponent:", [finalPath]);
    }

    var data = ObjC.call(NSData, "dataWithContentsOfURL:", [ url ]);
    if(data == null)
    {
        return false;
    }

    var ok = ObjC.call(data, "writeToFile:atomically:", [ finalPath, true ]);
    return !!ok;
}

function InstallROM()
{
    let romPath = GetROMPath();
    if(!downloadFile("https://emexlabs.org/bootstrap/JEFI.js", romPath + "/JEFI.js") ||
       !downloadFile("https://emexlabs.org/bootstrap/LoaderUI.js", romPath + "/LoaderUI.js") ||
       !downloadFile("https://emexlabs.org/bootstrap/ZIP.js", romPath + "/ZIP.js"))
    {
        ObjC.callC("exit", [0]);
        return;
    }
}

function readTextFile(path)
{
    let text = ObjC.call(NSString, "stringWithContentsOfFile:encoding:error:", [ path, 4, null ]);
    if(text == null)
    {
        throw new Error("Could not read file: " + path);
    }
    return String(text);
}

function includeFromROM(path)
{
    let romPath = ObjC.callCReturnsObject("NSHomeDirectory", []) + "/Documents/Boot/ROM";
    let source = readTextFile(romPath + "/" + path);
    return eval(source);
}

function IndicateInstalled()
{
    var fm = ObjC.call(NSFileManager, "defaultManager", []);
    ObjC.call(fm, "createFileAtPath:contents:attributes:", [ GetDocumentsPath() + "/manifest", null, null ]);
}

/* Performing Restore */
ClearDataContainer();
CreateBootPathStructure();
InstallROM();
IndicateInstalled();
includeFromROM("JEFI.js");
