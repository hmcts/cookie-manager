import ManifestCategory from '../models/manifestCategory';

export default class ManifestHandler {
    constructor (config) {
        this._config = config;
    }

    getCategoryByCookieName (cookieName) {
        if (cookieName === this._config.getPreferenceCookieName()) {
            return new ManifestCategory('internal', false);
        }

        for (let i = 0; i < this._config.getCookieManifest().length; i++) {
            const category = this._config.getCookieManifest()[i];

            if (category.cookies.some(manifestCookieName => manifestCookieName === cookieName)) {
                return new ManifestCategory(category['category-name'], category.optional);
            }
        }

        return new ManifestCategory('un-categorized', true);
    }

    getCategories () {
        return this._config.getCookieManifest()
            .filter(category => {
                if (!category['category-name'] || !Array.isArray(category.cookies)) {
                    console.debug('Malformed cookie manifest category, ignoring.');
                    return false;
                } else {
                    return true;
                }
            })
            .map(category => {
                return new ManifestCategory(category['category-name'], category.optional);
            });
    }
}
