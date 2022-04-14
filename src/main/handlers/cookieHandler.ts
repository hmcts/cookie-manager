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
        CookieHandler.getAllCookies()
            .filter(cookie => {
                const category = this.manifestHandler.getCategoryByCookieName(cookie.getName());
                return category.getName() !== ManifestHandler.DEFAULTS.UNDEFINED_CATEGORY_NAME &&
                    category.isOptional() &&
                    !this.userPreferences.getPreferences()[category.getName()];
            })
            .forEach(cookie => CookieHandler.deleteCookie(cookie));
    }

    _processUnCategorizedCookies () {
        console.debug('Deleting non-categorized cookies');
        CookieHandler.getAllCookies()
            .filter(cookie => this.manifestHandler.getCategoryByCookieName(cookie.getName()).getName() === ManifestHandler.DEFAULTS.UNDEFINED_CATEGORY_NAME)
            .forEach(cookie => CookieHandler.deleteCookie(cookie));
    }

    static getAllCookies (): Cookie[] {
        return decodeURIComponent(document.cookie)
            .split(';')
            .map(cookie => cookie.trim())
            .filter(cookie => cookie.length)
            .map(cookie => {
                const cookieComponents = cookie.split(/=(.*)/).map(component => component.trim());
                return new Cookie(cookieComponents[0], cookieComponents[1]);
            });
    }

    static getCookie (name: string) {
        return CookieHandler.getAllCookies().filter(cookie => cookie.getName() === name)[0];
    }

    static saveCookie (cookie: Cookie, expiry?: number, secure?: boolean) {
        const date = new Date();
        date.setDate(date.getDate() + expiry);

        let cookieString = cookie.getName() + '=';
        cookieString += typeof cookie.getValue() === 'object' ? JSON.stringify(cookie.getValue()) : cookie.getValue();
        cookieString += expiry ? ';expires=' + date.toUTCString() : '';
        cookieString += secure ? ';secure' : '';
        cookieString += ';path=/;';

        document.cookie = cookieString;
        console.debug(`Saved '${cookie.getName()}' cookie`);
    }

    static deleteCookie (cookie: Cookie) {
        console.debug('Deleting cookie: ' + cookie.getName());

        const hostname = window.location.hostname;
        const upperDomain = hostname.substring(hostname.indexOf('.'));
        const expires = new Date(-1).toUTCString();

        [hostname, '.' + hostname, upperDomain, '.' + upperDomain].forEach(domain => {
            document.cookie = cookie.getName() + '=;expires=' + expires + ';domain=' + domain + ';path=/;';
        });
    }
}
