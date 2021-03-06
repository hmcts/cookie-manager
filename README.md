Cookie Manager ·
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://github.com/hmcts/cookie-manager/actions/workflows/test.yml/badge.svg)](https://www.github.com/hmcts/cookie-manager)
[![Known Vulnerabilities](https://snyk.io/test/github/hmcts/cookie-manager/badge.svg)](https://snyk.io/test/github/hmcts/cookie-manager)
======

@hmcts/cookie-manager is a JavaScript library for dealing with cookie compliance.

It provides a streamline way to define essential and non-essential cookies on a service,
which then acts as a basis for user’s to provide consent for each different category of cookie.
The minified script is just under 4KB (after GZIP) and supports IE11 / ES5 by default.

This library is intended to be used with the [GDS Cookie Banner component](https://design-system.service.gov.uk/components/cookie-banner/)
though it can be configured to support a variety of multi-stage cookie banners of varying designs. 

**In-depth documentation on all configuration options, emitted events, configuration with common analytics
libraries and more can be [found on the project's documentation site](https://hmcts.github.io/cookie-manager/).**

## Quick start

### Installing the library
There are 2 main ways to start using the Cookie Manager library within your app:

#### 1. Install with NPM (recommended)

   We recommend [installing cookie-manager through Node's package
manager (NPM) or Yarn](https://hmcts.github.io/cookie-manager/getting-started/install-using-nodejs/).

#### 2. Install using compiled script

   You can also install cookie-manager by [serving our compiled JavaScript
file](https://hmcts.github.io/cookie-manager/getting-started/install-using-script-tag/)
(included on each [release](https://github.com/hmcts/cookie-manager/releases/latest)).

### Configuring and initializing the library for your service
Once you've included the library within your app, you can begin
configuring it for use within your service. See our documentation
on [configuring and initializing](https://hmcts.github.io/cookie-manager/getting-started/configuring-the-library/index.html#configuring-and-initializing-the-library/),
or learn more about the [configuration options](https://hmcts.github.io/cookie-manager/configuration-options/) available.

## Features

### Cookie banner support
By default, the Cookie Manager library is configured to display or hide a cookie banner configured
within your service. Without any extra configuration, the library is configured out-of-the-box to work
with the [template provided within our documentation](https://hmcts.github.io/cookie-manager/cookie-banner/#html-nunjucks-template).

In short, the library works by binding event listeners to the buttons defined for each action, with these
[actions being specified within the config](https://hmcts.github.io/cookie-manager/configuration-options/cookie-banner/#action).
Each action defines:

- How consent should be affected
- What confirmation message should be shown

#### An example action of an action and how it works:

```json
{
  "name": "accept",
  "buttonClass": "cookie-banner-accept-button",
  "confirmationClass": "cookie-banner-accept-message",
  "consent": true
}
```
This action specifies that upon an element with the class `cookie-banner-accept-button` (within the cookie banner) being clicked:

1. We consent to all optional cookie categories.
2. Any elements with the class `cookie-banner-accept-message` (within the cookie banner) should be shown.
3. A `CookieBannerAction` event is then emitted with the activated action's name (in this case, 'accept') being passed to any listening callbacks.

More information about how the cookie banner functionality and how it can be configured
to support a variety of different action/message (stage-based) cookie banners can be [found
within the docs](https://hmcts.github.io/cookie-manager/configuration-options/cookie-banner/).


### Cookie preferences form support
The Cookie Manager library is also, by default, setup to parse a cookie preference form which allows a user
to set their cookie preferences in a fine-grained manner. The default configuration
is built to work with the [template provided within our documentation](https://hmcts.github.io/cookie-manager/cookie-preferences-form/#html-nunjucks-template).

In short, on the form submission event:

1. The radio groups within the form are parsed.
2. Each selected option is matched to a cookie category (based on the radio element's `name` attribute).
3. The consent value for the selected option is derived from the radio element's `value` attribute, which should be either `on` or `off`.
4. The selected options are then set as user's active cookie preferences.

The form layout needs to be configured for each different cookie category you are utilising within your service.
This requires you to add another set of radio inputs, with the `name` attribute set to that of your cookie category,
using `on`/`off` as their values for consent / reject respectively.

More information about the cookie preferences form functionality and how it can be configured can be [found
within the docs](https://hmcts.github.io/cookie-manager/configuration-options/cookie-preferences-form/).

### Emitting events and callbacks
When an important event occurs within @hmcts/cookie-manger, an event is emitted by the library. 
Utilising the exported `on` and `off` [functions](https://hmcts.github.io/cookie-manager/listenining-to-cookie-manager-events/#listener-functions) from the library, you can easily add callbacks to each event which fires. 
This could be used to disable a third party analytics package, conditionally change the DOM etc.

```js
import cookieManager from '@hmcts/cookie-manager';

const someEventCallback = function (eventData) { ... };
cookieManager.on('<EVENT-NAME-HERE>', someEventCallback);
```

More information about the built-in event processor / emitter can be [found
within the project's documentation](https://hmcts.github.io/cookie-manager/listenining-to-cookie-manager-events/index.html#events-and-listeners).

A list of the events fired by the Cookie Manager library can also be [found here](https://hmcts.github.io/cookie-manager/listenining-to-cookie-manager-events/#events-list).

You can also see an example of this used to enable / disable Google Analytics (through GTM) and 
Dynatrace RUM based on user preferences [here within the docs](https://hmcts.github.io/cookie-manager/google-analytics-and-dynatrace-setup/#1-add-the-library-and-some-event-listeners).

## Configuration
Configuration of the library is done through a config provided to the exposed `init` function
used when initializing the library. The default configuration is:
```json
{
    "userPreferences": {
        "cookieName": "cookie-preferences",
        "cookieExpiry": 365,
        "cookieSecure": false
    },
    "preferencesForm": {
        "class": "cookie-preferences-form"
    },
    "cookieBanner": {
        "class": "cookie-banner",
        "showWithPreferencesForm": false,
        "actions": [
            {
                "name": "accept",
                "buttonClass": "cookie-banner-accept-button",
                "confirmationClass": "cookie-banner-accept-message",
                "consent": true
            },
            {
                "name": "reject",
                "buttonClass": "cookie-banner-reject-button",
                "confirmationClass": "cookie-banner-reject-message",
                "consent": false
            },
            {
                "name": "hide",
                "buttonClass": "cookie-banner-hide-button"
            }
        ]
    },
    "cookieManifest": [],
    "additionalOptions": {
       "defaultConsent": false,
       "deleteUndefinedCookies": false,
       "disableCookieBanner": false,
       "disableCookiePreferencesForm": false
    }
}
```

See our documentation to learn more about [configuring and initializing the library](https://hmcts.github.io/cookie-manager/getting-started/configuring-the-library/index.html#configuring-and-initializing-the-library/),
or to view the other [configuration options](https://hmcts.github.io/cookie-manager/configuration-options/) available. 
The provided templates/examples within the documentation are intended to require little extra
configuration to get a basic cookie compliance solution working on your service.

**Note: Cookie Manager will attempt to validate the config passed to it on initialization. 
If any malformed, missing properties etc. are supplied, the library will be disabled until it is resolved. 
A warning will be printed in the console alerting of the problematic property.**

## Development
### Building

There are currently 2 seperate build options for this library
- `build:package` - builds the `esm` version of the module, intended to be used with NodeJS based applications.
Includes TS declarations / typings and JSDoc comments on exposed functions.
- `build:browser` - builds the `umd` version of this module, intended for use directly within browsers (script tag).
Builds a minified version of the library.

Both builds use [rollup.js](https://github.com/rollup/rollup) and a number of plugins
to compile, minify, and create declarations for the library.

### Dependencies
This project currently only uses dependencies for linting and building the project.

### Using within your project
Follow the setup guide on installing and initializing the module within NodeJS,
this project provides type declarations built in, so for projects using TypeScript,
you should see typings support.

## Testing
To run the tests run `npm run test` or to see the coverage, `npm run test:coverage`.

As of v1.0.0 of this library, there are over 110 unit tests with a coverage of around 95%.
Manual testing has also been performed across most major browsers, including IE11.

**Note: The unit tests will fail if coverage is found to be below 90%.**

## Authors
[Thomas Geraghty](https://github.com/Thomas-Geraghty)

[Linus Norton](https://github.com/linusnorton) - Additional support

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
