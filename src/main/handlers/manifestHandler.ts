import ManifestCategory from '../models/manifestCategory';
import Config from '../models/config';

export default class ManifestHandler {
    static DEFAULTS = {
        UNDEFINED_CATEGORY_NAME: 'un-categorized'
    }

    constructor (
        private readonly config: Config
    ) {}

    getCategoryByCookieName (cookieName: string): ManifestCategory {
        if (cookieName === this.config.getUserPreferencesCookieName()) {
            return new ManifestCategory('__cookie-manager', [], false);
        }

        const category = this.getCategories().find(category => {
            return category.getCookies().some(cookie => {
                switch (category.getMatchBy()) {
                case 'startsWith': return cookieName.startsWith(cookie);
                case 'exact': return cookieName === cookie;
                case 'includes': return cookieName.includes(cookie);
                default: return false;
                }
            });
        });

        return category ?? new ManifestCategory(ManifestHandler.DEFAULTS.UNDEFINED_CATEGORY_NAME);
    }

    getCategories (): ManifestCategory[] {
        return this.config.getCookieManifest()
            .filter(category => {
                if (!category.categoryName || !Array.isArray(category.cookies)) {
                    console.debug('Malformed cookie manifest category, ignoring.');
                    return false;
                } else {
                    return true;
                }
            })
            .map(category => new ManifestCategory(category.categoryName, category.cookies, category.optional, category.matchBy));
    }
}
