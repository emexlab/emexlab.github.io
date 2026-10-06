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

/*
 * ObjC bridge helper
 */
globalThis.$class = function $class(name)
{
    return ObjC.getClass(name);
}

globalThis.$send = function $send(target, selector, argument)
{
    if(target == null)
    {
        return null;
    }

    return ObjC.callOnMain(target, selector, argument === undefined ? [] : [argument]);
}

globalThis.$get = function $get(object, key)
{
    return $send(object, "valueForKey:", key);
}

globalThis.$set = function $set(object, values)
{
    return $send(object, "setValuesForKeysWithDictionary:", values);
}

globalThis.$anchor = function $anchor(view, name)
{
    return $send(view, name);
}

globalThis.$constraintWithPriority = function $constraintWithPriority(anchorA, selector, anchorB, constant, priority)
{
    var c = $send(anchorA, selector, anchorB); // created inactive
    if(c == null) return null;
    $set(c, { constant: constant, priority: priority });
    $set(c, { active: true });
    return c;
}

globalThis.$block = function $block(signature, callback)
{
    if(!Array.isArray(signature) || typeof callback !== "function")
    {
        return null;
    }
    return FFI.createObjCBlock(signature, callback);
};

globalThis.$onVolumeButton = function(callback)
{
    if(typeof callback !== "function")
    {
        ObjC.call($class("NXVolumeChangeScanner"), "setButtonHandler:", [null]);
        return;
    }

    let handlerBlock = $block(["void", "id"], function(info) {
        callback(info);
    });

    ObjC.call($class("NXVolumeChangeScanner"), "setButtonHandler:", [handlerBlock]);
};

/*
 * Autolayout helper
 */
globalThis.$constraint = function $constraint(anchorA, selector, anchorB, constant)
{
    var constraint = $send(anchorA, selector, anchorB);
    if(constraint == null)
    {
        return null;
    }
    
    var values = {
        active: true
    };
    
    if(constant !== undefined)
    {
        values.constant = constant;
    }
    
    $set(constraint, values);
    
    return constraint;
}

globalThis.$equal = function $equal(a, b, constant)
{
    return $constraint(a, "constraintEqualToAnchor:", b, constant);
}

globalThis.$gte = function $gte(a, b, constant)
{
    return $constraint(a, "constraintGreaterThanOrEqualToAnchor:", b, constant);
}

globalThis.$lte = function $lte(a, b, constant)
{
    return $constraint(a, "constraintLessThanOrEqualToAnchor:", b, constant);
}

globalThis.$makeZeroReference = function $makeZeroReference(parent)
{
    var UIView = $class("UIView");
    
    var zero = $send(UIView, "new");
    
    $set(zero, {
        translatesAutoresizingMaskIntoConstraints: false,
        hidden: true,
        userInteractionEnabled: false
    });
    
    $send(parent, "addSubview:", zero);
    
    $equal(
        $anchor(zero, "leadingAnchor"),
        $anchor(parent, "leadingAnchor"),
        0
    );
    
    $equal(
        $anchor(zero, "trailingAnchor"),
        $anchor(parent, "leadingAnchor"),
        0
    );
    
    $equal(
        $anchor(zero, "topAnchor"),
        $anchor(parent, "topAnchor"),
        0
    );
    
    $equal(
        $anchor(zero, "bottomAnchor"),
        $anchor(parent, "topAnchor"),
        0
    );
    
    return zero;
}


/*
 * LoaderUIViewController
 */
