import Config from './models/config';
import ManifestHandler from './handlers/manifestHandler';
import CookieHandler from './handlers/cookieHandler';
import UserPreferences from './handlers/userPreferencesHandler';
import CookieBannerHandler from './handlers/cookieBannerHandler';
import PreferencesFormHandler from './handlers/preferencesFormHandler';
import { EventProcessor } from './handlers/EventHandler';
import { IConfig } from './interfaces/Config';

export default {
    init: function (providedConfig: IConfig): void {
        console.debug('CookieManager initializing...');
        EventProcessor.emit('CookieManagerLoaded', ('loading'));

        const config = new Config(providedConfig);
        const manifestHandler = new ManifestHandler(config);
        const userPreferences = new UserPreferences(config, manifestHandler);
        const cookieHandler = new CookieHandler(config, manifestHandler, userPreferences);
        EventProcessor.emit('CookieManagerLoaded', ('loaded'));

        userPreferences.processPreferences();
        cookieHandler.processCookies();

        if (Object.keys(this.config.getCookieBannerConfiguration())) {
            new CookieBannerHandler(config, userPreferences, cookieHandler).init();
        }

        if (Object.keys(this.config.getPreferencesFormConfiguration())) {
            new PreferencesFormHandler(config, userPreferences, cookieHandler).init();
        }
    },
    on: EventProcessor.on,
    off: EventProcessor.off
};
