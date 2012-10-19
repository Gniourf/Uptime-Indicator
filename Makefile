destdir=$(HOME)/.local/share/gnome-shell/extensions/uptime-indicator@gniourfgniourf.gmail.com

install:
	@install -Cdv "$(destdir)"
	@install -Cv -m 644 extension.js metadata.json AUTHORS COPYING $(HOME)/.local/share/gnome-shell/extensions/"uptime-indicator@gniourfgniourf.gmail.com/"

dist-zip:
	zip -j uptime-indicator metadata.json extension.js

clean:
	-rm -f uptime-indicator.zip

