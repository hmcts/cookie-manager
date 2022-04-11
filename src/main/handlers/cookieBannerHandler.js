import { EventProcessor } from './EventHandler';

export default class CookieBannerHandler {
    constructor (Config, UserPreferencesHandler, CookieHandler) {
        this._config = Config;
        this._userPreferencesHandler = UserPreferencesHandler;
        this._cookieHandler = CookieHandler;
    }

    init () {
        if (document.readyState === 'loading') {
            console.debug('DOM is not ready; adding event to bind to banner when ready.');
            document.addEventListener('DOMContentLoaded', () => this.init());
            return;
        }

        const preferencesForm = document.querySelector('.' + this._config.getPreferencesFormClass());

        if (this._getBannerNode() && !preferencesForm && !this._userPreferencesHandler.getPreferenceCookie()) {
            this._setupEventListeners();
            this._getBannerNode().hidden = false;
            EventProcessor.emit('CookieBannerInitialized');
        }
    }

    _setupEventListeners () {
        const actions = this._config.getCookieBannerConfiguration()?.actions;
        if (actions) {
            actions.forEach(action => {
                const element = this._getBannerNode().querySelector('.' + action.buttonClass);
                if (element) {
                    element.addEventListener('click', (event) => {
                        this._clickEventHandler(event, action.name, action.confirmationClass, action.consentCategories);
                    });
                }
            });
        }
    };

    _clickEventHandler (event, name, confirmationClass, consentCategories) {
        event.preventDefault();
        EventProcessor.emit('CookieBannerAction', name);

        if (confirmationClass) {
            [...this._getBannerNode().children]
                .forEach(child => {
                    child.hidden = !child.classList.contains(confirmationClass);
                });
        } else {
            this._getBannerNode().hidden = true;
        }

        if (consentCategories !== undefined) {
            const preferences = this._userPreferencesHandler.getPreferences();
            // If set to TRUE (consent all) or FALSE (reject all)
            if (typeof consentCategories === 'boolean') {
                Object.keys(preferences).forEach(category => { preferences[category] = consentCategories; });
            }

            // If is array of categories
            if (Array.isArray(consentCategories)) {
                consentCategories.forEach(category => { preferences[category] = true; });
            }

            this._updatePreferences(preferences);
        }
    }

    _updatePreferences (preferences) {
        this._userPreferencesHandler.setPreferences(preferences);
        this._userPreferencesHandler.savePreferencesToCookie();
        this._cookieHandler.processCookies();
    }

    _getBannerNode () {
        return document.querySelector('.' + this._config.getCookieBannerConfiguration()?.class);
    };
}