globalThis.LoaderUIViewController = class LoaderUIViewController
{
    constructor()
    {
        this._vc = null;
        this.view = null;
        this._logoView = null;
        this._progressView = null;
        this._subtitleLabel = null;
        this._logView = null;
        this._logLines = [];
        this._zeroReference = null;
        this._loaded = false;
        this.createNativeController();
        this.viewDidLoad();
    }
    
    createNativeController()
    {
        var UIViewController = $class("UIViewController");
        this._vc = $send(UIViewController, "new");
        this.view = $send(this._vc, "view");
    }
    
    get nativeViewController()
    {
        return this._vc;
    }

    viewDidLoad()
    {
        if(this._loaded)
        {
            return;
        }
        
        this._loaded = true;
        
        var UIColor = $class("UIColor");
        
        var background = $send(UIColor, "systemBackgroundColor");
        $set(this.view, {
            backgroundColor: background
        });
        
        this._zeroReference = $makeZeroReference(this.view);
        
        this.createLogo();
        this.createProgressView();
        this.createSubtitle();
        this.createLogView();
        
        this.configureFonts();
        this.installConstraints();
    }
    
    createLogo()
    {
        var UIImage = $class("UIImage");
        var UIImageView = $class("UIImageView");
        
        var logo = $send(UIImage, "imageNamed:", "EmexLogo");
        var imageView = $send(UIImageView, "alloc");
        
        imageView = $send(imageView, "initWithImage:", logo);
        
        this._logoView = imageView;
        
        $set(this._logoView, {
            translatesAutoresizingMaskIntoConstraints: false,
            contentMode: 1
        });
        
        $send(this.view, "addSubview:", this._logoView);
    }
    
    createProgressView()
    {
        var UIProgressView = $class("UIProgressView");
        var UIColor = $class("UIColor");

        this._progressView = $send(UIProgressView, "new");
        var labelColor = $send(UIColor, "labelColor");
        var trackColor = $send(UIColor, "systemGray3Color");

        $set(this._progressView, {
            translatesAutoresizingMaskIntoConstraints: false,
            progress: 0.0,
            progressTintColor: labelColor,
            trackTintColor: trackColor,
            tag: 0x4E590001
        });

        // stretch UIKit's built-in progress animation (~3x longer)
        var layer = $send(this._progressView, "layer");
        if(layer != null)
        {
            $set(layer, { speed: 0.35 });
        }

        $send(this.view, "addSubview:", this._progressView);
    }
    
    createSubtitle()
    {
        var UILabel = $class("UILabel");
        var UIColor = $class("UIColor");
        
        this._subtitleLabel = $send(UILabel, "new");
        
        var labelColor = $send(UIColor, "labelColor");
        
        $set(this._subtitleLabel, {
            translatesAutoresizingMaskIntoConstraints: false,
            numberOfLines: 0,
            textAlignment: 1,
            textColor: labelColor,
            text: "",
            tag: 0x4E590002,
        });
        
        $send(this.view, "addSubview:", this._subtitleLabel);
    }
    
    createLogView()
    {
        var UIView  = $class("UIView");
        var UILabel = $class("UILabel");
        var UIColor = $class("UIColor");

        this._logContainer = $send(UIView, "new");
        $set(this._logContainer, {
            translatesAutoresizingMaskIntoConstraints: false,
            clipsToBounds: true,
            userInteractionEnabled: false,
            backgroundColor: $send(UIColor, "clearColor"),
            hidden: true,
        });

        // blend the whole clipped group against what's behind it
        var containerLayer = $send(this._logContainer, "layer");
        if(containerLayer != null)
        {
            $set(containerLayer, { compositingFilter: "differenceBlendMode" });
        }

        $send(this.view, "addSubview:", this._logContainer);

        this._logView = $send(UILabel, "new");
        $set(this._logView, {
            translatesAutoresizingMaskIntoConstraints: false,
            numberOfLines: 0,
            lineBreakMode: 1,
            textAlignment: 0,
            backgroundColor: $send(UIColor, "clearColor"),
            textColor: $send(UIColor, "whiteColor"),
            text: "",
            tag: 0x4E590003,
        });

        ObjC.callOnMain(this._logView,
            "setContentCompressionResistancePriority:forAxis:", [1000, 1]);

        $send(this._logContainer, "addSubview:", this._logView);
    }
    
    configureFonts()
    {
        var UIFont = $class("UIFont");
        var subtitleFont = ObjC.callOnMain(
            UIFont,
            "systemFontOfSize:weight:",
            [
                13.0,
                0.4
            ]
        );
        
        var logFont = ObjC.callOnMain(
            UIFont,
            "monospacedSystemFontOfSize:weight:",
            [
                9.0,
                0.23
            ]
        );
        
        $set(this._subtitleLabel, {
            font: subtitleFont
        });
        
        $set(this._logView, {
            font: logFont
        });
    }
    
    installConstraints()
    {
        var root = this.view;
        var zero = this._zeroReference;
        
        $equal(
            $anchor(this._logoView, "centerXAnchor"),
            $anchor(root, "centerXAnchor"),
            0
        );
        
        $equal(
            $anchor(this._logoView, "centerYAnchor"),
            $anchor(root, "centerYAnchor"),
            -45
        );
        
        $equal(
            $anchor(this._logoView, "widthAnchor"),
            $anchor(zero, "widthAnchor"),
            115
        );
        
        $equal(
            $anchor(this._logoView, "heightAnchor"),
            $anchor(zero, "heightAnchor"),
            115
        );
        
        $equal(
            $anchor(this._progressView, "topAnchor"),
            $anchor(this._logoView, "bottomAnchor"),
            10
        );
        
        $equal(
            $anchor(this._progressView, "centerXAnchor"),
            $anchor(root, "centerXAnchor"),
            0
        );
        
        $equal(
            $anchor(this._progressView, "widthAnchor"),
            $anchor(zero, "widthAnchor"),
            220
        );
        
        $equal(
            $anchor(this._subtitleLabel, "topAnchor"),
            $anchor(this._progressView, "bottomAnchor"),
            13
        );
        
        $equal(
            $anchor(this._subtitleLabel, "centerXAnchor"),
            $anchor(root, "centerXAnchor"),
            0
        );
        
        $gte(
            $anchor(this._subtitleLabel, "leadingAnchor"),
            $anchor(root, "leadingAnchor"),
            30
        );
        
        $lte(
            $anchor(this._subtitleLabel, "trailingAnchor"),
            $anchor(root, "trailingAnchor"),
            -30
        );
        
        var box = this._logContainer;
        var log = this._logView;
        
        $equal(
            $anchor(box, "topAnchor"),
            $anchor(root, "topAnchor"),
            2
        );
        
        $equal(
            $anchor(box, "bottomAnchor"),
            $anchor(root, "bottomAnchor"),
            -2
        );
        
        $equal(
            $anchor(box, "leadingAnchor"),
            $anchor(root, "leadingAnchor"),
            6
        );
        
        $equal(
            $anchor(box, "trailingAnchor"),
            $anchor(root, "trailingAnchor"),
            0
        );
        
        $equal(
            $anchor(log, "leadingAnchor"),
            $anchor(box, "leadingAnchor"),
            0
        );
        
        $equal(
            $anchor(log, "trailingAnchor"),
            $anchor(box, "trailingAnchor"),
            0
        );
        
        $lte(
            $anchor(log, "bottomAnchor"),
            $anchor(box, "bottomAnchor"),
            0
        );
        
        $constraintWithPriority($anchor(log, "topAnchor"), "constraintEqualToAnchor:", $anchor(box, "topAnchor"), 0, 250);
    }
    
    setProgress(progress)
    {
        progress = Number(progress);
        if(!isFinite(progress))
        {
            progress = 0;
        }
        progress = Math.max(0.0, Math.min(progress, 1.0));
        ObjC.callOnMain(this._progressView, "setProgress:animated:", [progress, true]);
    }
    
    setProgressPercent(percent)
    {
        percent = Number(percent);
        if(!isFinite(percent))
        {
            percent = 0;
        }
        percent = Math.max(0, Math.min(percent, 100));
        this.setProgress(
            percent / 100.0
        );
    }
    
    setSubtitle(subtitle)
    {
        if(subtitle == null)
        {
            subtitle = "";
        }
        subtitle = String(subtitle);
        var current = $get(this._subtitleLabel, "text");
        if(String(current) === subtitle)
        {
            return;
        }
        $set(this._subtitleLabel, {
            text: subtitle
        });
    }
    
    showNoSignWithSubtitle(subtitle)
    {
        var UIImage = $class("UIImage");
        var UIColor = $class("UIColor");
        
        var noSign = $send(UIImage, "systemImageNamed:", "nosign");
        var labelColor = $send(UIColor, "labelColor");
        
        $set(this._logoView, {
            image: noSign,
            tintColor: labelColor
        });
        
        $set(this._progressView, {
            alpha: 0.0,
            hidden: true
        });
        
        if(subtitle !== null && subtitle !== undefined)
        {
            this.setSubtitle(
                String(subtitle)
            );
        }
    }
    
    appendLog(line)
    {
        if(line === null || line === undefined)
        {
            return;
        }
        
        line = String(line);

        if(line.length === 0)
        {
            return;
        }
        
        ObjC.callC("NSLog", [ line ]);
        
        this._logLines.push(line);
        
        var max = this.maxLogLines();
        if(this._logLines.length > max)
        {
            this._logLines.splice(0, this._logLines.length - max);
        }
        
        $set(this._logView, {
            text: this._logLines.join("\n")
        });
    }
    
    maxLogLines()
    {
        var font = $get(this._logView, "font");
        var lineHeight = Number($get(font, "lineHeight"));
        var layer = $send(this._logContainer, "layer");
        var height = Number($send(layer, "valueForKeyPath:", "bounds.size.height"));
        if(!(lineHeight > 0) || !(height > 0))
        {
            return 50;
        }
        return Math.ceil(height / lineHeight) + 1;
    }
    
    setVerbose(verbose)
    {
        $set(this._logContainer, { hidden: !verbose });
        $set(this._progressView, { hidden: verbose });
        $set(this._subtitleLabel, { hidden: verbose });
    }
    
    putAlive(alive)
    {
        $set(this._progressView, { hidden: !alive });
        $set(this._subtitleLabel, { hidden: !alive });
    }
    
    mount(parentVC)
    {
        if(parentVC == null)
        {
            return;
        }
        
        var parentView = $send(parentVC, "view");
        
        $set(this.view, {
            translatesAutoresizingMaskIntoConstraints: false
        });
        
        $send(parentVC, "addChildViewController:", this._vc);
        $send(parentView, "addSubview:", this.view);
        
        $equal(
            $anchor(this.view, "topAnchor"),
            $anchor(parentView, "topAnchor"),
            0
        );
        
        $equal(
            $anchor(this.view, "bottomAnchor"),
            $anchor(parentView,"bottomAnchor"),
            0
        );
        
        $equal(
            $anchor(this.view, "leadingAnchor"),
            $anchor(parentView, "leadingAnchor"),
            0
        );
        
        $equal(
            $anchor(this.view, "trailingAnchor"),
            $anchor(parentView, "trailingAnchor"),
            0
        );
        
        $send(this._vc, "didMoveToParentViewController:", parentVC);
        
        return this;
    }
    
    umount()
    {
        $send(this.view, "removeFromSuperview");
    }
}

