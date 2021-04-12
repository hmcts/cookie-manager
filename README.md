# Cookie Manager

Cookie Manager is a Javascript library for dealing with cookie compliance.

It can handle removing cookies which the user does not consent to or those that are not defined in the manifest.
It can also handle the storing of user preferences when it comes to cookies, and includes the functionality to display a banner when no
preferences have been set.

This repo is based on the fantastic work of the DVSA team and their Cookie Manager, [found here](https://github.com/dvsa/cookie-manager).
This fork is modified to work with accept-reject style banners, and also those which have hide/dismiss functionality. Preferably to be used in conjuction with the [GDS Cookie Banner component](https://design-system.service.gov.uk/components/cookie-banner/).

## Installation

NPM

```bash
//TODO: ADD NPM REPO AND PROPER VERSIONING
npm install github:hmcts/cookie-manager#master
```

## Usage

Include the `cookie-manager.js` script on your web pages:

```html
<script src="./cookie-manager.js"></script>
```

Invoke the Cookie Manager by calling init() with a config:

```javascript
cookieManager.init(configuration_object);
```

### Feature: Cookie Banner

To disable this functionality, set the configuration value of `cookie-banner-id` to `false` or remove the definition.

If you want functionality to display a cookie banner when user preferences have not been set (or expired)
then build your cookie banner markup, and give the wrapping element an ID and match it with the configuration value
`cookie-banner-id`. 

This library will automatically bind to the accept and reject buttons nested within the banner element. 
For matching these buttons to their respective action, both options must be a `button` element with the 
data attribute `data-cm-action` set to `accept` or `reject`. 
This will opt-in or opt-out respectively of any optional cookie categories defined in the configuration. 
Furthermore, a call will be made to the respective callback (`cookie-banner-accept-callback` 
or `cookie-banner-reject-callback`) if also set in the config.


```html
<header id="cookie_banner" hidden>
    <h2>Tell us whether you accept cookies</h2>
    <p>We use cookies to collect information about how you use GOV.UK.</p>
    <p>We use this information to make the website work as well as possible and improve government services.</p>
    <div class="govuk-button-group">
        <button data-cm-action="accept">Accept analytics cookies</button>
        <button data-cm-action="reject">Reject analytics cookies</button>
        <a class="govuk-link" href="/">View cookies</a>
    </div>
    <button data-cm-action="hide">Hide this message</button>
</header>
```

If the `cookie-banner-auto-hide` option is set to `true`, upon clicking either of the accept or reject buttons, the banner will automatically hide itself.
If set to `false` the banner will stay visible, i.e. allowing for a confirmation message that cookie preference has been acknowledged.

The library can also be binded to a hide/dismiss button for hiding the banner from the user. This button must be a
nested element of `button` within the banner, with the data attribute `data-cm-action` set to `hide`.

### Feature: User Preferences Saving

To disable this functionality, set the configuration value of `user-preference-configuration-form-id` to `false` or remove the definition.

If you want functionality to setup a user preference cookie, then you need to define a HTML form with an ID and match
that to the configuration value `user-preference-configuration-form-id`. Upon initialisation, the library will look
for the form when the DOM is ready, and bind to the `submit` event. When submitted, the library will collect the
value of all radio buttons with the `checked` state. The name of the radio buttons **must**
reflect the category name for cookies defined in your manifest. The values for the radio buttons must be `on` and `off`.

```html
<form id="cm_user_preference_form">
    <fieldset>
        <legend>Analytics:</legend>
        <input type="radio" name="analytics" value="on" /> On <br/>
        <input type="radio" name="analytics" value="off" checked /> Off <br/>
    </fieldset>

    <fieldset>
        <legend>Feedback:</legend>
        <input type="radio" name="feedback" value="on" /> On <br/>
        <input type="radio" name="feedback" value="off" checked /> Off <br/>
    </fieldset>

    <input type="submit" value="Save Preferences"/>
</form>
```


## Configuration

Configuration is done when calling `init()` on the Cookie Manager object and is used to determine how you want the
Cookie Manager to behave, and defines a manifest of cookies used on your site.

Using this method, it allows developers to use the native configuration in their application and it should be as
simple as serialising the top-level configuration object/array for Cookie Manager to JSON and putting the result into
the init() function (either as a variable or directly):


```javascript
cm.init(
    {
        "delete-undefined-cookies": true,
        "...": "..."
    }
);
```

### Configuration Schema

###
```json
{
  "delete-undefined-cookies": true,
  "user-preference-cookie-name": "cm-user-preferences",
  "user-preference-cookie-secure": false,
  "user-preference-saved-callback" : false, //accept a function
  "user-preference-cookie-expiry-days": 365,
  "user-preference-configuration-form-id": "cookie-manager-form",
  "cookie-banner-id": "cm_cookie_notification",
  "cookie-banner-visible-on-page-with-preference-form": false,
  "cookie-banner-saved-callback": false, //accept a function
  "cookie-banner-accept-callback": false, //accept a function
  "cookie-banner-reject-callback": false, //accept a function
  "cookie-banner-auto-hide": true,
  "set-checkboxes-in-preference-form": true,
  "cookie-manifest": [
    {
      "category-name": "essential",
      "optional": false,
      "cookies": [
        "essential-cookie",
        "another-essential-cookie",
        "some-imperva-cookie",
        "some-other-imperva-cookie"
      ]
    },
    {
      "category-name": "analytics",
      "optional": true,
      "cookies": [
        "_ga",
        "_gtm"
      ]
    },
    {
      "category-name": "feedback",
      "optional": true,
      "cookies": [
        "_hotjar",
        "_surveything"
      ]
    }
  ]
}
```

## Development
### Unit tests
The Unit Test will fail if the coverage is below 80%. To run the tests run `npm run test` or `npm run test-html`.

#### HTML
Running `npm run test-html` will generate a nice html output for the unit tests and coverage in `/test` and `/coverage` respectivly.


## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
