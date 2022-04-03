// Buttons
const ACCEPT_BUTT0N_CLASS   = 'cookie-banner-accept';
const REJECT_BUTT0N_CLASS   = 'cookie-banner-reject';
const HIDE_BUTT0N_CLASS     = 'cookie-banner-hide';

// Message wrappers
const MESSAGE_CLASS         = 'cookie-banner-message';
const ACCEPT_MESSAGE_CLASS  = 'cookie-banner-accept-message';
const REJECT_MESSAGE_CLASS  = 'cookie-banner-reject-message';

export default function CookieBannerHandler (Config, UserPreferencesHandler) {
    this._Config = Config;
    this._UserPreferencesHandler = UserPreferencesHandler;
}

CookieBannerHandler.prototype.init = function () {
    if(this.getBannerNode() && !this._UserPreferencesHandler.getPreferenceCookie()) {
        this.setupEventListeners();
        this.getBannerNode().hidden = false;
    }
}

CookieBannerHandler.prototype.setupEventListeners = function () {
    this.getBannerNode()
        .querySelectorAll('button')
        .forEach(button => button
            .addEventListener('click', this.clickEventHandler)
        );
};

CookieBannerHandler.prototype.clickEventHandler = function (event) {
    event.preventDefault();
    const button = event.target;

    if(button.classList.contains(HIDE_BUTT0N_CLASS)) {
        this.getBannerNode().hidden = true;
    } else {
        const consent = button.classList.contains(ACCEPT_BUTT0N_CLASS)
        this.updatePreferences(consent);
        this.getBannerNode().querySelector('.' + MESSAGE_CLASS).hidden = true;
        this.getBannerNode().querySelector('.' + ACCEPT_MESSAGE_CLASS).hidden = consent;
        this.getBannerNode().querySelector('.' + REJECT_MESSAGE_CLASS).hidden = !consent;
    }
}

CookieBannerHandler.prototype.updatePreferences = function (consent) {
    const preferences = this._UserPreferencesHandler.getPreferences();
    Object.keys(preferences).forEach(category => preferences[category] = consent);

    this._UserPreferencesHandler.setPreferences(preferences);
    this._UserPreferencesHandler.savePreferencesToCookie();
}

CookieBannerHandler.prototype.getBannerNode = function() {
    return document.getElementById(this._Config.getCookieBannerId());
};