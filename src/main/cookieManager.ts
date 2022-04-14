import Config from './models/config';
import ManifestHandler from './handlers/manifestHandler';
import CookieHandler from './handlers/cookieHandler';
import UserPreferences from './handlers/userPreferencesHandler';
import CookieBannerHandler from './handlers/cookieBannerHandler';
import PreferencesFormHandler from './handlers/preferencesFormHandler';
import { EventProcessor } from './handlers/eventHandler';
import { CookieManagerConfig } from './interfaces/Config';

const cookieManager = {
    init: function (providedConfig: CookieManagerConfig): void {
        console.debug('CookieManager initializing...');

        const config = new Config(providedConfig);
        const manifestHandler = new ManifestHandler(config);
        const userPreferences = new UserPreferences(config, manifestHandler);
        const cookieHandler = new CookieHandler(config, manifestHandler, userPreferences);

        userPreferences.processPreferences();

        if (Object.keys(config.getCookieBannerConfiguration()).length) {
            new CookieBannerHandler(config, userPreferences, cookieHandler).init();
        }

        if (Object.keys(config.getPreferencesFormConfiguration()).length) {
            new PreferencesFormHandler(config, userPreferences, cookieHandler).init();
        }

        EventProcessor.emit('CookieManagerLoaded');

        cookieHandler.processCookies();
    },
    on: EventProcessor.on,
    off: EventProcessor.off
};

export default cookieManager;
export type { CookieManagerConfig };
