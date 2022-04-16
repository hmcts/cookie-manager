import { CookieCategory } from '../interfaces/CookieCategory';
import { CookieManagerConfig } from '../interfaces/Config';

export default class ManifestHandler {
    static DEFAULTS = {
        UNDEFINED_CATEGORY_NAME: 'un-categorized'
    }

    constructor (
        private readonly config: CookieManagerConfig
    ) {}

    getCategoryByCookieName (cookieName: string): CookieCategory {
        if (cookieName === this.config.userPreferences.cookieName) {
            return { name: '__internal', cookies: [cookieName], optional: false, matchBy: 'exact' };
        }

        const category = this.getCategories().filter(category => {
            return category.cookies.some(cookie => {
                switch (category.matchBy) {
                case 'exact':
                    return cookieName === cookie;
                case 'includes':
                    return cookieName.includes(cookie);
                case 'startsWith':
                default:
                    return cookieName.startsWith(cookie);
                }
            });
        })[0];

        return category ?? { name: ManifestHandler.DEFAULTS.UNDEFINED_CATEGORY_NAME, cookies: [cookieName], optional: true, matchBy: 'exact' };
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