/*
 * ------------------------------------------------------------------
 * Recovery mode (Android style, navigated with the volume keys)
 *
 * Extends LoaderUIViewController.
 *
 * Event-driven, native-classified: NXVolumeChangeScanner emits ONE event
 * per gesture from real press/release edges, as { button, kind }:
 *     button   1 = volume up, 2 = volume down (0 for select)
 *     kind     "tap"    -> navigate (fires on release of a lone button)
 *              "select" -> both buttons held at once
 *
 * Select is a both-held overlap, NOT a timed simultaneous tap: press one
 * button, then the other while the first is still down — no window, any
 * order. There is no JS timer in this path.
 *
 * enterRecovery() builds + shows the screen and registers the handler via
 * ObjC.onVolumeButton (native installs the volume pin and hides the HUD).
 * The caller wires selection here.
 *
 * NOTE: every log method here is namespaced (recoveryLog / _paintRecoveryLog
 * / ...). It must NOT reuse the loader's verbose logger name (appendLog) or
 * any other loader-wide method — Object.assign copies onto the shared
 * prototype and would otherwise SHADOW them. The recovery footer log and the
 * verbose boot log are separate surfaces.
 * ------------------------------------------------------------------
 */

globalThis.$rgba = function $rgba(r, g, b, a)
{
    return ObjC.callOnMain(
        $class("UIColor"),
        "colorWithRed:green:blue:alpha:",
        [r, g, b, (a === undefined) ? 1.0 : a]
    );
}

