/* Uptime Indicator
 *
 * gnome-shell extension that indicates uptime in status area.
 * Loosely based on lapi's Uptime extension:
 *    https://extensions.gnome.org/extension/312/uptime/
 *
 * Author: Gniourf, gniourfgniourf@gmail.com
 * Date: 2012-20-10
 *
 * Changes:
 *    2014-05-10: moved style to css and added Clutter to vertically align the
 *    St.Label (thanks to varunoberoi)
 *    2021-10-05: removed Lang, after review by JustPerfection:
 *    https://extensions.gnome.org/review/26855
 *    and code cleanup
 */



import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';
import St from 'gi://St';

import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';


import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import * as Main  from 'resource:///org/gnome/shell/ui/main.js';


const loop = new GLib.MainLoop(null, false);
let _uptime_indicator_object = null;

export default class UptimeIndicatorExtension extends Extension {

    constructor(metadata) {
        super(metadata);
        this.UptimeIndicator = GObject.registerClass(
            {
                GTypeName: "UptimeIndicator"
            },
            class UptimeIndicator extends PanelMenu.Button
            {
                _init()
                {
                    // this._timeout = null;
                    // this._refresh_rate = 1;
                    // // this._change_timeout_loop = false;
                    // this._started = null;

                    // this.parent(0.0, "Uptime Indicator", false);
                    super._init(0.0, "Uptime Indicator", false);

                    this.buttonText = new St.Label({
                        name: "uptime-indicator-buttonText",
                        y_align: Clutter.ActorAlign.CENTER
                    });
                    this.add_actor(this.buttonText);

                    /* Find starting date and */
                    let timestamp = this._get_timestamps()[0];
                    let date = new Date();
                    date.setTime(date - timestamp*1000)
                    this._started = date.toLocaleString();
                    /* and prepare menu */
                    this._mymenutitle = new PopupMenu.PopupMenuItem(this._started, { reactive: false });
                    this.menu.addMenuItem(this._mymenutitle);

                    this.connect('button-press-event', this._refresh.bind(this));
                    this.connect('key-press-event', this._refresh.bind(this));

                    this._set_refresh_rate(1)
                    this._change_timeoutloop = true;
                    this._refresh();
                }

                _get_timestamps()
                {
                    return Shell.get_file_contents_utf8_sync('/proc/uptime').split(" ");
                }

                _refresh()
                {
                    let text = this._update_uptime();
                    this.buttonText.set_text(text)
                    if(this._change_timeoutloop) {
                        this._remove_timeout();
                        let safeTimeout = Math.min(this._refresh.bind(this), 2147483)
                        this._timeout = GLib.timeout_add_seconds(this._refresh_rate, safeTimeout, () => {
                            return GLib.SOURCE_REMOVE;
                        });
                        this._change_timeoutloop = false;
                        return false;
                    }
                    return true;
                }

                _set_refresh_rate(refresh_rate)
                {
                    if(this._refresh_rate != refresh_rate) {
                        this._refresh_rate = refresh_rate;
                        this._change_timeoutloop = true;
                    }
                }

                _remove_timeout()
                {
                    if(this._timeout) {
                        GLib.source_remove(this._timeout);
                        this._timeout = null;
                    }
                }

                _update_uptime()
                {
                    let timestamps_s = this._get_timestamps()[0];
                    let minutes = Math.floor((timestamps_s / 60) % 60);
                    let hours = Math.floor((timestamps_s / 3600) % 24);
                    let days = Math.floor((timestamps_s / 86400) % 365);
                    let years = Math.floor(timestamps_s / 31536000);
                    let label_text = "?";
                    if(years>0) {
                        label_text = years + "Y" + days + "D";
                        /* Come back next year */
                        this._set_refresh_rate(31536000 - (timestamps_s) % 31536000);
                    }
                    else if(days>99) {
                        label_text = days + "D";
                        /* Come back next day */
                        this._set_refresh_rate(86400 - (timestamps_s % 86400))
                    }
                    else if(days>0) {
                        if(hours < 10) {
                            hours = "0" + hours;
                        }
                        label_text = days + "D" + hours + "h";
                        /* Come back next hour */
                        this._set_refresh_rate(3600 - (timestamps_s % 3600))
                    }
                    else {
                        if(minutes < 10) {
                            minutes = "0" + minutes;
                        }
                        label_text = hours + ":" + minutes;
                        /* Come back next minute */
                        this._set_refresh_rate(60 - (timestamps_s % 60));
                    }
                    return label_text;
                }

                destroy()
                {
                    this._remove_timeout();
                    // this.parent();
                    super.destroy();
                }
            }
        );
    }

// Init function
    init(metadata)
    {
    }

// Enable function
    enable()
    {
        _uptime_indicator_object = new this.UptimeIndicator();
        if(_uptime_indicator_object) {
            Main.panel.addToStatusArea('uptime-indicator', _uptime_indicator_object);
        }
    }

// Disable function
    disable()
    {
        if(_uptime_indicator_object) {
            _uptime_indicator_object.destroy();
            _uptime_indicator_object = null;
        }
    }
}
