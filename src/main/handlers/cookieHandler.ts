import ManifestHandler from './manifestHandler';
import UserPreferences from './userPreferencesHandler';
import { Cookie } from '../interfaces/Cookie';
import { CookieManagerConfig } from '../interfaces/Config';

export default class CookieHandler {
    constructor (
        private readonly config: CookieManagerConfig,
        private readonly manifestHandler: ManifestHandler,
        private readonly userPreferences: UserPreferences
    ) {}

    processCookies () {
        if (this.config.additionalOptions.deleteUndefinedCookies) {
            this._processUnCategorizedCookies();
        }
        this._processNonConsentedCookies();
    }

    _processNonConsentedCookies () {
        console.debug('Deleting non-consented cookies');
        CookieHandler.getAllCookies()
            .filter(cookie => {
                const category = this.manifestHandler.getCategoryByCookieName(cookie.name);
                return category.name !== ManifestHandler.DEFAULTS.UNDEFINED_CATEGORY_NAME &&
                    category.optional &&
                    !this.userPreferences.getPreferences()[category.name];
            })
            .forEach(cookie => CookieHandler.deleteCookie(cookie));
    }

    _processUnCategorizedCookies () {
        console.debug('Deleting non-categorized cookies');
        CookieHandler.getAllCookies()
            .filter(cookie => this.manifestHandler.getCategoryByCookieName(cookie.name).name === ManifestHandler.DEFAULTS.UNDEFINED_CATEGORY_NAME)
            .forEach(cookie => CookieHandler.deleteCookie(cookie));
    }

    static getAllCookies (): Cookie[] {
        return decodeURIComponent(document.cookie)
            .split(';')
            .map(cookie => cookie.trim())
            .filter(cookie => cookie.length)
            .map(cookie => {
                const cookieComponents = cookie.split(/=(.*)/).map(component => component.trim());
                return { name: cookieComponents[0], value: cookieComponents[1] };
            });
    }

    static getCookie (name: string) {
        return CookieHandler.getAllCookies().filter(cookie => cookie.name === name)[0];
    }

    static saveCookie (cookie: Cookie, expiry?: number, secure?: boolean) {
        const date = new Date();
        date.setDate(date.getDate() + expiry);

        let cookieString = cookie.name + '=';
        cookieString += typeof cookie.value === 'object' ? JSON.stringify(cookie.value) : cookie.value;
        cookieString += expiry ? ';expires=' + date.toUTCString() : '';
        cookieString += secure ? ';secure' : '';
        cookieString += ';path=/;';

        document.cookie = cookieString;
        console.debug(`Saved '${cookie.name}' cookie`);
    }

    static deleteCookie (cookie: Cookie) {
        console.debug('Deleting cookie: ' + cookie.name);

        const hostname = window.location.hostname;
        const upperDomain = hostname.substring(hostname.indexOf('.'));
        const expires = new Date(-1).toUTCString();

        [hostname, '.' + hostname, upperDomain, '.' + upperDomain].forEach(domain => {
            document.cookie = cookie.name + '=;expires=' + expires + ';domain=' + domain + ';path=/;';
        });
    }
}
