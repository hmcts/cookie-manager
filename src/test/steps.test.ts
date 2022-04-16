import { deleteAllCookies, loadHTMLFromFile } from './common/common';
import cookieManager from '../main/cookieManager';
import { CookieManagerConfig } from '../main/interfaces/Config';
import { MockedCookieJar } from './common/mockCookieJar';
import { ConfigHandler } from '../main/handlers/configHandler';

describe('Cookie Banner', function () {
    const clickEvent = () => new Event('click', { bubbles: false, cancelable: false, composed: false });

    const banner = () => document.getElementsByClassName('cookie-banner')[0] as HTMLDivElement;

    // Accept action
    const acceptButton = () => document.getElementsByClassName('cookie-banner-accept-button')[0] as HTMLDivElement;
    const acceptMessage = () => document.getElementsByClassName('cookie-banner-accept-message')[0] as HTMLDivElement;

    // Reject action
    const rejectButton = () => document.getElementsByClassName('cookie-banner-reject-button')[0] as HTMLDivElement;
    const rejectMessage = () => document.getElementsByClassName('cookie-banner-reject-message')[0] as HTMLDivElement;

    // Hide action
    const hideButton = () => document.getElementsByClassName('cookie-banner-hide-button')[0] as HTMLDivElement;

    let mockCookieJar;

    beforeEach(async () => {
        await loadHTMLFromFile('CookieBanner.html');
        mockCookieJar = MockedCookieJar();
    });

    afterEach(() => {
        jest.clearAllMocks();
        deleteAllCookies();
    });

    const configuration: Partial<CookieManagerConfig> = {
        userPreferences: {
            cookieName: 'test-cookie-preferences'
        },
        cookieManifest: [
            {
                categoryName: 'analytics',
                cookies: [
                    '_ga',
                    '_gid',
                    '_gat_UA-'
                ]
            },
            {
                categoryName: 'apm',
                cookies: [
                    'dtCookie',
                    'dtLatC',
                    'dtPC',
                    'dtSa',
                    'rxVisitor',
                    'rxvt'
                ]
            }
        ]
    };

    test('Clicking `accept` should accept all preferences', function () {
        const preferences = { analytics: 'on', apm: 'on' };
        const d = new Date();
        d.setDate(d.getDate() + ConfigHandler.defaultConfig.userPreferences.cookieExpiry);
        const expectedCookie =
            configuration.userPreferences.cookieName + '=' + JSON.stringify(preferences) +
            ';expires=' + d.toUTCString() +
            ';path=/;';

        const userPreferencesSaved = jest.fn();
        cookieManager.on('UserPreferencesSaved', userPreferencesSaved);

        const userPreferencesLoaded = jest.fn();
        cookieManager.on('UserPreferencesLoaded', userPreferencesLoaded);

        const cookieBannerAction = jest.fn();
        cookieManager.on('CookieBannerAction', cookieBannerAction);

        // init cookie manager
        cookieManager.init(configuration);
        expect(userPreferencesLoaded).toHaveBeenCalledWith({ analytics: 'off', apm: 'off' });

        // click accept button on banner
        acceptButton().dispatchEvent(clickEvent());
        expect(cookieBannerAction).toHaveBeenCalledWith('accept');

        // Preferences have been saved to document.cookie
        expect(mockCookieJar.set).toHaveBeenCalledWith(expectedCookie);
        expect(document.cookie).toBe(configuration.userPreferences.cookieName + '=' + JSON.stringify(preferences));
        expect(userPreferencesSaved).toHaveBeenCalledWith(preferences);

        // Correct messages are hidden/unhidden
        expect(acceptMessage().hidden).toBe(false);
        expect(rejectMessage().hidden).toBe(true);
        expect(banner().hidden).toBe(false);
    });

    test('Clicking `reject` should reject all preferences', function () {
        const preferences = { analytics: 'off', apm: 'off' };
        const d = new Date();
        d.setDate(d.getDate() + ConfigHandler.defaultConfig.userPreferences.cookieExpiry);
        const expectedCookie =
            configuration.userPreferences.cookieName + '=' + JSON.stringify(preferences) +
            ';expires=' + d.toUTCString() +
            ';path=/;';

        const userPreferencesSaved = jest.fn();
        cookieManager.on('UserPreferencesSaved', userPreferencesSaved);

        const userPreferencesLoaded = jest.fn();
        cookieManager.on('UserPreferencesLoaded', userPreferencesLoaded);

        const cookieBannerAction = jest.fn();
        cookieManager.on('CookieBannerAction', cookieBannerAction);

        // init cookie manager
        cookieManager.init(configuration);
        expect(userPreferencesLoaded).toHaveBeenCalledWith({ analytics: 'off', apm: 'off' });

        // click accept button on banner
        rejectButton().dispatchEvent(clickEvent());
        expect(cookieBannerAction).toHaveBeenCalledWith('reject');

        // Preferences have been saved to document.cookie
        expect(mockCookieJar.set).toHaveBeenCalledWith(expectedCookie);
        expect(document.cookie).toBe(configuration.userPreferences.cookieName + '=' + JSON.stringify(preferences));
        expect(userPreferencesSaved).toHaveBeenCalledWith(preferences);

        // Correct messages are hidden/unhidden
        expect(acceptMessage().hidden).toBe(true);
        expect(rejectMessage().hidden).toBe(false);
        expect(banner().hidden).toBe(false);
    });

    test('Clicking `hide` should hide all preferences', function () {
        const preferences = { analytics: 'off', apm: 'off' };
        const d = new Date();
        d.setDate(d.getDate() + ConfigHandler.defaultConfig.userPreferences.cookieExpiry);
        const expectedCookie =
            configuration.userPreferences.cookieName + '=' + JSON.stringify(preferences) +
            ';expires=' + d.toUTCString() +
            ';path=/;';

        const userPreferencesSaved = jest.fn();
        cookieManager.on('UserPreferencesSaved', userPreferencesSaved);

        const userPreferencesLoaded = jest.fn();
        cookieManager.on('UserPreferencesLoaded', userPreferencesLoaded);

        const cookieBannerAction = jest.fn();
        cookieManager.on('CookieBannerAction', cookieBannerAction);

        // init cookie manager
        cookieManager.init(configuration);
        expect(userPreferencesLoaded).toHaveBeenCalledWith({ analytics: 'off', apm: 'off' });

        // click reject button on banner
        rejectButton().dispatchEvent(clickEvent());
        expect(cookieBannerAction).toHaveBeenCalledWith('reject');

        // Preferences have been saved to document.cookie
        expect(mockCookieJar.set).toHaveBeenCalledWith(expectedCookie);
        expect(document.cookie).toBe(configuration.userPreferences.cookieName + '=' + JSON.stringify(preferences));
        expect(userPreferencesSaved).toHaveBeenCalledWith(preferences);

        // Correct messages are hidden/unhidden
        expect(acceptMessage().hidden).toBe(true);
        expect(rejectMessage().hidden).toBe(false);
        expect(banner().hidden).toBe(false);

        // click hide button
        hideButton().dispatchEvent(clickEvent());
        expect(cookieBannerAction).toHaveBeenCalledWith('hide');

        expect(mockCookieJar.set).toHaveBeenCalledTimes(1);
        expect(document.cookie).toBe(configuration.userPreferences.cookieName + '=' + JSON.stringify(preferences));
        expect(banner().hidden).toBe(true);
    });
});

