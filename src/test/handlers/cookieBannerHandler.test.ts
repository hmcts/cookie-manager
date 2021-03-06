import { MockUserPreferences } from '../common/mockUserPreferences';
import CookieBannerHandler from '../../main/handlers/cookieBannerHandler';
import { when } from 'jest-when';
import { loadHTMLFromFile, wipeDocument } from '../common/common';
import { ConfigHandler } from '../../main/handlers/configHandler';
import { CookieManagerConfig } from '../../main/interfaces/Config';

describe('CookieBannerHandler', () => {
    let mockConfig: CookieManagerConfig;
    let mockUserPreferences;
    let mockCookieHandler;
    const getBannerNode = (): HTMLDivElement => document.querySelector('.' + mockConfig.cookieBanner.class);

    beforeEach(() => {
        mockConfig = Object.create(ConfigHandler.defaultConfig);
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
                get () {
                    return readyState;
                },
                set (value) {
                    readyState = value;
                }
            });

            const documentSpy = jest.spyOn(document, 'addEventListener');
            const initSpy = jest.spyOn(cookieBannerHandler, 'init');
            cookieBannerHandler._setupEventListeners = jest.fn();
            cookieBannerHandler._getBannerNode = jest.fn().mockReturnValue({ hidden: true });
            when(mockUserPreferences.getPreferenceCookie).mockReturnValue(false);

            cookieBannerHandler.init();
            expect(documentSpy).toHaveBeenCalledWith('DOMContentLoaded', expect.any(Function));
            expect(initSpy).toHaveBeenCalledTimes(1);

            readyState = 'complete';
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

        describe('Cookie banner and preferences form are in the DOM together', () => {
            beforeEach(() => {
                const mockPreferencesFormElement = document.createElement('div');
                mockPreferencesFormElement.classList.add(mockConfig.preferencesForm.class);
                document.body.appendChild(mockPreferencesFormElement);
            });

            test('Cookie banner should be displayed when `showWithPreferencesForm` is set to true', () => {
                const cookieBannerHandler = new CookieBannerHandler(mockConfig, mockUserPreferences, mockCookieHandler);

                cookieBannerHandler._setupEventListeners = jest.fn();
                cookieBannerHandler._getBannerNode = jest.fn().mockReturnValue({ hidden: true });

                when(mockUserPreferences.getPreferenceCookie).mockReturnValue(false);
                mockConfig.cookieBanner = {
                    class: 'cookie-banner',
                    showWithPreferencesForm: true
                };

                cookieBannerHandler.init();
                expect(cookieBannerHandler._setupEventListeners).toHaveBeenCalled();
                expect(cookieBannerHandler._getBannerNode().hidden).toBe(false);
            });

            test('Cookie banner should be displayed when `showWithPreferencesForm` is set to false', () => {
                const cookieBannerHandler = new CookieBannerHandler(mockConfig, mockUserPreferences, mockCookieHandler);

                cookieBannerHandler._setupEventListeners = jest.fn();
                cookieBannerHandler._getBannerNode = jest.fn().mockReturnValue({ hidden: true });

                when(mockUserPreferences.getPreferenceCookie).mockReturnValue(false);
                mockConfig.cookieBanner = {
                    class: 'cookie-banner',
                    showWithPreferencesForm: false
                };

                cookieBannerHandler.init();
                expect(cookieBannerHandler._setupEventListeners).not.toHaveBeenCalled();
                expect(cookieBannerHandler._getBannerNode().hidden).toBe(true);
            });
        });
    });

    describe('getBannerNode', () => {
        test('Get cookie banner element when exists banner exists in DOM', async () => {
            await loadHTMLFromFile('CookieBanner.html');

            const expectedElement = getBannerNode();
            const cookieBannerHandler = new CookieBannerHandler(mockConfig, mockUserPreferences, mockCookieHandler);

            expect(cookieBannerHandler._getBannerNode()).toBe(expectedElement);
            expect(expectedElement).not.toBe(null);
        });

        test('Get null when cookie banner does not exist in DOM', () => {
            wipeDocument();

            const cookieBannerHandler = new CookieBannerHandler(mockConfig, mockUserPreferences, mockCookieHandler);

            expect(cookieBannerHandler._getBannerNode()).toBe(null);
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

            const acceptButtonSpy = jest.spyOn(document.getElementsByClassName(mockConfig.cookieBanner.actions[0].buttonClass)[0], 'addEventListener');
            const rejectButtonSpy = jest.spyOn(document.getElementsByClassName(mockConfig.cookieBanner.actions[1].buttonClass)[0], 'addEventListener');

            cookieBannerHandler._setupEventListeners();
            expect(acceptButtonSpy).toHaveBeenCalledWith('click', expect.any(Function));
            expect(rejectButtonSpy).toHaveBeenCalledWith('click', expect.any(Function));
        });
    });

    describe('clickEventHandler', () => {
        let acceptAction;
        let rejectAction;
        let hideAction;
        const acceptConfirmationNode = (): HTMLDivElement => getBannerNode().querySelector('.' + acceptAction.confirmationClass);
        const rejectConfirmationNode = (): HTMLDivElement => getBannerNode().querySelector('.' + rejectAction.confirmationClass);

        beforeEach(async () => {
            await loadHTMLFromFile('CookieBanner.html');
            acceptAction = mockConfig.cookieBanner.actions[0];
            rejectAction = mockConfig.cookieBanner.actions[1];
            hideAction = mockConfig.cookieBanner.actions[2];
        });

        describe('Confirmation class', () => {
            test('Action with no confirmation class should hide cookie banner', () => {
                const mockEvent = { preventDefault: jest.fn() } as unknown as Event;
                const cookieBannerHandler = new CookieBannerHandler(mockConfig, mockUserPreferences, mockCookieHandler);
                const mockPreferences = { analytics: false };
                const expectedPreferences = { analytics: true };

                when(mockUserPreferences.getPreferences).mockReturnValue(mockPreferences);
                cookieBannerHandler._getBannerNode = jest.fn().mockReturnValue(getBannerNode());
                cookieBannerHandler._updatePreferences = jest.fn();

                cookieBannerHandler._clickEventHandler(mockEvent, acceptAction.name, undefined, acceptAction.consent);
                expect(mockEvent.preventDefault).toHaveBeenCalled();
                expect(getBannerNode().hidden).toBe(true);
                expect(cookieBannerHandler._updatePreferences).toHaveBeenCalledWith(expectedPreferences);
            });

            test('Action with confirmation class should not hide cookie banner', () => {
                const mockEvent = { preventDefault: jest.fn() } as unknown as Event;
                const cookieBannerHandler = new CookieBannerHandler(mockConfig, mockUserPreferences, mockCookieHandler);
                const mockPreferences = { analytics: false };
                const expectedPreferences = { analytics: true };

                when(mockUserPreferences.getPreferences).mockReturnValue(mockPreferences);
                cookieBannerHandler._getBannerNode = jest.fn().mockReturnValue(getBannerNode());
                cookieBannerHandler._updatePreferences = jest.fn();

                cookieBannerHandler._clickEventHandler(mockEvent, acceptAction.name, acceptAction.confirmationClass, acceptAction.consent);
                expect(mockEvent.preventDefault).toHaveBeenCalled();
                expect(getBannerNode().hidden).toBe(false);
                expect(cookieBannerHandler._updatePreferences).toHaveBeenCalledWith(expectedPreferences);
            });
        });

        describe('Consent', () => {
            test('Action with no consent should not update user preferences', () => {
                const mockEvent = { preventDefault: jest.fn() } as unknown as Event;
                const cookieBannerHandler = new CookieBannerHandler(mockConfig, mockUserPreferences, mockCookieHandler);

                cookieBannerHandler._getBannerNode = jest.fn().mockReturnValue(getBannerNode());
                cookieBannerHandler._updatePreferences = jest.fn();

                cookieBannerHandler._clickEventHandler(mockEvent, acceptAction.name, acceptAction.confirmationClass);
                expect(mockEvent.preventDefault).toHaveBeenCalled();
                expect(getBannerNode().hidden).toBe(false);
                expect(mockUserPreferences.getPreferences).not.toHaveBeenCalled();
                expect(cookieBannerHandler._updatePreferences).not.toHaveBeenCalled();
            });

            test('Action with type of boolean consent attribute should update user preferences', () => {
                const mockEvent = { preventDefault: jest.fn() } as unknown as Event;
                const cookieBannerHandler = new CookieBannerHandler(mockConfig, mockUserPreferences, mockCookieHandler);
                const mockPreferences = { analytics: false };
                const expectedPreferences = { analytics: true };

                when(mockUserPreferences.getPreferences).mockReturnValue(mockPreferences);
                cookieBannerHandler._getBannerNode = jest.fn().mockReturnValue(getBannerNode());
                cookieBannerHandler._updatePreferences = jest.fn();

                cookieBannerHandler._clickEventHandler(mockEvent, acceptAction.name, acceptAction.confirmationClass, true);
                expect(mockEvent.preventDefault).toHaveBeenCalled();
                expect(getBannerNode().hidden).toBe(false);
                expect(mockUserPreferences.getPreferences).toHaveBeenCalled();
                expect(cookieBannerHandler._updatePreferences).toHaveBeenCalled();
                expect(cookieBannerHandler._updatePreferences).toHaveBeenCalledWith(expectedPreferences);
            });

            describe('Type of string array', () => {
                test('Action with type of string array consent attribute (single) should update user preferences', () => {
                    const mockEvent = { preventDefault: jest.fn() } as unknown as Event;
                    const cookieBannerHandler = new CookieBannerHandler(mockConfig, mockUserPreferences, mockCookieHandler);
                    const mockPreferences = { analytics: false, anotherCategory: false };
                    const expectedPreferences = { analytics: false, anotherCategory: true };

                    when(mockUserPreferences.getPreferences).mockReturnValue(mockPreferences);
                    cookieBannerHandler._getBannerNode = jest.fn().mockReturnValue(getBannerNode());
                    cookieBannerHandler._updatePreferences = jest.fn();

                    cookieBannerHandler._clickEventHandler(mockEvent, acceptAction.name, acceptAction.confirmationClass, ['anotherCategory']);
                    expect(mockEvent.preventDefault).toHaveBeenCalled();
                    expect(getBannerNode().hidden).toBe(false);
                    expect(mockUserPreferences.getPreferences).toHaveBeenCalled();
                    expect(cookieBannerHandler._updatePreferences).toHaveBeenCalled();
                    expect(cookieBannerHandler._updatePreferences).toHaveBeenCalledWith(expectedPreferences);
                });

                test('Action with type of string array consent attribute (multiple) should update user preferences (multiple)', () => {
                    const mockEvent = { preventDefault: jest.fn() } as unknown as Event;
                    const cookieBannerHandler = new CookieBannerHandler(mockConfig, mockUserPreferences, mockCookieHandler);
                    const mockPreferences = { analytics: false, anotherCategory: false, thirdCategory: false };
                    const expectedPreferences = { analytics: true, anotherCategory: true, thirdCategory: false };

                    when(mockUserPreferences.getPreferences).mockReturnValue(mockPreferences);
                    cookieBannerHandler._getBannerNode = jest.fn().mockReturnValue(getBannerNode());
                    cookieBannerHandler._updatePreferences = jest.fn();

                    cookieBannerHandler._clickEventHandler(mockEvent, acceptAction.name, acceptAction.confirmationClass, ['anotherCategory', 'analytics']);
                    expect(mockEvent.preventDefault).toHaveBeenCalled();
                    expect(getBannerNode().hidden).toBe(false);
                    expect(mockUserPreferences.getPreferences).toHaveBeenCalled();
                    expect(cookieBannerHandler._updatePreferences).toHaveBeenCalled();
                    expect(cookieBannerHandler._updatePreferences).toHaveBeenCalledWith(expectedPreferences);
                });
            });
        });

        test('Click on hide button should hide cookie banner', () => {
            const mockEvent = { preventDefault: jest.fn() } as unknown as Event;
            const cookieBannerHandler = new CookieBannerHandler(mockConfig, mockUserPreferences, mockCookieHandler);

            cookieBannerHandler._getBannerNode = jest.fn().mockReturnValue(getBannerNode());
            cookieBannerHandler._updatePreferences = jest.fn();

            cookieBannerHandler._clickEventHandler(mockEvent, hideAction.name, hideAction.confirmationClass, hideAction.consent);
            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(getBannerNode().hidden).toBe(true);
            expect(cookieBannerHandler._updatePreferences).not.toHaveBeenCalled();
        });

        test('Click on accept button should hide banner message and show accept confirmation', () => {
            const mockEvent = { preventDefault: jest.fn() } as unknown as Event;
            const mockPreferences = { optionalCategory: false, optionalCategoryTwo: false };
            const expectedPreferences = { optionalCategory: true, optionalCategoryTwo: true };
            const cookieBannerHandler = new CookieBannerHandler(mockConfig, mockUserPreferences, mockCookieHandler);

            cookieBannerHandler._updatePreferences = jest.fn();
            cookieBannerHandler._getBannerNode = jest.fn().mockReturnValue(getBannerNode());
            when(mockUserPreferences.getPreferences).mockReturnValue(mockPreferences);

            cookieBannerHandler._clickEventHandler(mockEvent, acceptAction.name, acceptAction.confirmationClass, acceptAction.consent);
            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(cookieBannerHandler._updatePreferences).toHaveBeenCalledWith(expectedPreferences);
            expect(getBannerNode().hidden).toBe(false);
            [...getBannerNode().children]
                .filter(child => !child.classList.contains(acceptAction.confirmationClass))
                .forEach((child: HTMLDivElement) => {
                    expect(child.hidden).toBe(true);
                });
            expect(acceptConfirmationNode().hidden).toBe(false);
        });

        test('Click on reject button should hide banner message and show reject confirmation', () => {
            const mockEvent = { preventDefault: jest.fn() } as unknown as Event;
            const mockPreferences = { optionalCategory: false, optionalCategoryTwo: false };
            const expectedPreferences = { optionalCategory: false, optionalCategoryTwo: false };
            const cookieBannerHandler = new CookieBannerHandler(mockConfig, mockUserPreferences, mockCookieHandler);

            cookieBannerHandler._updatePreferences = jest.fn();
            cookieBannerHandler._getBannerNode = jest.fn().mockReturnValue(getBannerNode());
            when(mockUserPreferences.getPreferences).mockReturnValue(mockPreferences);

            cookieBannerHandler._clickEventHandler(mockEvent, rejectAction.name, rejectAction.confirmationClass, rejectAction.consent);
            expect(mockEvent.preventDefault).toHaveBeenCalled();
            expect(cookieBannerHandler._updatePreferences).toHaveBeenCalledWith(expectedPreferences);
            expect(getBannerNode().hidden).toBe(false);
            [...getBannerNode().children]
                .filter(child => !child.classList.contains(rejectAction.confirmationClass))
                .forEach((child: HTMLDivElement) => {
                    expect(child.hidden).toBe(true);
                });
            expect(rejectConfirmationNode().hidden).toBe(false);
        });
    });
});
