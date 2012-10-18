install:
	cp -uv extension.js metadata.json $(HOME)/.local/share/gnome-shell/extensions/"uptime-indicator@gniourfgniourf.gmail.com/"

dist:
	zip -j uptime-indicator metadata.json extension.js

