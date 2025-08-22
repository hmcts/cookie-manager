# Changelog

## 1.1.0

### Fixes
- Fix an issue with TypeScript definitions not exporting the default type correctly

### Changes
- Update dependencies to their latest versions
- Switch from jest to vitest

## 1.0.0
**WARNING: This releases includes breaking change.
You will need to follow the [setup guide](https://hmcts.github.io/cookie-manager/google-analytics-and-dynatrace-setup/index.html)
to continue using future versions of this module with your application.**


### Fixes
- Improves support for services which are proviced in multiple languanges
- Fixes IE11 issues
- Browser script version not being minified

### Changes
- Total re-write to use TypeScript and provide TypeScript declarations/types
- Support for more varied configurations (including choosing how cookies are matched, defining staging/actions of cookie banner etc.)
- Module now uses Rollup.js to provide package build and browser build of module
- Support for additional overrides
- Totallly new docs and README which go into much more detail on how to setup and initialize module, found [here](https://hmcts.github.io/cookie-manager/)
- Improved size when GZIP'd (now zips down to ~4KB).
