import { EventProcessor } from './EventHandler';

export default class CookieBannerHandler {
    static DEFAULTS = {
        ACCEPT_BUTT0N_CLASS: 'cookie-banner-accept',
        REJECT_BUTT0N_CLASS: 'cookie-banner-reject',
        HIDE_BUTT0N_CLASS: 'cookie-banner-hide',
        MESSAGE_CLASS: 'cookie-banner-message',
        ACCEPT_MESSAGE_CLASS: 'cookie-banner-accept-message',
        REJECT_MESSAGE_CLASS: 'cookie-banner-reject-message'
    }

    constructor (Config, UserPreferencesHandler) {
        this._config = Config;
        this._userPreferencesHandler = UserPreferencesHandler;
    }

    init () {
        if (document.readyState === 'loading') {
            console.debug('DOM is not ready; adding event to bind to banner when ready.');
            document.addEventListener('DOMContentLoaded', () => this.init());
            return;
        }

        const preferencesForm = document.getElementById(this._config.getPreferencesFormId());

        if (this._getBannerNode() && !preferencesForm && !this._userPreferencesHandler.getPreferenceCookie()) {
            this._setupEventListeners();
            this._getBannerNode().hidden = false;
            EventProcessor.emit('CookieBannerInitialized');
        }
    }

    _setupEventListeners () {
        const buttonClasses = [
            CookieBannerHandler.DEFAULTS.ACCEPT_BUTT0N_CLASS,
            CookieBannerHandler.DEFAULTS.REJECT_BUTT0N_CLASS,
            CookieBannerHandler.DEFAULTS.HIDE_BUTT0N_CLASS
        ];

        this._getBannerNode()
            .querySelectorAll('.' + buttonClasses.join(', .'))
            .forEach(button => button.addEventListener('click', (event) => this._clickEventHandler(event, button)));
    };

    _clickEventHandler (event, button) {
        event.preventDefault();
        const bannerNode = this._getBannerNode();

        if (button.classList.contains(CookieBannerHandler.DEFAULTS.HIDE_BUTT0N_CLASS)) {
            bannerNode.hidden = true;
        } else {
            const consent = button.classList.contains(CookieBannerHandler.DEFAULTS.ACCEPT_BUTT0N_CLASS);
            EventProcessor.emit('CookieBannerSubmitted', (consent));

            this._updatePreferences(consent);
            bannerNode.querySelector('.' + CookieBannerHandler.DEFAULTS.MESSAGE_CLASS).hidden = true;
            bannerNode.querySelector('.' + CookieBannerHandler.DEFAULTS.ACCEPT_MESSAGE_CLASS).hidden = !consent;
            bannerNode.querySelector('.' + CookieBannerHandler.DEFAULTS.REJECT_MESSAGE_CLASS).hidden = consent;
        }
    }

    _updatePreferences (consent) {
        const preferences = this._userPreferencesHandler.getPreferences();
        Object.keys(preferences).forEach(category => { preferences[category] = consent; });

        this._userPreferencesHandler.setPreferences(preferences);
        this._userPreferencesHandler.savePreferencesToCookie();
    }

    _getBannerNode () {
        return document.getElementById(this._config.getCookieBannerId());
    };
}
