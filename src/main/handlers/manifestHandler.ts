import Config from '../models/config';
import { CookieCategory } from '../interfaces/CookieCategory';

export default class ManifestHandler {
    static DEFAULTS = {
        UNDEFINED_CATEGORY_NAME: 'un-categorized'
    }

    constructor (
        private readonly config: Config
    ) {}

    getCategoryByCookieName (cookieName: string): CookieCategory {
        if (cookieName === this.config.getUserPreferencesCookieName()) {
            return { name: '__internal', optional: false };
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

        return category ?? { name: ManifestHandler.DEFAULTS.UNDEFINED_CATEGORY_NAME, optional: true };
    }

    getCategories (): CookieCategory[] {
        return this.config.getCookieManifest()
            .filter(category => {
                if (!category.categoryName || !Array.isArray(category.cookies)) {
                    console.debug('Malformed cookie manifest category, ignoring.');
                    return false;
                } else {
                    return true;
                }
            })
            .map(category => ({
                name: category.categoryName,
                cookies: category.cookies,
                optional: category.optional,
                matchBy: category.matchBy
            }));
    }
}
