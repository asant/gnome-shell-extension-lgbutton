/* -*- mode: js2; js2-basic-offset: 4; indent-tabs-mode: nil -*- */
/*
 * A very simple GNOME Shell extension that lets users toggle the
 * LookingGlass window by pressing a top panel button.
 * Copyright (C) 2012  Andrea Santilli <andresantilli gmx com>
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301,
 * USA.
 */

const Gio       = imports.gi.Gio;
const GLib      = imports.gi.GLib;
const Lang      = imports.lang;
const Main      = imports.ui.main;
const Panel     = imports.ui.panel;
const PanelMenu = imports.ui.panelMenu;
const St        = imports.gi.St;

const LOCALE_SUBDIR     = 'locale';
const LOCALE_EXT        = '.mo';
const MSG_SUBDIR        = 'LC_MESSAGES';
const NEW_API_VERSION   = '3.3.90';
const TOOLTIP           = "Toggle LookingGlass";
const ICON_NAME         = 'preferences-desktop-display';
const ICON_TYPE         = St.IconType.SYMBOLIC;
const ROLE              = 'lgbutton';

function LookingGlassButton() {
    this._init.apply(this, arguments);
}

/* we want our button to show the same layout of a PanelMenu.Button; we
 * inherit from PanelMenu.ButtonBox though, as we don't need any menus. */
LookingGlassButton.prototype = {
    __proto__: PanelMenu.ButtonBox.prototype,

    _init: function(metadata, params)
    {
        /* set the same properties of a PanelMenu.Button */
        PanelMenu.ButtonBox.prototype._init.call(this, {
            reactive:       true,
            can_focus:      true,
            track_hover:    true
        });

        this.actor.add_actor(new St.Icon({
            icon_name:      ICON_NAME,
            icon_type:      ICON_TYPE,
            style_class:    'system-status-icon'
        }));

        /* setup style as if this were a SystemStatusButton */
        this.actor.add_style_class_name('panel-status-button');
        
        this.actor.has_tooltip = true;
        this.actor.tooltip_text = _(TOOLTIP);

        this.actor.connect('button-press-event', Lang.bind(this, function () {
            /* this call won't create a new instance
             * of LG when there's already one.*/
            Main.createLookingGlass();
            Main.lookingGlass.toggle();
        }));
        /* we can't directly call Main.panel.addToStatusArea() as
         * this object is not an instance of PanelMenu.Button */
        Main.panel._insertStatusItem(this.actor, 0);
        Main.panel._statusArea[ROLE] = this;
    },

    destroy: function() {
        /* remove this button from the status area first */
        Main.panel._statusArea[ROLE] = null;

        this.actor._delegate = null;
        this.actor.destroy();
        this.actor.emit('destroy');
    }
};

let lgb;
let Gettext;
let _;

/* emulating python's gettext.find() behavior */
function init_localizations(metadata) {
    let domain = metadata.uuid;
    let langs = GLib.get_language_names();
    let locale_dirs = new Array(GLib.build_filenamev([metadata.path,
            LOCALE_SUBDIR]));

    /* I prefer to fetch the uuid from the metadata instead of hardcoding it */
    Gettext = imports.gettext.domain(metadata.uuid);
    _ = Gettext.gettext;

    /* check whether we're using the right shell version before trying to fetch 
     * its locale directory */
    if (imports.misc.config.PACKAGE_VERSION < NEW_API_VERSION) {
        let data_dirs = GLib.get_system_data_dirs();
        for (let i = 0; i < data_dirs.length; i++) {
            locale_dirs = locale_dirs.concat([ GLib.build_filenamev([
                    data_dirs[i], LOCALE_SUBDIR ]) ]);
        }
    } else {
        locale_dirs = locale_dirs.concat([ imports.misc.config.LOCALEDIR ]);
    }

    for (let j = 0; j < locale_dirs.length; j++) {
        for (let i = 0; i < langs.length; i++) {
            let str = GLib.build_filenamev([ locale_dirs[j], langs[i],
                    MSG_SUBDIR, domain ]) + LOCALE_EXT;
            let file = Gio.file_new_for_path(str);

            if (file.query_file_type(Gio.FileQueryInfoFlags.NONE, null) ==
                    Gio.FileType.REGULAR) {
                imports.gettext.bindtextdomain(domain, locale_dirs[j]);
                imports.gettext.textdomain(domain);
                return;
            }
        }
    }
}

function init(metadata) {
    init_localizations(metadata);
}

function enable() {
    lgb = new LookingGlassButton();
}

function disable() {
    lgb.destroy();
}