describe('Preferences Form', function () {
    let mockCookieJar;

    const submitEvent = () => new Event('submit', { bubbles: false, cancelable: false, composed: false });

    const preferencesForm = () => document.getElementsByClassName('cookie-preferences-form')[0] as HTMLDivElement;

    const analyticsOnRadio = () => document.getElementsByName('analytics')[0] as HTMLInputElement;
    const analyticsOffRadio = () => document.getElementsByName('analytics')[1] as HTMLInputElement;
    const apmOnRadio = () => document.getElementsByName('apm')[0] as HTMLInputElement;

    const configuration: Partial<CookieManagerConfig> = {
        userPreferences: {
            cookieName: 'test-cookie-preferences'
        },
        cookieManifest: [
            {
                categoryName: 'analytics',
                cookies: [
                    '_ga',
                    '_gid',
                    '_gat_UA-'
                ]
            },
            {
                categoryName: 'apm',
                cookies: [
                    'dtCookie',
                    'dtLatC',
                    'dtPC',
                    'dtSa',
                    'rxVisitor',
                    'rxvt'
                ]
            }
        ]
    };

    beforeEach(async () => {
        await loadHTMLFromFile('PreferencesForm.html');
        mockCookieJar = MockedCookieJar();
    });

    afterEach(() => {
        jest.clearAllMocks();
        deleteAllCookies();
    });

    test('Selecting single radio option should update single preference', () => {
        const preferences = { analytics: 'off', apm: 'on' };
        const d = new Date();
        d.setDate(d.getDate() + ConfigHandler.defaultConfig.userPreferences.cookieExpiry);

        const expectedCookie =
            configuration.userPreferences.cookieName + '=' + JSON.stringify(preferences) +
            ';expires=' + d.toUTCString() +
            ';path=/;';

        const userPreferencesSaved = jest.fn();
        cookieManager.on('UserPreferencesSaved', userPreferencesSaved);

        const userPreferencesLoaded = jest.fn();
        cookieManager.on('UserPreferencesLoaded', userPreferencesLoaded);

        const preferenceFormSubmitted = jest.fn();
        cookieManager.on('PreferenceFormSubmitted', preferenceFormSubmitted);

        // init cookie manager
        cookieManager.init(configuration);
        expect(userPreferencesLoaded).toHaveBeenCalledWith({ analytics: 'off', apm: 'off' });

        // consent to APM category
        apmOnRadio().checked = true;

        // submit form
        preferencesForm().dispatchEvent(submitEvent());
        expect(preferenceFormSubmitted).toHaveBeenCalled();

        // Preferences have been saved to document.cookie
        expect(mockCookieJar.set).toHaveBeenCalledWith(expectedCookie);
        expect(document.cookie).toBe(configuration.userPreferences.cookieName + '=' + JSON.stringify(preferences));
        expect(userPreferencesSaved).toHaveBeenCalledWith(preferences);
    });

    test('Selecting multiple radio options should update multiple preferences', () => {
        const preferences = { analytics: 'on', apm: 'on' };
        const d = new Date();
        d.setDate(d.getDate() + ConfigHandler.defaultConfig.userPreferences.cookieExpiry);

        const expectedCookie =
            configuration.userPreferences.cookieName + '=' + JSON.stringify(preferences) +
            ';expires=' + d.toUTCString() +
            ';path=/;';

        const userPreferencesSaved = jest.fn();
        cookieManager.on('UserPreferencesSaved', userPreferencesSaved);

        const userPreferencesLoaded = jest.fn();
        cookieManager.on('UserPreferencesLoaded', userPreferencesLoaded);

        const preferenceFormSubmitted = jest.fn();
        cookieManager.on('PreferenceFormSubmitted', preferenceFormSubmitted);

        // init cookie manager
        cookieManager.init(configuration);
        expect(userPreferencesLoaded).toHaveBeenCalledWith({ analytics: 'off', apm: 'off' });

        // consent to analytics and APM categories
        analyticsOnRadio().checked = true;
        apmOnRadio().checked = true;

        // submit form
        preferencesForm().dispatchEvent(submitEvent());
        expect(preferenceFormSubmitted).toHaveBeenCalled();

        // Preferences have been saved to document.cookie
        expect(mockCookieJar.set).toHaveBeenCalledWith(expectedCookie);
        expect(document.cookie).toBe(configuration.userPreferences.cookieName + '=' + JSON.stringify(preferences));
        expect(userPreferencesSaved).toHaveBeenCalledWith(preferences);
    });

    test('Selecting off radio option should reject category', () => {
        const d = new Date();
        d.setDate(d.getDate() + ConfigHandler.defaultConfig.userPreferences.cookieExpiry);

        const preferences = { analytics: 'off', apm: 'on' };
        const expectedCookie =
            configuration.userPreferences.cookieName + '=' + JSON.stringify({ analytics: 'on', apm: 'on' }) +
            ';expires=' + d.toUTCString() +
            ';path=/;';

        document.cookie =
            configuration.userPreferences.cookieName + '=' + JSON.stringify({ analytics: 'on', apm: 'on' }) +
            ';expires=' + d.toUTCString() +
            ';path=/;';

        expect(document.cookie).toBe(configuration.userPreferences.cookieName + '=' + JSON.stringify({ analytics: 'on', apm: 'on' }));

        const userPreferencesSaved = jest.fn();
        cookieManager.on('UserPreferencesSaved', userPreferencesSaved);

        const userPreferencesLoaded = jest.fn();
        cookieManager.on('UserPreferencesLoaded', userPreferencesLoaded);

        const preferenceFormSubmitted = jest.fn();
        cookieManager.on('PreferenceFormSubmitted', preferenceFormSubmitted);

        // init cookie manager
        cookieManager.init(configuration);
        expect(userPreferencesLoaded).toHaveBeenCalledWith({ analytics: 'on', apm: 'on' });

        // reject analytics
        analyticsOffRadio().checked = true;

        // submit form
        preferencesForm().dispatchEvent(submitEvent());
        expect(preferenceFormSubmitted).toHaveBeenCalled();

        // Preferences have been saved to document.cookie
        expect(mockCookieJar.set).toHaveBeenCalledWith(expectedCookie);
        expect(document.cookie).toBe(configuration.userPreferences.cookieName + '=' + JSON.stringify(preferences));
        expect(userPreferencesSaved).toHaveBeenCalledWith(preferences);
    });
});
