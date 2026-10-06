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

/* constants */
const ARCHIVE_EXTRACT_TIME = 1
const ARCHIVE_EXTRACT_PERM = 2
const ARCHIVE_EXTRACT_ACL = 4
const ARCHIVE_EXTRACT_FFLAGS = 8

const ARCHIVE_OK = 0

globalThis.unzipArchiveAtPath = function unzipArchiveAtPath(zipPath,
                                                            destinationPath)
{
    let archive = ObjC.callC("archive_read_new", []);
    if(archive == null || archive == 0)
    {
        Boot.appendVerboseLog("[USBoot:ZIP] archive_read_new() failed allocation");
        return false;
    }
    Boot.appendVerboseLog("[USBoot:ZIP] archive: 0x" + archive.toString(16));
    
    ObjC.callC("archive_read_support_format_all", [ archive ])
    ObjC.callC("archive_read_support_filter_all", [ archive ])
    
    let ext = ObjC.callC("archive_write_disk_new", []);
    if(ext == null || ext == 0)
    {
        Boot.appendVerboseLog("[USBoot:ZIP] archive_write_disk_new() failed allocation");
        ObjC.callC("archive_read_free", [ archive ]);
        return false;
    }
    Boot.appendVerboseLog("[USBoot:ZIP] ext: 0x" + ext.toString(16));
    ObjC.callC("archive_write_disk_set_options", [ ext, ARCHIVE_EXTRACT_TIME | ARCHIVE_EXTRACT_ACL | ARCHIVE_EXTRACT_FFLAGS ]);
    
    Boot.appendVerboseLog("[USBoot:ZIP] zipPath: 0x" + ext.toString(16));
    
    var ret = ObjC.callC("archive_read_open_filename", [ archive, { type: "filesystem", value: zipPath }, 10240 ]) >> 0;
    if(ret != ARCHIVE_OK)
    {
        let errorStr = ObjC.call(NSString, "stringWithCString:", [ ObjC.callC("archive_error_string", [ archive ]) ]);
        Boot.appendVerboseLog("[USBoot:ZIP] archive_read_open_filename() failed: " + errorStr + " (" + ret + ")");
        ObjC.callC("archive_read_free", [ archive ]);
        ObjC.callC("archive_write_free", [ ext ]);
        return false;
    }
    
    /* a pointer wide entry */
    let entry = ObjC.callC("archive_entry_new", []);
    if(entry == null || entry == 0)
    {
        Boot.appendVerboseLog("[USBoot:ZIP] failed to allocate pointer for libarchive entry");
        ObjC.callC("archive_read_free", [ archive ]);
        ObjC.callC("archive_write_free", [ ext ]);
        return false;
    }
    
    Boot.appendVerboseLog("[USBoot:ZIP] entry: 0x" + entry.toString(16));
    
    ret = ObjC.callC("archive_read_next_header2", [ archive, entry ]) >> 0;
    while(ret == ARCHIVE_OK)
    {
        let fullPath = ObjC.call(destinationPath, "stringByAppendingPathComponent:", [ ObjC.call(NSString, "stringWithUTF8String:", [ ObjC.callC("archive_entry_pathname", [entry]) ]) ]);
        Boot.appendVerboseLog("[USBoot:ZIP] Extracting: " + fullPath);
        
        ObjC.callC("archive_entry_set_pathname", [ entry, { type: "filesystem", value: fullPath } ]);
        ObjC.callC("archive_entry_set_perm", [ entry, 0777 ]);
        
        ret = ObjC.callC("archive_write_header", [ ext, entry ]) >> 0;
        if(ret == ARCHIVE_OK)
        {
            let bufferSize = 64 * 1024;
            let buffer = ObjC.callC("malloc", [bufferSize]);
            if(buffer == null || buffer == 0)
            {
                Boot.appendVerboseLog("[USBoot:ZIP] failed to allocate read buffer");
                ObjC.callC("archive_entry_free", [entry]);
                ObjC.callC("archive_read_free", [archive]);
                ObjC.callC("archive_write_free", [ext]);
                return false;
            }
            
            while(true)
            {
                let bytesRead = ObjC.callC("archive_read_data", [ archive, buffer, bufferSize]);
                if(bytesRead == 0)
                {
                    break;
                }
                
                if(bytesRead < 0)
                {
                    Boot.appendVerboseLog("[USBoot:ZIP] archive_read_data() failed");
                    ObjC.callC("free", [buffer]);
                    ObjC.callC("archive_entry_free", [entry]);
                    ObjC.callC("archive_read_free", [archive]);
                    ObjC.callC("archive_write_free", [ext]);
                    return false;
                }
                
                let written = ObjC.callC("archive_write_data", [ ext, buffer, bytesRead ]);
                if(written < 0)
                {
                    Boot.appendVerboseLog("[USBoot:ZIP] archive_write_data() failed");
                    ObjC.callC("free", [buffer]);
                    ObjC.callC("archive_entry_free", [entry]);
                    ObjC.callC("archive_read_free", [archive]);
                    ObjC.callC("archive_write_free", [ext]);
                    return false;
                }
            }
            
            ObjC.callC("free", [ buffer ]);
        }
        
        ret = ObjC.callC("archive_read_next_header2", [ archive, entry ]) >> 0;
    }
    
    ObjC.callC("archive_entry_free", [entry]);
    ObjC.callC("archive_read_free", [ archive ]);
    ObjC.callC("archive_write_free", [ ext ]);
    
    return true;
}
