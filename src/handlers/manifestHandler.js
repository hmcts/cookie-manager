import ManifestCategory from "../models/manifestCategory";

export default function ManifestHandler(Config) {
    this._Config = Config;
}

ManifestHandler.prototype.getCategoryByCookieName = function(cookieName) {
    if(cookieName === this._Config.getPreferenceCookieName()) {
        return new ManifestCategory('internal', false);
    }

    for(const category of this._Config.getCookieManifest()) {
        if (category.cookies.some(manifestCookieName => manifestCookieName === cookieName)) {
            const name = category['category-name'];
            const optional = category.optional;

            return new ManifestCategory(name, optional);
        }
    }

    return new ManifestCategory('un-categorized', true);
};

ManifestHandler.prototype.getCategories = function() {
    return this._Config.getCookieManifest()
        .filter(category => {
            if(!category['category-name'] || !Array.isArray(category.cookies)) {
                console.debug('Malformed cookie manifest category, ignoring.');
                return false;
            } else {
                return true;
            }
        })
        .map(category => {
            return new ManifestCategory(category['category-name'], category.optional);
        })
};