ACLOCAL_AMFLAGS = -I m4 ${ACLOCAL_FLAGS}

SUBDIRS = src po

include include.mk

zip-file: all
	rm -fR $(builddir)/_build
	rm -fR $(builddir)/zip-files
	$(MKDIR_P) $(builddir)/_build; \
	$(MKDIR_P) $(builddir)/zip-files; \
	$(MAKE) install DESTDIR="$(abs_builddir)/_build"; \
	cp "$(srcdir)/AUTHORS" -t $(builddir)/_build$(extensiondir); \
	cp "$(srcdir)/COPYING" -t $(builddir)/_build$(extensiondir); \
	cp "$(srcdir)/README" -t $(builddir)/_build$(extensiondir); \
	[ -d "$(builddir)/_build$(localedir)" ] && cp -a "$(builddir)/_build$(localedir)" -t $(builddir)/_build$(extensiondir); \
	(cd "$(builddir)/_build$(extensiondir)"; \
	 zip -qr "$(abs_builddir)/zip-files/gnome-shell-extension-$(extension_name)" .; \
	); \
	rm -fR $(builddir)/_build

localprefix = $(HOME)/.local/share/gnome-shell/extensions

local-install: zip-file
	long_name=gnome-shell-extension-$(extension_name); \
	if [ -d "$(localprefix)/${uuid}" ]; then \
	rm -fR "$(localprefix)/${uuid}"; \
	fi; \
	$(MKDIR_P) $(localprefix)/${uuid}; \
	pushd $(localprefix)/${uuid}; \
	echo $(zip_file); \
	unzip -q "$(abs_builddir)/zip-files/gnome-shell-extension-$(extension_name)"; \
	popd

clean-local:
	-rm -rf zip-files ; \
	rm -f po/*.gmo

