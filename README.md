# jamsite

Jamsite - JAMstack framework where static goes dynamic.

## Overview

This package is intended for production use only: jamsite server or static files generation.

See [@jamsite/jamsite-dev](https://www.npmjs.com/package/@jamsite/jamsite-dev) for development mode.

## Usage

Install `jamsite-cli` globally with `npm i -g @jamsite/jamsite-cli`.

Execute `jamsite start` in a folder with site template (e.g. https://github.com/jamsite/site-starter-hello-world):

`% jamsite start`

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
- :heavy_check_mark: windows support
- :heavy_check_mark: pluggable core
- environment aware configuration system
- custom error pages
- save generated pages as static files
- i18n concept (locale aware templates, locale aware data)
- fix premature ready event in chokidar

## Performance

```bash
% ./test-performance.sh
Running 40s test @ http://127.0.0.1:3000/hello-world.html
100 connections with 10 pipelining factor

┌─────────┬──────┬──────┬───────┬───────┬─────────┬─────────┬───────────┐
│ Stat    │ 2.5% │ 50%  │ 97.5% │ 99%   │ Avg     │ Stdev   │ Max       │
├─────────┼──────┼──────┼───────┼───────┼─────────┼─────────┼───────────┤
│ Latency │ 0 ms │ 0 ms │ 12 ms │ 13 ms │ 1.22 ms │ 3.67 ms │ 100.33 ms │
└─────────┴──────┴──────┴───────┴───────┴─────────┴─────────┴───────────┘
┌───────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┬─────────┐
│ Stat      │ 1%      │ 2.5%    │ 50%     │ 97.5%   │ Avg     │ Stdev   │ Min     │
├───────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ Req/Sec   │ 61663   │ 61663   │ 79167   │ 79743   │ 78612.4 │ 2769.29 │ 61650   │
├───────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┼─────────┤
│ Bytes/Sec │ 9.44 MB │ 9.44 MB │ 12.1 MB │ 12.2 MB │ 12 MB   │ 424 kB  │ 9.43 MB │
└───────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┴─────────┘

Req/Bytes counts sampled once per second.

3144k requests in 40.05s, 481 MB read
```