globalThis.RecoveryTheme = {
    background:     function() { return $rgba(0.0, 0.0, 0.0); },
    header:         function() { return $rgba(249/255, 194/255, 0.0); },  // AOSP INFO amber
    info:           function() { return $rgba(249/255, 194/255, 0.0); },  // title + instructions
    item:           function() { return $rgba(0.0, 0.66, 1.0); },
    highlight:      function() { return $rgba(0.0, 0.66, 1.0); },
    highlightText:  function() { return $rgba(1.0, 1.0, 1.0); },
    footer:         function() { return $rgba(0.5, 0.5, 0.5); },

    // Log line colours. AOSP prints normal output in the INFO colour and
    // failures in a dedicated error red. Switch logInfo to footer() if you
    // prefer the greyed-out look over AOSP parity.
    logInfo:        function() { return $rgba(196/255, 196/255, 196/255); },  // amber, like ui_print
    logError:       function() { return $rgba(1.0, 0.27, 0.27); },       // AOSP error red
};

globalThis.RECOVERY_FONT_SIZE = 13.0;   // one size for header, instructions, and items

Object.assign(LoaderUIViewController.prototype, {

    /* ---- view ---- */

    createRecoveryView()
    {
        if(this._recoveryContainer != null)
        {
            return;
        }

        var UIView = $class("UIView");
        var UILabel = $class("UILabel");
        var UIStackView = $class("UIStackView");
        var UIFont = $class("UIFont");
        var clear = $send($class("UIColor"), "clearColor");

        this._recoveryRows = [];
        this._recoveryItems = [];
        this._recoveryDecor = [];
        this._recoveryIndex = 0;

        // lifecycle state
        this._recoveryActive = false;
        this._onSelect = null;
        this._onMove = null;

        // full screen, opaque, sits above everything else
        var container = $send(UIView, "new");
        $set(container, {
            translatesAutoresizingMaskIntoConstraints: false,
            backgroundColor: RecoveryTheme.background(),
            hidden: true,
        });
        $send(this.view, "addSubview:", container);
        this._recoveryContainer = container;

        var root = this.view;
        $equal($anchor(container, "topAnchor"),      $anchor(root, "topAnchor"), 0);
        $equal($anchor(container, "bottomAnchor"),   $anchor(root, "bottomAnchor"), 0);
        $equal($anchor(container, "leadingAnchor"),  $anchor(root, "leadingAnchor"), 0);
        $equal($anchor(container, "trailingAnchor"), $anchor(root, "trailingAnchor"), 0);

        var guide = $send(container, "safeAreaLayoutGuide");

        var MARGIN = 0;   // AOSP: header, instructions, and menu items flush left

        // header (title / version) — AOSP INFO amber
        var header = $send(UILabel, "new");
        $set(header, {
            translatesAutoresizingMaskIntoConstraints: false,
            numberOfLines: 0,
            textAlignment: 0,
            backgroundColor: clear,
            textColor: RecoveryTheme.info(),
            text: "Nyxian Recovery",
            font: ObjC.callOnMain(UIFont, "monospacedSystemFontOfSize:weight:", [RECOVERY_FONT_SIZE, 0.23]),
        });
        $send(container, "addSubview:", header);
        this._recoveryHeader = header;

        // navigation instructions, right under the header — also amber
        var instructions = $send(UILabel, "new");
        $set(instructions, {
            translatesAutoresizingMaskIntoConstraints: false,
            numberOfLines: 0,
            textAlignment: 0,
            backgroundColor: clear,
            textColor: RecoveryTheme.info(),
            text: "Use volume up/down and hold both volume keys.",
            font: ObjC.callOnMain(UIFont, "monospacedSystemFontOfSize:weight:", [RECOVERY_FONT_SIZE, 0.23]),
        });
        $send(container, "addSubview:", instructions);
        this._recoveryInstructions = instructions;

        // menu
        var stack = $send(UIStackView, "new");
        $set(stack, {
            translatesAutoresizingMaskIntoConstraints: false,
            axis: 1,          // vertical
            alignment: 0,     // fill
            distribution: 0,  // fill
            spacing: 2,       // small gap between bars
        });
        $send(container, "addSubview:", stack);
        this._recoveryStack = stack;

        // footer — the recovery log surface. It is a VERTICAL STACK: one
        // UILabel per log line, each coloured by level. Per-line colour via a
        // per-line label textColor (the same reliable mechanism the menu rows
        // use) — no NSAttributedString, whose attribute dict was silently
        // dropping colours across the bridge. Pinned to the bottom; grows up.
        var footer = $send(UIStackView, "new");
        $set(footer, {
            translatesAutoresizingMaskIntoConstraints: false,
            axis: 1,          // vertical
            alignment: 0,     // fill
            distribution: 0,  // fill
            spacing: 0,
        });
        $send(container, "addSubview:", footer);
        this._recoveryFooter = footer;
        this._recoveryLogRows = [];

        $equal($anchor(header, "topAnchor"),           $anchor(guide, "topAnchor"), 12);
        $equal($anchor(header, "leadingAnchor"),       $anchor(guide, "leadingAnchor"), MARGIN);
        $lte  ($anchor(header, "trailingAnchor"),      $anchor(guide, "trailingAnchor"), -8);

        $equal($anchor(instructions, "topAnchor"),     $anchor(header, "bottomAnchor"), 0);
        $equal($anchor(instructions, "leadingAnchor"), $anchor(guide, "leadingAnchor"), MARGIN);
        $lte  ($anchor(instructions, "trailingAnchor"),$anchor(guide, "trailingAnchor"), -8);

        $equal($anchor(stack, "topAnchor"),            $anchor(instructions, "bottomAnchor"), 4);
        $equal($anchor(stack, "leadingAnchor"),        $anchor(guide, "leadingAnchor"), MARGIN);
        $equal($anchor(stack, "trailingAnchor"),       $anchor(guide, "trailingAnchor"), 0);
        $lte  ($anchor(stack, "bottomAnchor"),         $anchor(footer, "topAnchor"), -8);

        $equal($anchor(footer, "bottomAnchor"),        $anchor(guide, "bottomAnchor"), -12);
        $equal($anchor(footer, "leadingAnchor"),       $anchor(guide, "leadingAnchor"), MARGIN);
        $lte  ($anchor(footer, "trailingAnchor"),      $anchor(guide, "trailingAnchor"), -8);
    },

    setRecoveryHeader(text)
    {
        this.createRecoveryView();
        $set(this._recoveryHeader, { text: (text == null) ? "" : String(text) });
    },

    // Footer is the recovery log surface now — seed it as the first log line
    // rather than writing the label directly, so recoveryLog() doesn't clobber
    // it and it renders through the same attributed (per-line colour) path.
    setRecoveryFooter(text)
    {
        this.createRecoveryView();
        this._recoveryLogLines = (text == null || text === "")
            ? []
            : [ { text: String(text), level: "info" } ];
        this._paintRecoveryLog();
    },

    setRecoveryInstructions(text)
    {
        this.createRecoveryView();
        $set(this._recoveryInstructions, { text: (text == null) ? "" : String(text) });
    },

    // items: [ "text", ... ] or [ { title, onSelect(controller) }, ... ]
    setRecoveryItems(items)
    {
        this.createRecoveryView();

        var UIView = $class("UIView");
        var UILabel = $class("UILabel");
        var UIFont = $class("UIFont");
        var clear = $send($class("UIColor"), "clearColor");
        var font     = ObjC.callOnMain(UIFont, "monospacedSystemFontOfSize:weight:", [RECOVERY_FONT_SIZE, 0.0]);  // unselected: regular
        var fontBold = ObjC.callOnMain(UIFont, "monospacedSystemFontOfSize:weight:", [RECOVERY_FONT_SIZE, 0.4]);  // selected: bold
        this._recoveryItemFont = font;
        this._recoveryItemFontBold = fontBold;

        // a thin full-width blue rule
        function makeLine()
        {
            var v = $send(UIView, "new");
            $set(v, {
                translatesAutoresizingMaskIntoConstraints: false,
                backgroundColor: RecoveryTheme.item(),   // blue
            });
            var h = ObjC.callOnMain($anchor(v, "heightAnchor"), "constraintEqualToConstant:", [1.0]);
            $set(h, { active: true });
            return v;
        }

        // drop old rows + separators
        for(var i = 0; i < this._recoveryRows.length; i++)
        {
            $send(this._recoveryRows[i].row, "removeFromSuperview");
        }
        this._recoveryRows = [];

        if(this._recoveryDecor)
        {
            for(var k = 0; k < this._recoveryDecor.length; k++)
            {
                $send(this._recoveryDecor[k], "removeFromSuperview");
            }
        }
        this._recoveryDecor = [];

        // normalize + keep the per-item callbacks
        this._recoveryItems = (items || []).map(function(it) {
            if(it && typeof it === "object")
            {
                return { title: String(it.title),
                         onSelect: (typeof it.onSelect === "function") ? it.onSelect : null };
            }
            return { title: String(it), onSelect: null };
        });

        // blue line over the first entry
        var topLine = makeLine();
        $send(this._recoveryStack, "addArrangedSubview:", topLine);
        this._recoveryDecor.push(topLine);

        for(var j = 0; j < this._recoveryItems.length; j++)
        {
            var row = $send(UIView, "new");
            $set(row, {
                translatesAutoresizingMaskIntoConstraints: false,
                backgroundColor: clear,
            });

            var label = $send(UILabel, "new");
            $set(label, {
                translatesAutoresizingMaskIntoConstraints: false,
                numberOfLines: 1,
                textAlignment: 0,
                backgroundColor: clear,
                textColor: RecoveryTheme.item(),
                text: this._recoveryItems[j].title,
                font: font,
            });

            $send(row, "addSubview:", label);
            $equal($anchor(label, "topAnchor"),      $anchor(row, "topAnchor"), 1);    // slimmer bars
            $equal($anchor(label, "bottomAnchor"),   $anchor(row, "bottomAnchor"), -1);
            $equal($anchor(label, "leadingAnchor"),  $anchor(row, "leadingAnchor"), 0);
            $equal($anchor(label, "trailingAnchor"), $anchor(row, "trailingAnchor"), -8);

            $send(this._recoveryStack, "addArrangedSubview:", row);
            this._recoveryRows.push({ row: row, label: label });
        }

        // blue line under the last entry
        var bottomLine = makeLine();
        $send(this._recoveryStack, "addArrangedSubview:", bottomLine);
        this._recoveryDecor.push(bottomLine);

        this._recoveryIndex = -1;
        this.setRecoveryIndex(0);
    },

    _paintRecoveryRow(index, highlighted)
    {
        var entry = this._recoveryRows[index];
        if(entry == null)
        {
            return;
        }

        $set(entry.row, {
            backgroundColor: highlighted
                ? RecoveryTheme.highlight()
                : $send($class("UIColor"), "clearColor")
        });
        $set(entry.label, {
            textColor: highlighted
                ? RecoveryTheme.highlightText()
                : RecoveryTheme.item(),
            font: highlighted
                ? this._recoveryItemFontBold
                : this._recoveryItemFont
        });
    },

    setRecoveryIndex(index)
    {
        var count = this._recoveryRows ? this._recoveryRows.length : 0;
        if(count === 0)
        {
            this._recoveryIndex = 0;
            return;
        }

        // wrap around in both directions
        index = ((Number(index) % count) + count) % count;
        if(index === this._recoveryIndex)
        {
            return;
        }

        this._paintRecoveryRow(this._recoveryIndex, false);
        this._paintRecoveryRow(index, true);
        this._recoveryIndex = index;
    },

    get recoveryIndex()
    {
        return this._recoveryIndex;
    },

    currentRecoveryItem()
    {
        return this._recoveryItems ? this._recoveryItems[this._recoveryIndex] : null;
    },

    showRecovery(visible)
    {
        this.createRecoveryView();
        $send(this.view, "bringSubviewToFront:", this._recoveryContainer);
        $set(this._recoveryContainer, { hidden: !visible });
    },

    /* ---- lifecycle ---- */

    enterRecovery(config)
    {
        config = config || {};
        this.createRecoveryView();

        if(config.header != null) this.setRecoveryHeader(config.header);
        this.setRecoveryItems(config.items || []);
        if(config.footer != null) this.setRecoveryFooter(config.footer);
        if(config.instructions != null) this.setRecoveryInstructions(config.instructions);

        this._onSelect = (typeof config.onSelect === "function") ? config.onSelect : null;
        this._onMove   = (typeof config.onMove   === "function") ? config.onMove   : null;

        this._recoveryActive = true;
        this.showRecovery(true);

        var self = this;
        $onVolumeButton(function(ev) {
            self.handleButton(ev);
        });

        return this;
    },

    exitRecovery()
    {
        this._recoveryActive = false;

        if(typeof $onVolumeButton === "function")
        {
            $onVolumeButton(null); // native: remove pin + disarm
        }

        this.showRecovery(false);
        return this;
    },

    /* ---- input: native emits one event per gesture ---- */

    // ev = { button: 1|2|0, kind: "tap"|"select" }
    handleButton(ev)
    {
        if(!this._recoveryActive || ev == null)
        {
            return;
        }

        if(String(ev.kind) === "select")
        {
            this._select();
        }
        else
        {
            this._move(Number(ev.button) === 1 ? -1 : 1);
        }
    },

    _move(delta)
    {
        this.setRecoveryIndex(this._recoveryIndex + delta);
        if(typeof this._onMove === "function")
        {
            this._onMove(this, this._recoveryIndex, this.currentRecoveryItem());
        }
    },

    _select()
    {
        var item = this.currentRecoveryItem();
        if(item == null)
        {
            return;
        }

        if(typeof item.onSelect === "function")
        {
            item.onSelect(this);
        }

        if(this._recoveryActive && typeof this._onSelect === "function")
        {
            this._onSelect(this, this._recoveryIndex, item);
        }
    },
});

