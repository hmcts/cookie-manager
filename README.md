Cookie Manager ·
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://github.com/hmcts/cookie-manager/actions/workflows/test.yml/badge.svg)](https://www.github.com/hmcts/cookie-manager)
[![Known Vulnerabilities](https://snyk.io/test/github/hmcts/cookie-manager/badge.svg)](https://snyk.io/test/github/hmcts/cookie-manager)
======

@hmcts/cookie-manager is a JavaScript library for dealing with cookie compliance.

It provides a streamline way to define essential and non-essential cookies on a service,
which then acts as a basis for user’s to provide consent for each different category of cookie.

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
Each action defines how consent should be affected, and what confirmation message should be shown, when the action's button is clicked. An example of 
action is shown below:

```json
{
  "name": "accept",
  "buttonClass": "cookie-banner-accept-button",
  "confirmationClass": "cookie-banner-accept-message",
  "consent": true
}
```
*This action specifies that on an element with the class `cookie-banner-accept-button` (within the cookie banner) being clicked, we
consent to all optional cookie categories, and that any elements with the class `cookie-banner-accept-message`*  (within the cookie banner)
should be shown.

More information about how the cookie banner functionality and how it can be configured
to support a variety of different action/message (stage-based) cookie banners can be [found
within the docs](https://hmcts.github.io/cookie-manager/configuration-options/cookie-banner/).

***Note: To disable the cookie banner functionality, set the value of configuration property `cookieBanner` to `false` when
initializing the library.***


### Cookie preferences form support
The Cookie Manager library is also, by default, setup to parse a cookie preference form which allows a user
to set their cookie preferences in a fine-grained manner. The default configuration
is built to work with the [template provided within our documentation](https://hmcts.github.io/cookie-manager/cookie-preferences-form/#html-nunjucks-template).

The form layout needs to be configured for each different cookie category you are utilising within your service.
This requires you to add another set of radio inputs, with the `name` attribute set to that of your cookie category,
using `on`/`off` as their values for consent / reject respectively.

More information about the cookie preferences form functionality and how it can be configured can be [found
within the docs](https://hmcts.github.io/cookie-manager/configuration-options/cookie-preferences-form/).

***Note: To disable the cookie banner functionality, set the value of configuration property `cookieBanner` to `false` when
initializing the library.***

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
        "deleteUndefinedCookies": true,
        "defaultConsent": false
    }
}
```

See our documentation to learn more about [configuring and initializing the library](https://hmcts.github.io/cookie-manager/getting-started/configuring-the-library/index.html#configuring-and-initializing-the-library/),
or to view the other [configuration options](https://hmcts.github.io/cookie-manager/configuration-options/) available. 
The provided templates/examples within the documentation are intended to require little extra
configuration to get a basic cookie compliance solution working on your service.


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

## Testing
To run the tests run `npm run test` or to see the coverage, `npm run test:coverage`.

As of v1.0.0 of this library, there are over 110 unit tests with a coverage of around 95%.
Manual testing has also been performed across most major browsers, including IE11.

**Note: The unit tests will fail if coverage is found to be below 90%.**

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
