/* ===== CookieHandler ===== */
function CookieHandler (ManifestHandler) {
    this._ManifestHandler = ManifestHandler;
}

CookieHandler.prototype.getAllCookies = function() {
    return decodeURIComponent(document.cookie)
        .split(';')
        .filter(cookie => cookie.length)
        .map(cookie => {
            const components = cookie.split(/=(.*)/s);
            const name = components[0].trim();
            const value = components[1].trim();
            const category = this._ManifestHandler.getCategoryByCookieName(name);

            return new Cookie(name, value, category);
        });
};

CookieHandler.prototype.getCookie = function(cookieName) {
    return this.getAllCookies().find(cookie => cookie.getName() === cookieName);
};
/* ========================= */


/* ===== Cookie ===== */
function Cookie (name, value, category = 'un-categorized') {
    this._name = name;
    this._value = value;
    this._category = category;
}

Cookie.prototype.enable = function(expiry) {
    let expires = '';
    let value = this._value;
    if (expiry) {
        expires = ';expires='+ new Date(Date.now() + expiry).toUTCString();
    }

    if(typeof this._value === 'object') {
        value = JSON.stringify(value);
    }

    document.cookie = this._name + '=' + value + expires + ';path=/';
    console.debug(`Saved '${this._name}' cookie`);
};

Cookie.prototype.disable = function () {
    console.debug(`Deleting cookie '${this.getName()}'`);
    document.cookie = this._name + '=;expires=' + new Date(1000).toUTCString() + ';path=/';
};

Cookie.prototype.getName = function() {
    return this._name;
};

Cookie.prototype.getValue = function() {
    return this._value;
};

Cookie.prototype.getCategory = function() {
    return this._category;
};
/* ================= */


/* ===== User Preferences ===== */
function UserPreferences (Config, ManifestHandler, CookieHandler) {
    this._Config = Config;
    this._CookieHandler = CookieHandler;
    this._ManifestHandler = ManifestHandler;
}

UserPreferences.prototype.processPreferences = function () {
    this._preferencesCookie = this.getPreferenceCookie();

    if(this._preferencesCookie) {
        this.setPreferences(this.loadPreferencesFromCookie(this._preferencesCookie));
    } else {
        this.setPreferences(this.loadPreferenceDefaults());
    }
}

UserPreferences.prototype.getPreferences = function () {
    if(!this._preferences) {
        console.error('User preferences not loaded/set, call .processPreferences() first')
        return {};
    }

    return this._preferences;
};

UserPreferences.prototype.setPreferences = function (preferences) {
    this._preferences = preferences;
};

UserPreferences.prototype.getPreferenceCookie = function () {
    return this._CookieHandler.getCookie(this._Config.getPreferenceCookieName());
};

UserPreferences.prototype.savePreferencesToCookie = function () {
    const cookieValue = {};
    const preferences = this.getPreferences();

    Object.keys(preferences).forEach(key => cookieValue[key] = preferences[key] ? 'on' : 'off');

    this._preferencesCookie = new Cookie(this._Config.getPreferenceCookieName(), cookieValue);
    this._preferencesCookie.enable(365 * 24 * 60 * 60 * 1000);
};

UserPreferences.prototype.loadPreferencesFromCookie = function () {
    let cookiePreferences;
    const preferenceCookie = this.getPreferenceCookie();

    try {
        console.debug('Loading preferences from cookie');
        cookiePreferences = JSON.parse(preferenceCookie.getValue());
    } catch (e) {
        console.error(`Unable to parse user preference cookie "${preferenceCookie.getName()}" as JSON.`);
        preferenceCookie.disable();
        return this.loadPreferenceDefaults();
    }

    try {
        if (typeof cookiePreferences !== 'object') {
            throw new Error('User preferences cookie is malformed');
        }

        for (const configCategory of this._ManifestHandler.getCategories().filter(category => category.isOptional())) {
            if (!Object.keys(cookiePreferences).includes(configCategory.getName())) {
                throw new Error('User preferences cookie is missing category: ' + configCategory.getName());
            }
        }
    } catch (e) {
        console.debug(e + ', deleting old user preferences cookie.');
        preferenceCookie.disable();
        return this.loadPreferenceDefaults();
    }

    const preferences = {};
    Object.keys(cookiePreferences).forEach(key => preferences[key] = cookiePreferences[key] === 'on');

    return preferences;
};

UserPreferences.prototype.loadPreferenceDefaults = function () {
    console.debug('Loading preferences from defaults');

    const preferences = {};
    this._ManifestHandler.getCategories()
        .filter(category => category.isOptional())
        .forEach(category => {
            preferences[category.getName()] = this._Config.getDefaultConsent();
        });

    return preferences;
};
/* ============================ */


/* ===== ManifestHandler ===== */
function ManifestHandler(Config) {
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
        }).map(category => {
            return new ManifestCategory(category['category-name'], category.optional);
        })
};
/* =========================== */


/* ===== ManifestCategory ===== */
function ManifestCategory (name, optional = true) {
    this._name = name;
    this._optional = optional;
}

ManifestCategory.prototype.getName = function() {
    return this._name;
};

ManifestCategory.prototype.isOptional = function() {
    return this._optional;
};
/* =========================== */


/* ===== Config ===== */
function Config (configObject) {
    this._config = configObject;
}

Config.prototype.getPreferenceCookieName = function () {
    return this._config['user-preference-cookie-name'];
}

Config.prototype.getCookieManifest = function () {
    return this._config['cookie-manifest'];
}

Config.prototype.getDefaultConsent = function () {
    return this._config['default-consent-value'] ?? false;
}

Config.prototype.shouldDeleteUncategorized = function () {
    return this._config['delete-undefined-cookies'] ?? true;
}
/* ================== */


/* ===== CookieManager ===== */
function CookieManager(config) {
    this._Config = new Config(config);
    this._ManifestHandler = new ManifestHandler(this._Config);
    this._CookieHandler = new CookieHandler(this._ManifestHandler);
    this._UserPreferences = new UserPreferences(this._Config, this._ManifestHandler, this._CookieHandler);
}

CookieManager.prototype.init = function () {
    this._UserPreferences.processPreferences();
    this.processCookies();
};

CookieManager.prototype.processCookies = function () {
    if(this._Config.shouldDeleteUncategorized()) {
        // Delete un-categorized cookies
        console.debug('Deleting un-categorized cookies');
        Object.values(this._CookieHandler.getAllCookies())
            .filter(cookie => cookie.getCategory().getName() === 'un-categorized')
            .forEach(cookie => cookie.disable());
    }

    // Delete non consented cookies
    console.debug('Deleting non-consented cookies');
    Object.values(this._CookieHandler.getAllCookies())
        .filter(cookie => cookie.getCategory().getName() !== 'un-categorized')
        .filter(cookie => cookie.getCategory().isOptional())
        .filter(cookie => !this._UserPreferences.getPreferences()[cookie.getCategory().getName()])
        .forEach(cookie => cookie.disable());
};
/* ========================= */

module.exports.Config = Config;
module.exports.CookieManager = CookieManager;
module.exports.Cookie = Cookie;
module.exports.ManifestCategory = ManifestCategory;
module.exports.ManifestHandler = ManifestHandler;
module.exports.CookieHandler = CookieHandler;
module.exports.UserPreferences = UserPreferences;