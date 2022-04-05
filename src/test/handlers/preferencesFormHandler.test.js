import PreferencesFormHandler from '../../main/handlers/preferencesFormHandler';
import { MockConfig } from '../common/mockConfig';
import { MockUserPreferences } from '../common/mockUserPreferences';
import { loadHTMLFromFile, wipeDocument } from '../common/common';
import { when } from 'jest-when';

describe('PreferencesFormHandler', () => {
    let mockConfig;
    let mockUserPreferences;
    const PREFERENCES_FORM_ID = 'cookie-preferences-form';
    const getPreferencesForm = () => document.getElementById(PREFERENCES_FORM_ID);

    beforeEach(() => {
        mockConfig = MockConfig();
        mockUserPreferences = MockUserPreferences();
    });

    describe('init', () => {
        test('DOM is not ready, so eventListener is added to DOM and preferences form is setup when DOM is loaded', () => {
            const preferencesFormHandler = new PreferencesFormHandler(mockConfig, mockUserPreferences);

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

            document.readyState = 'complete';
            document.dispatchEvent(new Event('DOMContentLoaded', {
                bubbles: true,
                cancelable: true
            }));

            expect(initSpy).toHaveBeenCalledTimes(2);
            expect(preferencesFormHandler._configureFormRadios).toHaveBeenCalled();
            expect(preferencesFormHandler._setupEventListeners).toHaveBeenCalled();
        });

        test('Preferences form does not exist in DOM, so do not setup form', () => {
            const preferencesFormHandler = new PreferencesFormHandler(mockConfig, mockUserPreferences);
            preferencesFormHandler._configureFormRadios = jest.fn();
            preferencesFormHandler._setupEventListeners = jest.fn();
            preferencesFormHandler._getPreferencesForm = jest.fn().mockReturnValue(false);

            preferencesFormHandler.init();
            expect(preferencesFormHandler._configureFormRadios).not.toHaveBeenCalled();
            expect(preferencesFormHandler._setupEventListeners).not.toHaveBeenCalled();
        });

        test('Preferences form exists in DOM, so setup form', () => {
            const preferencesFormHandler = new PreferencesFormHandler(mockConfig, mockUserPreferences);
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

        test('Get preferences form node when exists preferences form exists in DOM', async () => {
            const expectedElement = document.getElementById(mockConfig.getPreferencesFormId());
            const preferencesFormHandler = new PreferencesFormHandler(mockConfig, mockUserPreferences);

            expect(preferencesFormHandler._getPreferencesForm()).toBe(expectedElement);
            expect(mockConfig.getPreferencesFormId).toHaveBeenCalled();
        });

        test('Get null when preferences form is configured incorrectly', async () => {
            when(mockConfig.getPreferencesFormId).mockReturnValue('some-incorrect-id');
            const preferencesFormHandler = new PreferencesFormHandler(mockConfig, mockUserPreferences);

            expect(preferencesFormHandler._getPreferencesForm()).toBe(null);
            expect(mockConfig.getPreferencesFormId).toHaveBeenCalled();
        });

        test('Get null when preferences form does not exist in DOM', () => {
            wipeDocument();

            const preferencesFormHandler = new PreferencesFormHandler(mockConfig, mockUserPreferences);

            expect(preferencesFormHandler._getPreferencesForm()).toBe(null);
            expect(mockConfig.getPreferencesFormId).toHaveBeenCalled();
        });
    });

    describe('setupEventListeners', () => {
        beforeEach(async () => {
            await loadHTMLFromFile('PreferencesForm.html');
        });

        test('Form submission event has event listener attached', () => {
            const preferencesFormHandler = new PreferencesFormHandler(mockConfig, mockUserPreferences);

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
            const preferencesFormHandler = new PreferencesFormHandler(mockConfig, mockUserPreferences);

            preferencesFormHandler._updatePreferences = jest.fn();
            document.getElementsByName('analytics')[1].checked = true;
            document.getElementsByName('apm')[0].checked = true;

            preferencesFormHandler._submitEventHandler(event);
            expect(event.preventDefault).toHaveBeenCalled();
            expect(preferencesFormHandler._updatePreferences).toHaveBeenCalledWith({ analytics: false, apm: true });
        });

        test('Form submission should consent to multiple preferences', () => {
            const event = {
                preventDefault: jest.fn(),
                target: getPreferencesForm()
            };
            const preferencesFormHandler = new PreferencesFormHandler(mockConfig, mockUserPreferences);

            preferencesFormHandler._updatePreferences = jest.fn();
            document.getElementsByName('analytics')[0].checked = true;
            document.getElementsByName('apm')[0].checked = true;

            preferencesFormHandler._submitEventHandler(event);
            expect(event.preventDefault).toHaveBeenCalled();
            expect(preferencesFormHandler._updatePreferences).toHaveBeenCalledWith({ analytics: true, apm: true });
        });
    });

    describe('updatePreferences', () => {
        test('Should update preferences', () => {
            const preferences = { category: true, anotherCategory: true };
            const preferencesFormHandler = new PreferencesFormHandler(mockConfig, mockUserPreferences);
            preferencesFormHandler._updatePreferences(preferences);

            expect(mockUserPreferences.setPreferences).toHaveBeenCalledWith(preferences);
            expect(mockUserPreferences.savePreferencesToCookie).toHaveBeenCalled();
        });
    });

    describe('configureFormRadios', () => {
        beforeEach(async () => {
            await loadHTMLFromFile('PreferencesForm.html');
        });

        test('Disable all checkboxes', () => {
            const preferences = { apm: false, analytics: false };
            const preferencesFormHandler = new PreferencesFormHandler(mockConfig, mockUserPreferences);
            const apmOnRadio = document.getElementsByName('apm')[0];
            const apmOffRadio = document.getElementsByName('apm')[1];
            const analyticsOnRadio = document.getElementsByName('analytics')[0];
            const analyticsOffRadio = document.getElementsByName('analytics')[1];

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
            const preferencesFormHandler = new PreferencesFormHandler(mockConfig, mockUserPreferences);
            const apmOnRadio = document.getElementsByName('apm')[0];
            const apmOffRadio = document.getElementsByName('apm')[1];
            const analyticsOnRadio = document.getElementsByName('analytics')[0];
            const analyticsOffRadio = document.getElementsByName('analytics')[1];

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
            const preferencesFormHandler = new PreferencesFormHandler(mockConfig, mockUserPreferences);
            const apmOnRadio = document.getElementsByName('apm')[0];
            const apmOffRadio = document.getElementsByName('apm')[1];
            const analyticsOnRadio = document.getElementsByName('analytics')[0];
            const analyticsOffRadio = document.getElementsByName('analytics')[1];

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
