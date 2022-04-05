import Config from './models/config';
import ManifestHandler from './handlers/manifestHandler';
import CookieHandler from './handlers/cookieHandler';
import UserPreferences from './handlers/userPreferencesHandler';
import CookieBannerHandler from './handlers/cookieBannerHandler';
import PreferencesFormHandler from './handlers/preferencesFormHandler';
import { EventProcessor } from './handlers/EventHandler';

export default {
    init: function (rawConfig) {
        console.debug('CookieManager initializing...');
        EventProcessor.emit('CookieManagerLoaded', ('loading'));

        const config = new Config(rawConfig);
        const manifestHandler = new ManifestHandler(config);
        const userPreferences = new UserPreferences(config, manifestHandler);
        const cookieHandler = new CookieHandler(config, manifestHandler, userPreferences);
        new CookieBannerHandler(config, userPreferences).init();
        new PreferencesFormHandler(config, userPreferences).init();

        userPreferences.processPreferences();
        cookieHandler.processCookies();

        EventProcessor.emit('CookieManagerLoaded', ('loaded'));
    },
    on: EventProcessor.on,
    off: EventProcessor.off
};
