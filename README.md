# Jamsite

Jamsite - JAMstack framework where static goes dynamic.

## Overview

This package is intended only for production use: runtime serving site or static files generation. Use [@jamsite/jamsite-dev](https://www.npmjs.com/package/@jamsite/jamsite-dev) for development mode.

## Usage

Jamsite must be installed locally `npm install @jamsite/jamsite` or globally `npm install -g @jamsite/jamsite`.

Execute jamsite-prod in a folder with site template (e.g. https://github.com/jamsite/brewing-starter-site):

`npx jamsite-prod`

Open url from output in a browser:

`jamsite: Accepting connections on http://127.0.0.1:3000`

## TODO

- :heavy_check_mark: implement frontmatter rewrite rules handling
- :heavy_check_mark: implement custom destination file path handling
- :heavy_check_mark: impement multifile handling
- :heavy_check_mark: setup test system
- :heavy_check_mark: support for api and file system routing
- :heavy_check_mark: use micro programmatically
- :heavy_check_mark: split jamsite and jamsite-dev
- :heavy_check_mark: pluggable server middleware (gzip, html minification, etc)
- :heavy_check_mark: static templates (dynamic frontmatter, but static page content)
- :heavy_check_mark: support toml for data-static files
- environment aware configuration system
- custom error pages
- save generated pages as static files
- i18n concept (locale aware templates, locale aware data)
- fix premature ready event in chokidar
- pluggable data sources
