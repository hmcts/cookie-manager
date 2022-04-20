import ManifestHandler from '../main/handlers/manifestHandler';
import UserPreferences from '../main/handlers/userPreferencesHandler';
import CookieHandler from '../main/handlers/cookieHandler';
import CookieBannerHandler from '../main/handlers/cookieBannerHandler';
import PreferencesFormHandler from '../main/handlers/preferencesFormHandler';
import cookieManager from '../main/cookieManager';
import { ConfigHandler } from '../main/handlers/configHandler';

jest.mock('../main/handlers/manifestHandler');
jest.mock('../main/handlers/cookieHandler');
jest.mock('../main/handlers/userPreferencesHandler');
jest.mock('../main/handlers/cookieBannerHandler');
jest.mock('../main/handlers/preferencesFormHandler');

describe('cookieManager', function () {
    describe('init', function () {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        test('Should setup without cookie banner and preferences form', () => {
            cookieManager.init({
                additionalOptions: {
                    disableCookieBanner: true,
                    disableCookiePreferencesForm: true
                }
            });

            expect(ManifestHandler).toHaveBeenCalled();
            expect(UserPreferences).toHaveBeenCalled();
            expect(CookieHandler).toHaveBeenCalled();
            expect(UserPreferences.prototype.processPreferences).toHaveBeenCalled();
            expect(CookieBannerHandler.prototype.init).not.toHaveBeenCalled();
            expect(PreferencesFormHandler.prototype.init).not.toHaveBeenCalled();
            expect(CookieHandler.prototype.processCookies).toHaveBeenCalled();
        });

        test('Should setup without cookie banner', () => {
            cookieManager.init({
                additionalOptions: {
                    disableCookieBanner: true
                }
            });

            expect(ManifestHandler).toHaveBeenCalled();
            expect(UserPreferences).toHaveBeenCalled();
            expect(CookieHandler).toHaveBeenCalled();
            expect(UserPreferences.prototype.processPreferences).toHaveBeenCalled();
            expect(CookieBannerHandler.prototype.init).not.toHaveBeenCalled();
            expect(PreferencesFormHandler.prototype.init).toHaveBeenCalled();
            expect(CookieHandler.prototype.processCookies).toHaveBeenCalled();
        });

        test('Should setup without preferences form', () => {
            cookieManager.init({
                additionalOptions: {
                    disableCookiePreferencesForm: true
                }
            });

            expect(ManifestHandler).toHaveBeenCalled();
            expect(UserPreferences).toHaveBeenCalled();
            expect(CookieHandler).toHaveBeenCalled();
            expect(UserPreferences.prototype.processPreferences).toHaveBeenCalled();
            expect(CookieBannerHandler.prototype.init).toHaveBeenCalled();
            expect(PreferencesFormHandler.prototype.init).not.toHaveBeenCalled();
            expect(CookieHandler.prototype.processCookies).toHaveBeenCalled();
        });

        test('Should disable if invalid/malformed config', () => {
            const configHandlerSpy = jest.spyOn(ConfigHandler.prototype, 'mergeConfigurations')
                .mockImplementation(() => { throw new Error('Invalid config'); });

            cookieManager.init({});

            expect(configHandlerSpy).toHaveBeenCalled();
            expect(ManifestHandler).not.toHaveBeenCalled();
            expect(UserPreferences).not.toHaveBeenCalled();
            expect(CookieHandler).not.toHaveBeenCalled();
            expect(UserPreferences.prototype.processPreferences).not.toHaveBeenCalled();
            expect(CookieBannerHandler.prototype.init).not.toHaveBeenCalled();
            expect(PreferencesFormHandler.prototype.init).not.toHaveBeenCalled();
            expect(CookieHandler.prototype.processCookies).not.toHaveBeenCalled();
        });
    });
});
