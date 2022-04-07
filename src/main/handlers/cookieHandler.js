import Cookie from '../models/cookie';
import ManifestHandler from './manifestHandler';

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
        CookieHandler.getAllCookies().filter(cookie => {
            const category = this._manifestHandler.getCategoryByCookieName(cookie.getName());
            return category.getName() !== ManifestHandler.DEFAULTS.UNDEFINED_CATEGORY_NAME &&
                    category.isOptional() &&
                    !this._userPreferences.getPreferences()[category.getName()];
        }).forEach(cookie => cookie.disable());
    }

    _processUnCategorizedCookies () {
        console.debug('Deleting non-categorized cookies');

        CookieHandler.getAllCookies().filter(cookie => {
            const cookieCategory = this._manifestHandler.getCategoryByCookieName(cookie.getName());
            return cookieCategory.getName() === ManifestHandler.DEFAULTS.UNDEFINED_CATEGORY_NAME;
        }).forEach(cookie => cookie.disable());
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
