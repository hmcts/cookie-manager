import Cookie from '../models/cookie';
import ManifestHandler from './manifestHandler';
import UserPreferences from './userPreferencesHandler';
import Config from '../models/config';

export default class CookieHandler {
    constructor (
        private readonly config: Config,
        private readonly manifestHandler: ManifestHandler,
        private readonly userPreferences: UserPreferences
    ) {}

    processCookies () {
        if (this.config.shouldDeleteUncategorized()) {
            this._processUnCategorizedCookies();
        }
        this._processNonConsentedCookies();
    }

    _processNonConsentedCookies () {
        console.debug('Deleting non-consented cookies');
        CookieHandler.getAllCookies().filter(cookie => {
            const category = this.manifestHandler.getCategoryByCookieName(cookie.getName());
            return category.getName() !== ManifestHandler.DEFAULTS.UNDEFINED_CATEGORY_NAME &&
                    category.isOptional() &&
                    !this.userPreferences.getPreferences()[category.getName()];
        }).forEach(cookie => cookie.disable());
    }

    _processUnCategorizedCookies () {
        console.debug('Deleting non-categorized cookies');

        CookieHandler.getAllCookies().filter(cookie => {
            const cookieCategory = this.manifestHandler.getCategoryByCookieName(cookie.getName());
            return cookieCategory.getName() === ManifestHandler.DEFAULTS.UNDEFINED_CATEGORY_NAME;
        }).forEach(cookie => cookie.disable());
    }

    static getAllCookies (): Cookie[] {
        return decodeURIComponent(document.cookie)
            .split(';')
            .filter(cookie => cookie.length)
            .map(cookie => {
                const components = cookie.split(/=(.*)/s);
                return new Cookie(components[0].trim(), components[1].trim());
            });
    }

    static getCookie (cookieName: string) {
        return CookieHandler.getAllCookies().find(cookie => cookie.getName() === cookieName);
    }
}
