import Cookie from "../models/cookie";

export default function CookieHandler (ManifestHandler) {
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