/*
 * ------------------------------------------------------------------
 * Recovery log — AOSP-style print area at the bottom of the recovery screen.
 *
 * Every method here is recovery-namespaced on purpose: these live on the
 * shared LoaderUIViewController.prototype, and reusing a loader-wide name
 * (appendLog, clearLog, _paintLog, ...) would SHADOW the verbose boot logger.
 * Keep this log and the verbose log strictly separate.
 *
 * The footer label is a scrolling tail: newest line at the bottom, oldest
 * dropped once the cap is hit. Each line carries a level so it renders in its
 * own colour via NSAttributedString — "info" in the AOSP info amber, "error"
 * in error red — matching how AOSP colours ui_print vs failures. (A plain
 * UILabel has one textColor, so per-line colour needs attributed text; built
 * per-line to avoid NSRange struct args, which this bridge can't marshal.)
 *
 * Object.assign + accessors: Object.assign copies VALUES, not getters/setters,
 * so the cap is a method (recoveryLogMax() / setRecoveryLogMax()), not a
 * `get`/`set` accessor.
 * ------------------------------------------------------------------
 */
Object.assign(LoaderUIViewController.prototype, {

    // Lines kept on screen. Small enough that the log never crowds out the
    // menu on a short display; tune via loaderUI.setRecoveryLogMax(N).
    recoveryLogMax()
    {
        return (this._recoveryLogMax == null) ? 8 : this._recoveryLogMax;
    },

    setRecoveryLogMax(n)
    {
        this._recoveryLogMax = Math.max(1, Number(n) || 1);
        this._trimRecoveryLog();
        this._paintRecoveryLog();
        return this;
    },

    _trimRecoveryLog()
    {
        if(!this._recoveryLogLines) this._recoveryLogLines = [];
        var over = this._recoveryLogLines.length - this.recoveryLogMax();
        if(over > 0) this._recoveryLogLines.splice(0, over);
    },

    _recoveryLogColorForLevel(level)
    {
        return (level === "error")
            ? RecoveryTheme.logError()
            : RecoveryTheme.logInfo();
    },

    _paintRecoveryLog()
    {
        this.createRecoveryView();

        // AOSP log text: mono, regular weight, same size as the menu.
        if(!this._recoveryLogFont)
        {
            this._recoveryLogFont = ObjC.callOnMain(
                $class("UIFont"), "monospacedSystemFontOfSize:weight:",
                [RECOVERY_FONT_SIZE, 0.0]
            );
        }

        var stack = this._recoveryFooter;   // a vertical UIStackView
        var UILabel = $class("UILabel");
        var clear = $send($class("UIColor"), "clearColor");

        // Drop the old rows. Removing a view from its superview also removes it
        // from the stack's arrangedSubviews, so this fully clears the log.
        if(this._recoveryLogRows)
        {
            for(var r = 0; r < this._recoveryLogRows.length; r++)
            {
                $send(this._recoveryLogRows[r], "removeFromSuperview");
            }
        }
        this._recoveryLogRows = [];

        // One label per line, coloured by level. textColor is a plain KVC set —
        // the same call the menu rows use — so the colour cannot silently drop.
        var lines = this._recoveryLogLines || [];
        for(var i = 0; i < lines.length; i++)
        {
            var lbl = $send(UILabel, "new");
            $set(lbl, {
                translatesAutoresizingMaskIntoConstraints: false,
                numberOfLines: 0,
                textAlignment: 0,
                backgroundColor: clear,
                textColor: this._recoveryLogColorForLevel(lines[i].level),
                text: lines[i].text,
                font: this._recoveryLogFont,
            });
            ObjC.callOnMain(stack, "addArrangedSubview:", [lbl]);   // appends at bottom
            this._recoveryLogRows.push(lbl);
        }
    },

    // Append one entry to the RECOVERY footer log (newest at the bottom).
    // Multi-line strings are split so the cap counts real rows, not calls.
    // level: "info" | "error". This is separate from the verbose boot logger.
    recoveryLog(line, level)
    {
        this.createRecoveryView();
        if(!this._recoveryLogLines) this._recoveryLogLines = [];

        var s = (line == null) ? "" : String(line);
        var lvl = (level === "error") ? "error" : "info";
        var parts = s.split("\n");
        for(var i = 0; i < parts.length; i++)
        {
            this._recoveryLogLines.push({ text: parts[i], level: lvl });
        }

        this._trimRecoveryLog();
        this._paintRecoveryLog();
        return this;
    },

    // convenience: red line
    recoveryLogError(line)
    {
        return this.recoveryLog(line, "error");
    },

    clearRecoveryLog()
    {
        this._recoveryLogLines = [];
        this._paintRecoveryLog();
        return this;
    },
});

