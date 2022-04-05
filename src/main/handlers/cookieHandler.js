import Cookie from '../models/cookie';

export default class CookieHandler {
    constructor (Config, ManifestHandler, UserPreferences) {
        this._config = Config;
        this._manifestHandler = ManifestHandler;
        this._userPreferences = UserPreferences;
    };

    processCookies () {
        if (this._config.shouldDeleteUncategorized()) {
            this._processUnCategorizedCookies();
        }
        this._processNonConsentedCookies();
    }

    _processNonConsentedCookies () {
        console.debug('Deleting non-consented cookies');
        Object.values(CookieHandler.getAllCookies())
            .filter(cookie => {
                const category = this._manifestHandler.getCategoryByCookieName(cookie.getName());
                return category.getName() !== 'un-categorized' && category.isOptional() && !this._userPreferences.getPreferences()[category.getName()];
            })
            .forEach(cookie => cookie.disable());
    }

    _processUnCategorizedCookies () {
        console.debug('Deleting un-categorized cookies');
        Object.values(CookieHandler.getAllCookies())
            .filter(cookie => this._manifestHandler.getCategoryByCookieName(cookie.getName()).getName() === 'un-categorized')
            .forEach(cookie => { cookie.disable(); });
    }

    static getAllCookies () {
        return decodeURIComponent(document.cookie)
            .split(';')
            .filter(cookie => cookie.length)
            .map(cookie => {
                const components = cookie.split(/=(.*)/s);
                return new Cookie(components[0].trim(), components[1].trim());
            });
    }

    static getCookie (cookieName) {
        return CookieHandler.getAllCookies().find(cookie => cookie.getName() === cookieName);
    }
}
