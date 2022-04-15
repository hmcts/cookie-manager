import Config from './models/config';
import ManifestHandler from './handlers/manifestHandler';
import CookieHandler from './handlers/cookieHandler';
import UserPreferences from './handlers/userPreferencesHandler';
import CookieBannerHandler from './handlers/cookieBannerHandler';
import PreferencesFormHandler from './handlers/preferencesFormHandler';
import { EventProcessor } from './handlers/eventHandler';
import { CookieManagerConfig } from './interfaces/Config';

/**
 * Initializes the @hmcts-cookie/manager library using the provided config.
 *
 * @param {CookieManagerConfig} providedConfig - Config for the library to use.
 */
function init (providedConfig: Partial<CookieManagerConfig>): void {
    console.debug('CookieManager initializing...');

    const config = new Config(providedConfig);
    const manifestHandler = new ManifestHandler(config);
    const userPreferences = new UserPreferences(config, manifestHandler);
    const cookieHandler = new CookieHandler(config, manifestHandler, userPreferences);

    userPreferences.processPreferences();

    if (!config.isCookieBannerDisabled()) {
        new CookieBannerHandler(config, userPreferences, cookieHandler).init();
    }

    if (!config.isPreferencesFormDisabled()) {
        new PreferencesFormHandler(config, userPreferences, cookieHandler).init();
    }

    EventProcessor.emit('CookieManagerLoaded');
    cookieHandler.processCookies();
}

const on = EventProcessor.on;
const off = EventProcessor.off;

export default { on, off, init };
