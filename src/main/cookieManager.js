import Config from "./models/config";
import ManifestHandler from "./handlers/manifestHandler";
import CookieHandler from "./handlers/cookieHandler";
import UserPreferences from "./handlers/userPreferencesHandler";
import CookieBannerHandler from "./handlers/cookieBannerHandler";
import PreferencesFormHandler from "./handlers/preferencesFormHandler";

export default function CookieManager(config) {
    this._Config = new Config(config);
    this._ManifestHandler = new ManifestHandler(this._Config);
    this._CookieHandler = new CookieHandler(this._ManifestHandler);
    this._UserPreferences = new UserPreferences(this._Config, this._ManifestHandler, this._CookieHandler);
}

CookieManager.prototype.init = function () {
    this._UserPreferences.processPreferences();
    this.processCookies();
    new CookieBannerHandler(this._Config, this._UserPreferences).init();
    new PreferencesFormHandler(this._Config, this._UserPreferences).init();
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