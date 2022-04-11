import { loadHTMLFromFile, wipeDocument } from '../common/common';
import { MockConfig } from '../common/mockConfig.js';
import { MockUserPreferences } from '../common/mockUserPreferences.js';
import CookieBannerHandler from '../../main/handlers/cookieBannerHandler.js';
import { when } from 'jest-when';
import Config from '../../main/models/config';

describe('CookieBannerHandler', () => {
    let mockCookieHandler;
    let mockConfig;
    let mockUserPreferences;

    const getBannerNode = () => document.querySelector('.' + Config.DEFAULTS.COOKIE_BANNER_CONFIG.class);

    beforeEach(() => {
        mockConfig = MockConfig();
        mockUserPreferences = MockUserPreferences();
        mockCookieHandler = {
            processCookies: jest.fn()
        };
    });

    describe('init', () => {
        test('DOM is not ready, so eventListener is added to DOM and cookie banner is setup when DOM ready', () => {
            const cookieBannerHandler = new CookieBannerHandler(mockConfig, mockUserPreferences, mockCookieHandler);

            let readyState = 'loading';
            Object.defineProperty(document, 'readyState', {
                get () { return readyState; },
                set (value) { readyState = value; }
            });

            const documentSpy = jest.spyOn(document, 'addEventListener');
            const initSpy = jest.spyOn(cookieBannerHandler, 'init');
            cookieBannerHandler._setupEventListeners = jest.fn();
            cookieBannerHandler._getBannerNode = jest.fn().mockReturnValue({ hidden: true });
            when(mockUserPreferences.getPreferenceCookie).mockReturnValue(false);

            cookieBannerHandler.init();
            expect(documentSpy).toHaveBeenCalledWith('DOMContentLoaded', expect.any(Function));
            expect(initSpy).toHaveBeenCalledTimes(1);

            document.readyState = 'complete';
            document.dispatchEvent(new Event('DOMContentLoaded', {
                bubbles: true,
                cancelable: true
            }));

            expect(initSpy).toHaveBeenCalledTimes(2);
            expect(cookieBannerHandler._setupEventListeners).toHaveBeenCalled();
        });

        test('Cookie banner does not exist in DOM, so do not setup cookie banner', async () => {
            const cookieBannerHandler = new CookieBannerHandler(mockConfig, mockUserPreferences, mockCookieHandler);

            cookieBannerHandler._setupEventListeners = jest.fn();
            cookieBannerHandler._getBannerNode = jest.fn().mockReturnValue(false);
            when(mockUserPreferences.getPreferenceCookie).mockReturnValue(false);

            cookieBannerHandler.init();
            expect(cookieBannerHandler._setupEventListeners).not.toHaveBeenCalled();
        });

        test('User preferences cookie is already set, so do not setup cookie banner', async () => {
            const cookieBannerHandler = new CookieBannerHandler(mockConfig, mockUserPreferences, mockCookieHandler);

            cookieBannerHandler._setupEventListeners = jest.fn();
            cookieBannerHandler._getBannerNode = jest.fn().mockReturnValue({ hidden: true });
            when(mockUserPreferences.getPreferenceCookie).mockReturnValue(true);

            cookieBannerHandler.init();
            expect(cookieBannerHandler._setupEventListeners).not.toHaveBeenCalled();
            expect(cookieBannerHandler._getBannerNode().hidden).toBe(true);
        });

        test('User preferences cookie is not set and cookie banner exists in DOM, so setup cookie banner', async () => {
            const cookieBannerHandler = new CookieBannerHandler(mockConfig, mockUserPreferences, mockCookieHandler);

            cookieBannerHandler._setupEventListeners = jest.fn();
            cookieBannerHandler._getBannerNode = jest.fn().mockReturnValue({ hidden: true });
            when(mockUserPreferences.getPreferenceCookie).mockReturnValue(false);

            cookieBannerHandler.init();
            expect(cookieBannerHandler._setupEventListeners).toHaveBeenCalled();
            expect(cookieBannerHandler._getBannerNode().hidden).toBe(false);
        });
    });

    describe('getBannerNode', () => {
        test('Get cookie banner element when exists banner exists in DOM', async () => {
            await loadHTMLFromFile('CookieBanner.html');

            const expectedElement = getBannerNode();
            const cookieBannerHandler = new CookieBannerHandler(mockConfig, mockUserPreferences, mockCookieHandler);

            expect(cookieBannerHandler._getBannerNode()).toBe(expectedElement);
            expect(mockConfig.getCookieBannerConfiguration).toHaveBeenCalled();
            expect(expectedElement).not.toBe(null);
        });

        test('Get null when cookie banner is configured incorrectly', async () => {
            await loadHTMLFromFile('CookieBanner.html');

            when(mockConfig.getCookieBannerConfiguration).mockReturnValue({});
            const cookieBannerHandler = new CookieBannerHandler(mockConfig, mockUserPreferences, mockCookieHandler);

            expect(cookieBannerHandler._getBannerNode()).toBe(null);
            expect(mockConfig.getCookieBannerConfiguration).toHaveBeenCalled();
        });

        test('Get null when cookie banner does not exist in DOM', () => {
            wipeDocument();

            const cookieBannerHandler = new CookieBannerHandler(mockConfig, mockUserPreferences, mockCookieHandler);

            expect(cookieBannerHandler._getBannerNode()).toBe(null);
            expect(mockConfig.getCookieBannerConfiguration).toHaveBeenCalled();
        });
    });

    describe('updatePreferences', () => {
        test('Consent to cookies', () => {
            const cookieBannerHandler = new CookieBannerHandler(mockConfig, mockUserPreferences, mockCookieHandler);

            when(mockUserPreferences.getPreferences).mockReturnValue({ 'non-essential': false, 'another-non-essential': false });

            cookieBannerHandler._updatePreferences({ 'non-essential': true, 'another-non-essential': true });
            expect(mockUserPreferences.setPreferences).toHaveBeenCalledWith({ 'non-essential': true, 'another-non-essential': true });
            expect(mockUserPreferences.savePreferencesToCookie).toHaveBeenCalled();
            expect(mockCookieHandler.processCookies).toHaveBeenCalled();
        });

        test('Do not consent to cookies', () => {
            const cookieBannerHandler = new CookieBannerHandler(mockConfig, mockUserPreferences, mockCookieHandler);

            when(mockUserPreferences.getPreferences).mockReturnValue({ 'non-essential': false, 'another-non-essential': false });

            cookieBannerHandler._updatePreferences({ 'non-essential': false, 'another-non-essential': false });
            expect(mockUserPreferences.setPreferences).toHaveBeenCalledWith({ 'non-essential': false, 'another-non-essential': false });
            expect(mockUserPreferences.savePreferencesToCookie).toHaveBeenCalled();
            expect(mockCookieHandler.processCookies).toHaveBeenCalled();
        });
    });

    describe('setupEventListeners', () => {
        beforeEach(async () => {
            await loadHTMLFromFile('CookieBanner.html');
        });

        test('Buttons have click listeners added if cookie banner exists in DOM', async () => {
            const cookieBannerHandler = new CookieBannerHandler(mockConfig, mockUserPreferences, mockCookieHandler);

            cookieBannerHandler._getBannerNode = jest.fn().mockReturnValue(getBannerNode());

            const acceptButtonSpy = jest.spyOn(document.getElementsByClassName(Config.DEFAULTS.COOKIE_BANNER_CONFIG.actions[0].buttonClass)[0], 'addEventListener');
            const rejectButtonSpy = jest.spyOn(document.getElementsByClassName(Config.DEFAULTS.COOKIE_BANNER_CONFIG.actions[1].buttonClass)[0], 'addEventListener');

            cookieBannerHandler._setupEventListeners();
            expect(acceptButtonSpy).toHaveBeenCalledWith('click', expect.any(Function));
            expect(rejectButtonSpy).toHaveBeenCalledWith('click', expect.any(Function));
        });
    });

    describe('buttonEventHandler', () => {
        const acceptAction = Config.DEFAULTS.COOKIE_BANNER_CONFIG.actions[0];
        const acceptConfirmationNode = () => getBannerNode().querySelector('.' + acceptAction.confirmationClass);
        const rejectAction = Config.DEFAULTS.COOKIE_BANNER_CONFIG.actions[1];
        const rejectConfirmationNode = () => getBannerNode().querySelector('.' + rejectAction.confirmationClass);
        const hideAction = Config.DEFAULTS.COOKIE_BANNER_CONFIG.actions[2];

        beforeEach(async () => {
            await loadHTMLFromFile('CookieBanner.html');
        });

        test('Click on hide button should hide cookie banner', () => {
            const mockEvent = { preventDefault: jest.fn() };
            const cookieBannerHandler = new CookieBannerHandler(mockConfig, mockUserPreferences, mockCookieHandler);

            cookieBannerHandler._getBannerNode = jest.fn().mockReturnValue(getBannerNode());
            cookieBannerHandler._updatePreferences = jest.fn();

            cookieBannerHandler._clickEventHandler(mockEvent, hideAction.name, hideAction.confirmationClass, hideAction.consentCategories);
            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(getBannerNode().hidden).toBe(true);
            expect(cookieBannerHandler._updatePreferences).not.toHaveBeenCalled();
        });

        test('Click on accept button should hide banner message and show accept confirmation', () => {
            const mockEvent = { preventDefault: jest.fn() };
            const mockPreferences = { optionalCategory: false, optionalCategoryTwo: false };
            const expectedPreferences = { optionalCategory: true, optionalCategoryTwo: true };
            const cookieBannerHandler = new CookieBannerHandler(mockConfig, mockUserPreferences, mockCookieHandler);

            cookieBannerHandler._updatePreferences = jest.fn();
            cookieBannerHandler._getBannerNode = jest.fn().mockReturnValue(getBannerNode());
            when(mockUserPreferences.getPreferences).mockReturnValue(mockPreferences);

            cookieBannerHandler._clickEventHandler(mockEvent, acceptAction.name, acceptAction.confirmationClass, acceptAction.consentCategories);
            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(cookieBannerHandler._updatePreferences).toHaveBeenCalledWith(expectedPreferences);
            expect(getBannerNode().hidden).toBe(false);
            [...getBannerNode().children]
                .filter(child => !child.classList.contains(acceptAction.confirmationClass))
                .forEach(child => {
                    expect(child.hidden).toBe(true);
                });
            expect(acceptConfirmationNode().hidden).toBe(false);
        });

        test('Click on reject button should hide banner message and show reject confirmation', () => {
            const mockEvent = { preventDefault: jest.fn() };
            const mockPreferences = { optionalCategory: false, optionalCategoryTwo: false };
            const expectedPreferences = { optionalCategory: false, optionalCategoryTwo: false };
            const cookieBannerHandler = new CookieBannerHandler(mockConfig, mockUserPreferences, mockCookieHandler);

            cookieBannerHandler._updatePreferences = jest.fn();
            cookieBannerHandler._getBannerNode = jest.fn().mockReturnValue(getBannerNode());
            when(mockUserPreferences.getPreferences).mockReturnValue(mockPreferences);

            cookieBannerHandler._clickEventHandler(mockEvent, rejectAction.name, rejectAction.confirmationClass, rejectAction.consentCategories);
            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(cookieBannerHandler._updatePreferences).toHaveBeenCalledWith(expectedPreferences);
            expect(getBannerNode().hidden).toBe(false);
            [...getBannerNode().children]
                .filter(child => !child.classList.contains(rejectAction.confirmationClass))
                .forEach(child => {
                    expect(child.hidden).toBe(true);
                });
            expect(rejectConfirmationNode().hidden).toBe(false);
        });
    });
});
