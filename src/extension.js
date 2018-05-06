/* -*- mode: js2; js2-basic-offset: 4; indent-tabs-mode: nil -*- */
/*
 * A very simple GNOME Shell extension that lets users toggle the
 * LookingGlass window by pressing a top panel button.
 * Copyright (C) 2012  Andrea Santilli <andreasantilli gmx com>
 * Copyright (C) 2018  Lorenzo Carbonell <lorenzo.carbonell.cerezo@gmail.com>
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
const Main      = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const St        = imports.gi.St;

const LOCALE_SUBDIR     = 'locale';
const LOCALE_EXT        = '.mo';
const MSG_SUBDIR        = 'LC_MESSAGES';
const TOOLTIP           = 'Toggle LookingGlass';
const ICON_NAME         = 'preferences-desktop-display';
const ROLE              = 'lgbutton';
const NEW_API_VERSION   = [ 3, 28, 0 ];


class LookingGlassButton extends PanelMenu.Button{

    constructor(){
        super(St.Align.START);
        /* set the same properties of a PanelMenu.Button */

        let box = new St.BoxLayout();
        this.icon = new St.Icon({icon_name: ICON_NAME,
                                 style_class: 'system-status-icon'});
        box.add(this.icon);

        this.actor.add_child(box);
        this.actor.add_actor(new St.Icon({
            icon_name:      ICON_NAME,
            style_class:    'system-status-icon'
        }));

        /* setup style as if this were a SystemStatusButton */
        this.actor.add_style_class_name('panel-status-button');
        
        this.actor.has_tooltip = true;
        this.actor.tooltip_text = _(TOOLTIP);

        this.actor.connect('button-press-event', () => {
            /* this call won't create a new instance
             * of LG when there's already one.*/
            Main.createLookingGlass();
            Main.lookingGlass.toggle();
        });
    }

    destroy() {
        this.actor._delegate = null;
        this.actor.destroy();
        this.actor.emit('destroy');
    }
};

let lgb;
let Gettext;
let _;

function compare_versions(a, b) {
    let c = (a.length < b.length)?a:b;

    for (let i in c) {
        if (a[i] == b[i])
            continue;

        return (a[i] - b[i]);
    }
    return a.length - b.length;
}

function init_localizations(metadata) {
    let langs = GLib.get_language_names();
    let locale_dirs = new Array(GLib.build_filenamev([metadata.path,
            LOCALE_SUBDIR]));
    let domain;

    /* check whether we're using the right shell version before trying to fetch 
     * its locale directory and other info */ 
    let current_version = imports.misc.config.PACKAGE_VERSION.split('.');

    if (compare_versions(current_version, NEW_API_VERSION) < 0) {
        domain = metadata['gettext-domain'];
        locale_dirs = locale_dirs.concat([ metadata['system-locale-dir'] ]);
    } else {
        domain = metadata.metadata['gettext-domain'];
        locale_dirs = locale_dirs.concat([ imports.misc.config.LOCALEDIR ]);
    }

    _ = imports.gettext.domain(domain).gettext;

    for (let i in locale_dirs) {
        let dir = Gio.file_new_for_path(locale_dirs[i]);

        if (dir.query_file_type(Gio.FileQueryInfoFlags.NONE, null) ==
                Gio.FileType.DIRECTORY) {
            imports.gettext.bindtextdomain(domain, locale_dirs[i]);
            return;
        }
    }
}

function init(metadata) {
    init_localizations(metadata);
}

function enable() {
    lgb = new LookingGlassButton();
    Main.panel.addToStatusArea('LookingGlassButton', lgb, 0, 'right');
}

function disable() {
    lgb.destroy();
}

