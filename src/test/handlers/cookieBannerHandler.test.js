import { loadHTMLFromFile, wipeDocument } from '../common/common';
import { MockConfig } from '../common/mockConfig.js';
import { MockUserPreferences } from '../common/mockUserPreferences.js';
import CookieBannerHandler from '../../main/handlers/cookieBannerHandler.js';
import { when } from 'jest-when';

describe('CookieBannerHandler', () => {
    // Message wrappers
    const COOKIE_BANNER_ID = 'cookie-banner-id';

    let mockConfig;
    let mockUserPreferences;

    const getBannerNode = () => document.getElementById(COOKIE_BANNER_ID);

    beforeEach(() => {
        mockConfig = MockConfig();
        mockUserPreferences = MockUserPreferences();
    });

    describe('init', () => {
        test('DOM is not ready, so eventListener is added to DOM and cookie banner is setup when DOM ready', () => {
            const cookieBannerHandler = new CookieBannerHandler(mockConfig, mockUserPreferences);

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
            const cookieBannerHandler = new CookieBannerHandler(mockConfig, mockUserPreferences);

            cookieBannerHandler._setupEventListeners = jest.fn();
            cookieBannerHandler._getBannerNode = jest.fn().mockReturnValue(false);
            when(mockUserPreferences.getPreferenceCookie).mockReturnValue(false);

            cookieBannerHandler.init();
            expect(cookieBannerHandler._setupEventListeners).not.toHaveBeenCalled();
        });

        test('User preferences cookie is already set, so do not setup cookie banner', async () => {
            const cookieBannerHandler = new CookieBannerHandler(mockConfig, mockUserPreferences);

            cookieBannerHandler._setupEventListeners = jest.fn();
            cookieBannerHandler._getBannerNode = jest.fn().mockReturnValue({ hidden: true });
            when(mockUserPreferences.getPreferenceCookie).mockReturnValue(true);

            cookieBannerHandler.init();
            expect(cookieBannerHandler._setupEventListeners).not.toHaveBeenCalled();
            expect(cookieBannerHandler._getBannerNode().hidden).toBe(true);
        });

        test('User preferences cookie is not set and cookie banner exists in DOM, so setup cookie banner', async () => {
            const cookieBannerHandler = new CookieBannerHandler(mockConfig, mockUserPreferences);

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

            const expectedElement = document.getElementById(mockConfig.getCookieBannerId());
            const cookieBannerHandler = new CookieBannerHandler(mockConfig, mockUserPreferences);

            expect(cookieBannerHandler._getBannerNode()).toBe(expectedElement);
            expect(mockConfig.getCookieBannerId).toHaveBeenCalled();
        });

        test('Get null when cookie banner is configured incorrectly', async () => {
            await loadHTMLFromFile('CookieBanner.html');

            when(mockConfig.getCookieBannerId).mockReturnValue('some-incorrect-id');
            const cookieBannerHandler = new CookieBannerHandler(mockConfig, mockUserPreferences);

            expect(cookieBannerHandler._getBannerNode()).toBe(null);
            expect(mockConfig.getCookieBannerId).toHaveBeenCalled();
        });

        test('Get null when cookie banner does not exist in DOM', () => {
            wipeDocument();

            const cookieBannerHandler = new CookieBannerHandler(mockConfig, mockUserPreferences);

            expect(cookieBannerHandler._getBannerNode()).toBe(null);
            expect(mockConfig.getCookieBannerId).toHaveBeenCalled();
        });
    });

    describe('updatePreferences', () => {
        test('Consent to cookies', () => {
            const cookieBannerHandler = new CookieBannerHandler(mockConfig, mockUserPreferences);

            when(mockUserPreferences.getPreferences).mockReturnValue({ 'non-essential': false, 'another-non-essential': false });

            cookieBannerHandler._updatePreferences(true);
            expect(mockUserPreferences.setPreferences).toHaveBeenCalledWith({ 'non-essential': true, 'another-non-essential': true });
            expect(mockUserPreferences.savePreferencesToCookie).toHaveBeenCalled();
        });

        test('Do not consent to cookies', () => {
            const cookieBannerHandler = new CookieBannerHandler(mockConfig, mockUserPreferences);

            when(mockUserPreferences.getPreferences).mockReturnValue({ 'non-essential': false, 'another-non-essential': false });

            cookieBannerHandler._updatePreferences(false);
            expect(mockUserPreferences.setPreferences).toHaveBeenCalledWith({ 'non-essential': false, 'another-non-essential': false });
            expect(mockUserPreferences.savePreferencesToCookie).toHaveBeenCalled();
        });
    });

    describe('setupEventListeners', () => {
        beforeEach(async () => {
            await loadHTMLFromFile('CookieBanner.html');
        });

        test('Buttons have click listeners added if cookie banner exists in DOM', async () => {
            const cookieBannerHandler = new CookieBannerHandler(mockConfig, mockUserPreferences);

            cookieBannerHandler._getBannerNode = jest.fn().mockReturnValue(getBannerNode());

            const acceptButtonSpy = jest.spyOn(document.getElementsByClassName(CookieBannerHandler.DEFAULTS.ACCEPT_BUTT0N_CLASS)[0], 'addEventListener');
            const rejectButtonSpy = jest.spyOn(document.getElementsByClassName(CookieBannerHandler.DEFAULTS.REJECT_BUTT0N_CLASS)[0], 'addEventListener');

            cookieBannerHandler._setupEventListeners();
            expect(acceptButtonSpy).toHaveBeenCalledWith('click', expect.any(Function));
            expect(rejectButtonSpy).toHaveBeenCalledWith('click', expect.any(Function));
        });
    });

    describe('buttonEventHandler', () => {
        const getBannerMessageNode = () => getBannerNode().querySelector('.' + CookieBannerHandler.DEFAULTS.MESSAGE_CLASS);
        const getAcceptConfirmationNode = () => getBannerNode().querySelector('.' + CookieBannerHandler.DEFAULTS.ACCEPT_MESSAGE_CLASS);
        const getRejectConfirmationNode = () => getBannerNode().querySelector('.' + CookieBannerHandler.DEFAULTS.REJECT_MESSAGE_CLASS);

        beforeEach(async () => {
            await loadHTMLFromFile('CookieBanner.html');
        });

        test('Click on hide button should hide cookie banner', () => {
            const event = {
                preventDefault: jest.fn(),
                target: document.getElementsByClassName(CookieBannerHandler.DEFAULTS.HIDE_BUTT0N_CLASS)[0]
            };
            const cookieBannerHandler = new CookieBannerHandler(mockConfig, mockUserPreferences);

            cookieBannerHandler._clickEventHandler(event, event.target);
            expect(event.preventDefault).toHaveBeenCalled();
            expect(getBannerNode().hidden).toBe(true);
        });

        test('Click on accept button should hide banner message and show accept confirmation', () => {
            const acceptButtonNode = getBannerNode().querySelector('.' + CookieBannerHandler.DEFAULTS.ACCEPT_BUTT0N_CLASS);

            const event = {
                preventDefault: jest.fn(),
                target: acceptButtonNode
            };

            const cookieBannerHandler = new CookieBannerHandler(mockConfig, mockUserPreferences);
            cookieBannerHandler._updatePreferences = jest.fn();
            cookieBannerHandler._getBannerNode = jest.fn().mockReturnValue(getBannerNode());

            cookieBannerHandler._clickEventHandler(event, event.target);
            expect(event.preventDefault).toHaveBeenCalled();
            expect(cookieBannerHandler._updatePreferences).toHaveBeenCalledWith(true);
            expect(getBannerNode().hidden).toBe(false);
            expect(getBannerMessageNode().hidden).toBe(true);
            expect(getAcceptConfirmationNode().hidden).toBe(false);
            expect(getRejectConfirmationNode().hidden).toBe(true);
        });

        test('Click on reject button should hide banner message and show reject confirmation', () => {
            const rejectButtonNode = getBannerNode().querySelector('.' + CookieBannerHandler.DEFAULTS.REJECT_BUTT0N_CLASS);

            const event = {
                preventDefault: jest.fn(),
                target: rejectButtonNode
            };

            const cookieBannerHandler = new CookieBannerHandler(mockConfig, mockUserPreferences);
            cookieBannerHandler._updatePreferences = jest.fn();
            cookieBannerHandler._getBannerNode = jest.fn().mockReturnValue(getBannerNode());

            cookieBannerHandler._clickEventHandler(event, event.target);
            expect(event.preventDefault).toHaveBeenCalled();
            expect(cookieBannerHandler._updatePreferences).toHaveBeenCalledWith(false);
            expect(getBannerNode().hidden).toBe(false);
            expect(getBannerMessageNode().hidden).toBe(true);
            expect(getAcceptConfirmationNode().hidden).toBe(true);
            expect(getRejectConfirmationNode().hidden).toBe(false);
        });
    });
});
