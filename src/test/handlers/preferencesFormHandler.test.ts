import PreferencesFormHandler from '../../main/handlers/preferencesFormHandler';
import { MockConfig } from '../common/mockConfig';
import { MockUserPreferences } from '../common/mockUserPreferences';
import { loadHTMLFromFile, wipeDocument } from '../common/common';
import { when } from 'jest-when';

describe('PreferencesFormHandler', () => {
    let mockConfig;
    let mockUserPreferences;
    let mockCookieHandler;
    const PREFERENCES_FORM_CLASS = 'cookie-preferences-form';
    const getPreferencesForm = () => document.querySelector('.' + PREFERENCES_FORM_CLASS);

    beforeEach(() => {
        mockConfig = MockConfig();
        mockUserPreferences = MockUserPreferences();
        mockCookieHandler = {
            processCookies: jest.fn()
        };
    });

    describe('init', () => {
        test('DOM is not ready, so eventListener is added to DOM and preferences form is setup when DOM is loaded', () => {
            const preferencesFormHandler = new PreferencesFormHandler(mockConfig, mockUserPreferences, mockCookieHandler);

            let readyState = 'loading';
            Object.defineProperty(document, 'readyState', {
                get () { return readyState; },
                set (value) { readyState = value; }
            });

            const documentSpy = jest.spyOn(document, 'addEventListener');
            const initSpy = jest.spyOn(preferencesFormHandler, 'init');
            preferencesFormHandler._configureFormRadios = jest.fn();
            preferencesFormHandler._setupEventListeners = jest.fn();
            preferencesFormHandler._getPreferencesForm = jest.fn().mockReturnValue(true);

            preferencesFormHandler.init();
            expect(documentSpy).toHaveBeenCalledWith('DOMContentLoaded', expect.any(Function));
            expect(initSpy).toHaveBeenCalledTimes(1);

            readyState = 'complete';
            document.dispatchEvent(new Event('DOMContentLoaded', {
                bubbles: true,
                cancelable: true
            }));

            expect(initSpy).toHaveBeenCalledTimes(2);
            expect(preferencesFormHandler._configureFormRadios).toHaveBeenCalled();
            expect(preferencesFormHandler._setupEventListeners).toHaveBeenCalled();
        });

        test('Preferences form does not exist in DOM, so do not setup form', () => {
            const preferencesFormHandler = new PreferencesFormHandler(mockConfig, mockUserPreferences, mockCookieHandler);
            preferencesFormHandler._configureFormRadios = jest.fn();
            preferencesFormHandler._setupEventListeners = jest.fn();
            preferencesFormHandler._getPreferencesForm = jest.fn().mockReturnValue(false);

            preferencesFormHandler.init();
            expect(preferencesFormHandler._configureFormRadios).not.toHaveBeenCalled();
            expect(preferencesFormHandler._setupEventListeners).not.toHaveBeenCalled();
        });

        test('Preferences form exists in DOM, so setup form', () => {
            const preferencesFormHandler = new PreferencesFormHandler(mockConfig, mockUserPreferences, mockCookieHandler);
            preferencesFormHandler._configureFormRadios = jest.fn();
            preferencesFormHandler._setupEventListeners = jest.fn();
            preferencesFormHandler._getPreferencesForm = jest.fn().mockReturnValue(true);

            preferencesFormHandler.init();
            expect(preferencesFormHandler._configureFormRadios).toHaveBeenCalled();
            expect(preferencesFormHandler._setupEventListeners).toHaveBeenCalled();
        });
    });

    describe('getPreferencesForm', () => {
        beforeEach(async () => {
            await loadHTMLFromFile('PreferencesForm.html');
        });

        test('Get preferences form node when exists preferences form exists in DOM', () => {
            const expectedElement = getPreferencesForm();
            const preferencesFormHandler = new PreferencesFormHandler(mockConfig, mockUserPreferences, mockCookieHandler);

            expect(preferencesFormHandler._getPreferencesForm()).toBe(expectedElement);
            expect(mockConfig.getPreferencesFormConfiguration).toHaveBeenCalled();
            expect(expectedElement).not.toBe(null);
        });

        test('Get undefined when preferences form is configured incorrectly', () => {
            when(mockConfig.getPreferencesFormConfiguration).mockReturnValue('some-incorrect-id');
            const preferencesFormHandler = new PreferencesFormHandler(mockConfig, mockUserPreferences, mockCookieHandler);

            expect(preferencesFormHandler._getPreferencesForm()).toBe(undefined);
            expect(mockConfig.getPreferencesFormConfiguration).toHaveBeenCalled();
        });

        test('Get undefined when preferences form does not exist in DOM', () => {
            wipeDocument();

            const preferencesFormHandler = new PreferencesFormHandler(mockConfig, mockUserPreferences, mockCookieHandler);

            expect(preferencesFormHandler._getPreferencesForm()).toBe(undefined);
            expect(mockConfig.getPreferencesFormConfiguration).toHaveBeenCalled();
        });
    });

    describe('setupEventListeners', () => {
        beforeEach(async () => {
            await loadHTMLFromFile('PreferencesForm.html');
        });

        test('Form submission event has event listener attached', () => {
            const preferencesFormHandler = new PreferencesFormHandler(mockConfig, mockUserPreferences, mockCookieHandler);

            preferencesFormHandler._getPreferencesForm = jest.fn().mockReturnValue(getPreferencesForm());
            const preferencesFormSpy = jest.spyOn(getPreferencesForm(), 'addEventListener');

            preferencesFormHandler._setupEventListeners();
            expect(preferencesFormSpy).toHaveBeenCalledWith('submit', expect.any(Function));
        });
    });

    describe('submitEventHandler', () => {
        beforeEach(async () => {
            await loadHTMLFromFile('PreferencesForm.html');
        });

        test('Form submission should consent to single preference', () => {
            const event = {
                preventDefault: jest.fn(),
                target: getPreferencesForm()
            };
            const preferencesFormHandler = new PreferencesFormHandler(mockConfig, mockUserPreferences, mockCookieHandler);

            preferencesFormHandler._updatePreferences = jest.fn();
            (document.getElementsByName('analytics')[1] as HTMLInputElement).checked = true;
            (document.getElementsByName('apm')[0] as HTMLInputElement).checked = true;

            preferencesFormHandler._submitEventHandler(event);
            expect(event.preventDefault).toHaveBeenCalled();
            expect(preferencesFormHandler._updatePreferences).toHaveBeenCalledWith({ analytics: false, apm: true });
        });

        test('Form submission should consent to multiple preferences', () => {
            const event = {
                preventDefault: jest.fn(),
                target: getPreferencesForm()
            };
            const preferencesFormHandler = new PreferencesFormHandler(mockConfig, mockUserPreferences, mockCookieHandler);

            preferencesFormHandler._updatePreferences = jest.fn();
            (document.getElementsByName('analytics')[0] as HTMLInputElement).checked = true;
            (document.getElementsByName('apm')[0] as HTMLInputElement).checked = true;

            preferencesFormHandler._submitEventHandler(event);
            expect(event.preventDefault).toHaveBeenCalled();
            expect(preferencesFormHandler._updatePreferences).toHaveBeenCalledWith({ analytics: true, apm: true });
        });
    });

    describe('updatePreferences', () => {
        test('Should update preferences', () => {
            const preferences = { category: true, anotherCategory: true };
            const preferencesFormHandler = new PreferencesFormHandler(mockConfig, mockUserPreferences, mockCookieHandler);
            preferencesFormHandler._updatePreferences(preferences);

            expect(mockUserPreferences.setPreferences).toHaveBeenCalledWith(preferences);
            expect(mockUserPreferences.savePreferencesToCookie).toHaveBeenCalled();
            expect(mockCookieHandler.processCookies).toHaveBeenCalled();
        });
    });

    describe('configureFormRadios', () => {
        beforeEach(async () => {
            await loadHTMLFromFile('PreferencesForm.html');
        });

        test('Disable all checkboxes', () => {
            const preferences = { apm: false, analytics: false };
            const preferencesFormHandler = new PreferencesFormHandler(mockConfig, mockUserPreferences, mockCookieHandler);
            const apmOnRadio = document.getElementsByName('apm')[0] as HTMLInputElement;
            const apmOffRadio = document.getElementsByName('apm')[1] as HTMLInputElement;
            const analyticsOnRadio = document.getElementsByName('analytics')[0] as HTMLInputElement;
            const analyticsOffRadio = document.getElementsByName('analytics')[1] as HTMLInputElement;

            when(mockUserPreferences.getPreferences).mockReturnValue(preferences);
            preferencesFormHandler._getPreferencesForm = jest.fn().mockReturnValue(getPreferencesForm());

            preferencesFormHandler._configureFormRadios();
            expect(mockUserPreferences.getPreferences).toHaveBeenCalled();
            expect(analyticsOnRadio.checked).toBe(false);
            expect(analyticsOffRadio.checked).toBe(true);
            expect(apmOnRadio.checked).toBe(false);
            expect(apmOffRadio.checked).toBe(true);
        });

        test('Enable all checkboxes', () => {
            const preferences = { apm: true, analytics: true };
            const preferencesFormHandler = new PreferencesFormHandler(mockConfig, mockUserPreferences, mockCookieHandler);
            const apmOnRadio = document.getElementsByName('apm')[0] as HTMLInputElement;
            const apmOffRadio = document.getElementsByName('apm')[1] as HTMLInputElement;
            const analyticsOnRadio = document.getElementsByName('analytics')[0] as HTMLInputElement;
            const analyticsOffRadio = document.getElementsByName('analytics')[1] as HTMLInputElement;

            when(mockUserPreferences.getPreferences).mockReturnValue(preferences);
            preferencesFormHandler._getPreferencesForm = jest.fn().mockReturnValue(getPreferencesForm());

            preferencesFormHandler._configureFormRadios();
            expect(mockUserPreferences.getPreferences).toHaveBeenCalled();
            expect(analyticsOnRadio.checked).toBe(true);
            expect(analyticsOffRadio.checked).toBe(false);
            expect(apmOnRadio.checked).toBe(true);
            expect(apmOffRadio.checked).toBe(false);
        });

        test('Enable mixture of checkboxes', () => {
            const preferences = { apm: true, analytics: false };
            const preferencesFormHandler = new PreferencesFormHandler(mockConfig, mockUserPreferences, mockCookieHandler);
            const apmOnRadio = document.getElementsByName('apm')[0] as HTMLInputElement;
            const apmOffRadio = document.getElementsByName('apm')[1] as HTMLInputElement;
            const analyticsOnRadio = document.getElementsByName('analytics')[0] as HTMLInputElement;
            const analyticsOffRadio = document.getElementsByName('analytics')[1] as HTMLInputElement;

            when(mockUserPreferences.getPreferences).mockReturnValue(preferences);
            preferencesFormHandler._getPreferencesForm = jest.fn().mockReturnValue(getPreferencesForm());

            preferencesFormHandler._configureFormRadios();
            expect(mockUserPreferences.getPreferences).toHaveBeenCalled();
            expect(apmOnRadio.checked).toBe(true);
            expect(apmOffRadio.checked).toBe(false);
            expect(analyticsOnRadio.checked).toBe(false);
            expect(analyticsOffRadio.checked).toBe(true);
        });
    });
});
