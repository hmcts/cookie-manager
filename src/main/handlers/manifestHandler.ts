import { CookieCategory } from '../interfaces/CookieCategory';
import { CookieManagerConfig } from '../interfaces/Config';

export default class ManifestHandler {
    static DEFAULTS = {
        UNDEFINED_CATEGORY_NAME: 'un-categorized'
    };

    constructor (
        private readonly config: CookieManagerConfig
    ) {}

    getCategoryByCookieName (cookieName: string): CookieCategory {
        if (cookieName === this.config.userPreferences.cookieName) {
            return { name: '__internal', optional: false, matchBy: 'exact' };
        }

        return this.getCategories().filter(category =>
            category.cookies.some(cookie => {
                switch (category.matchBy) {
                case 'exact':
                    return cookieName === cookie;
                case 'includes':
                    return cookieName.includes(cookie);
                case 'startsWith':
                default:
                    return cookieName.startsWith(cookie);
                }
            }))[0] ?? {
            name: ManifestHandler.DEFAULTS.UNDEFINED_CATEGORY_NAME,
            optional: true
        };
    }

    getCategories (): CookieCategory[] {
        return this.config.cookieManifest
            .map(category => ({
                name: category.categoryName,
                cookies: category.cookies,
                optional: category.optional ?? true,
                matchBy: category.matchBy ?? 'startsWith'
            }));
    }
}