/*
 * ------------------------------------------------------------------
 * Recovery file browser — the recovery menu, driving NSFileManager.
 *
 * Adds browseRecovery() and enterFileBrowser() to LoaderUIViewController.
 * A directory becomes recovery items: the first item is always "<< Back"
 * (up a level, or out of the browser at the root); then folders re-list on
 * select; then files call your onFile hook. Volume-navigated, same
 * tap-move / hold-both-select.
 *
 *   loaderUI.enterFileBrowser("/var/mobile/Documents", {
 *       root:   "/var/mobile/Documents",     // "<< Back" won't climb above this
 *       header: "USBoot Files",
 *       onBack: function(c){ showMainRecoveryMenu(c); }, // called at root; else exitRecovery()
 *       onFile: function(path, name, c){ ... }           // c is the controller
 *   });
 *
 *   // or from inside an existing recovery menu item:
 *   { title: "Browse files", onSelect: function(c){
 *         c.browseRecovery("/var/mobile/Documents", {
 *             root: "/var/mobile/Documents",
 *             onBack: function(cc){ showMainRecoveryMenu(cc); },
 *         });
 *   } }
 * ------------------------------------------------------------------
 */

Object.assign(LoaderUIViewController.prototype, {

    _fmManager()
    {
        return ObjC.call($class("NSFileManager"), "defaultManager", []);
    },

    _fmIsDir(path)
    {
        var attrs = ObjC.call(this._fmManager(), "attributesOfItemAtPath:error:", [path, null]);
        return !!attrs && attrs["NSFileType"] === "NSFileTypeDirectory";
    },

    _fmJoin(dir, name)
    {
        return (dir === "/") ? ("/" + name) : (dir + "/" + name);
    },

    _fmParent(p)
    {
        if(p === "/") return "/";
        var q = p.replace(/\/+$/, "");
        var i = q.lastIndexOf("/");
        return (i <= 0) ? "/" : q.slice(0, i);
    },

    // List `path` into the recovery menu. First item is always "<< Back".
    // Folders descend; files call options.onFile(path, name, controller).
    browseRecovery(path, options)
    {
        options = options || {};
        var root = (options.root !== undefined) ? options.root : "/";
        var fm = this._fmManager();

        var names = ObjC.call(fm, "contentsOfDirectoryAtPath:error:", [path, null]);
        if(!names)
        {
            // AOSP prints failed listings to the log in error red.
            this.recoveryLogError("open failed: " + path);
            names = [];
        }
        names.sort(function(a, b){ return a.localeCompare(b); });

        var dirs = [], files = [];
        for(var i = 0; i < names.length; i++)
        {
            var full = this._fmJoin(path, names[i]);
            if(this._fmIsDir(full)) dirs.push({ name: names[i], path: full });
            else                    files.push({ name: names[i], path: full });
        }

        var items = [];

        // Android-style: navigation action first. Up a level, or out at root.
        items.push({ title: "<< Back", onSelect: function(c){
            if(path !== root)
            {
                c.browseRecovery(c._fmParent(path), options);
            }
            else if(typeof options.onBack === "function")
            {
                options.onBack(c);
            }
            else
            {
                c.exitRecovery();
            }
        }});

        dirs.forEach(function(e){
            items.push({ title: e.name + "/", onSelect: function(c){
                c.browseRecovery(e.path, options);
            }});
        });

        files.forEach(function(e){
            items.push({ title: e.name, onSelect: function(c){
                if(typeof options.onFile === "function") options.onFile(e.path, e.name, c);
            }});
        });

        this._fmOptions = options; // so onFile handlers can re-browse
        this._fmPath = path;

        this.setRecoveryHeader((options.header || "Files") + "\n" + path);
        this.setRecoveryItems(items);
        return this;
    },

    // Enter recovery straight into a browser rooted at `path`.
    enterFileBrowser(path, options)
    {
        options = options || {};
        this.enterRecovery({
            header:   options.header || "Files",
            items:    [],
            onSelect: options.onSelect,
            onMove:   options.onMove,
        });
        this.browseRecovery(path, options);
        return this;
    },
});
