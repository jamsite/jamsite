# Jamsite

Jamsite - JAMstack framework where static goes dynamic.

## Principles

- Deterministic. Same input same output.
- It is all about static files. Results are deployable to static site hosting platforms.
- Generates pages from templates by using content - not from content by using templates.
- Designed to be served via reverse proxy/CDN.
- Micro runtime.
- Pluggable architecture.

## TODO

- :heavy_check_mark: implement frontmatter rewrite rules handling
- :heavy_check_mark: implement custom destination file path handling
- :heavy_check_mark: impement multifile handling
- :heavy_check_mark: setup test system
- :heavy_check_mark: support for api and file system routing
- use micro programmatically
- environment aware configuration system
- fix premature ready event in chokidar
- static templates (dynamic frontmatter, but static page content)
- pluggable template engine
- pluggable data sources
- pluggable asset bundler
- pluggable server middleware (gzip, html minification, etc)
- dev mode custom error page with mini tutorial
- i18n concept (locale aware templates, locale aware data)
- support toml for data-static files
- dev api, e.g. create new page interface from default 404 page
- custom error pages
- split jamsite and jamsite-dev
