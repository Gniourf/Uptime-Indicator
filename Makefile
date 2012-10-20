destdir=$(HOME)/.local/share/gnome-shell/extensions/uptime-indicator@gniourfgniourf.gmail.com
files=AUTHORS COPYING extension.js metadata.json Screenshot.png TODO

all:
	@echo "make options:"
	@echo "      install"
	@echo "      uninstall"
	@echo "      dist-zip"
	@echo "      clean"

install:
	@install -Cdv "$(destdir)"
	@install -Cv -m 644 $(files) "$(destdir)"

uninstall:
	@-rm -rfv "$(destdir)"

dist-zip:
	@zip -jv uptime-indicator $(files) Makefile

clean:
	@-rm -fv uptime-indicator.zip

