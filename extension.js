/* Uptime Indicator
 *
 * gnome-shell extension that indicates uptime in status area.
 * Loosely based on lapi's Uptime extension:
 *    https://extensions.gnome.org/extension/312/uptime/
 *
 * Author: Gniourf, gniourfgniourf@gmail.com
 * Date: 2012-18-10
 */

const PanelMenu=imports.ui.panelMenu;
const St=imports.gi.St;
const Main=imports.ui.main;
const Shell=imports.gi.Shell;
const Mainloop=imports.mainloop;
const Lang=imports.lang;

function UptimeIndicator(metadata)
{
   this._init();
}

// Prototype
UptimeIndicator.prototype=
{
   __proto__: PanelMenu.Button.prototype,

   _init: function()
   {
      PanelMenu.Button.prototype._init.call(this, St.Align.START);

      this.buttonText=new St.Label();
      this.buttonText.set_style("text-align:center;");
      this.actor.add_actor(this.buttonText);

      this._set_refresh_rate(30)
      this._change_timeoutloop=true;
      this._timeout=null;
      this._refresh();
   },

   _refresh: function()
   {
      this.buttonText.set_text(this._update_uptime())
      if(this._change_timeoutloop) {
         this._remove_timeout();
         this._timeout=Mainloop.timeout_add_seconds(this._refresh_rate , Lang.bind(this, this._refresh));
         this._change_timeoutloop=false;
         return false;
      }
      else {
         return true;
      }
   },

   _set_refresh_rate: function(refresh_rate)
   {
      if(this._refresh_rate!=refresh_rate) {
         this._refresh_rate=refresh_rate;
         this._change_timeoutloop=true;
      }
   },

   _remove_timeout: function()
   {
      if(this._timeout) {
         Mainloop.source_remove(this._timeout);
         this._timeout=null;
      }
   },

   _update_uptime: function()
   {
      let timestamps=Shell.get_file_contents_utf8_sync('/proc/uptime').split(" ");
      let timestamps_s=timestamps[0];
      let minutes=Math.floor(timestamps_s / 60 % 60);
      let hours=Math.floor(timestamps_s / 3600 % 24);
      let days=Math.floor(timestamps_s / 86400 % 365);
      let years=Math.floor(timestamps_s / 31536000);
      let label_text="?";
      if(years>0) {
         label_text=years+"Y"+days+"D";
         /* Come back at the end of this year */
         this._set_refresh_rate(31536000-(timestamps_s)%31536000);
      }
      else if(days>99) {
         label_text=days+"D";
         /* Come back at the end of this day */
         this._set_refresh_rate(86400-(timestamps_s%86400))
      }
      else if(days>0) {
         if(hours < 10) {
            hours="0" + hours;
         }
         label_text=days+"D"+hours+"h";
         /* Come back at the end of this hour */
         this._set_refresh_rate(3600-(timestamps_s%3600))
      }
      else {
         if(minutes < 10) {
            minutes="0" + minutes;
         }
         label_text=hours+":"+minutes;
         /* Come back at the end of this minute */
         this._set_refresh_rate(60-(timestamps_s%60));
      }
      return label_text;
   },

   enable: function()
   {
      Main.panel._leftBox.add_actor(this.actor);
   },

   disable: function()
   {
      Main.panel._leftBox.remove_actor(this.actor);
      this._remove_timeout();
   }
}

// Init function
function init(metadata)
{
   return new UptimeIndicator(metadata);
}

