import PreferencesFormHandler from "../../main/handlers/preferencesFormHandler";
import {MockConfig} from "../common/mockConfig";
import {MockUserPreferences} from "../common/mockUserPreferences";
import {loadHTMLFromFile, wipeDocument} from "../common/common";
import {when} from "jest-when";


describe('PreferencesFormHandler', () => {
    let mockConfig;
    let mockUserPreferences;
    const PREFERENCES_FORM_ID = 'cookie-preferences-form';
    const getPreferencesForm = () => document.getElementById(PREFERENCES_FORM_ID);

    beforeEach(() => {
        mockConfig = MockConfig();
        mockUserPreferences = MockUserPreferences();
    })

    describe('init', () => {

        test('Preferences form does not exist in DOM, so do not setup form', () => {
            const preferencesFormHandler = new PreferencesFormHandler(mockConfig, mockUserPreferences);
            preferencesFormHandler.configureFormRadios = jest.fn();
            preferencesFormHandler.setupEventListeners = jest.fn();
            preferencesFormHandler.getPreferencesForm = jest.fn().mockReturnValue(false);

            preferencesFormHandler.init();
            expect(preferencesFormHandler.configureFormRadios).not.toHaveBeenCalled();
            expect(preferencesFormHandler.setupEventListeners).not.toHaveBeenCalled();
        });

        test('Preferences form exists in DOM, so setup form', () => {
            const preferencesFormHandler = new PreferencesFormHandler(mockConfig, mockUserPreferences);
            preferencesFormHandler.configureFormRadios = jest.fn();
            preferencesFormHandler.setupEventListeners = jest.fn();
            preferencesFormHandler.getPreferencesForm = jest.fn().mockReturnValue(true);

            preferencesFormHandler.init();
            expect(preferencesFormHandler.configureFormRadios).toHaveBeenCalled();
            expect(preferencesFormHandler.setupEventListeners).toHaveBeenCalled();
        });
    });

    describe('getPreferencesForm', () => {
        beforeEach(async () => {
            await loadHTMLFromFile('PreferencesForm.html');
        })

        test('Get preferences form node when exists preferences form exists in DOM', async () => {
            const expectedElement = document.getElementById(mockConfig.getPreferencesFormId());
            const preferencesFormHandler = new PreferencesFormHandler(mockConfig, mockUserPreferences);

            expect(preferencesFormHandler.getPreferencesForm()).toBe(expectedElement);
            expect(mockConfig.getPreferencesFormId).toHaveBeenCalled();
        });

        test('Get null when preferences form is configured incorrectly', async () => {
            when(mockConfig.getPreferencesFormId).mockReturnValue('some-incorrect-id');
            const preferencesFormHandler = new PreferencesFormHandler(mockConfig, mockUserPreferences);

            expect(preferencesFormHandler.getPreferencesForm()).toBe(null);
            expect(mockConfig.getPreferencesFormId).toHaveBeenCalled();
        });

        test('Get null when preferences form does not exist in DOM', () => {
            wipeDocument();

            const preferencesFormHandler = new PreferencesFormHandler(mockConfig, mockUserPreferences);

            expect(preferencesFormHandler.getPreferencesForm()).toBe(null);
            expect(mockConfig.getPreferencesFormId).toHaveBeenCalled();
        });
    });

    describe('setupEventListeners', () => {
        beforeEach(async () => {
            await loadHTMLFromFile('PreferencesForm.html');
        })

        test('Form submission event has event listener attached', () => {
            const preferencesFormHandler = new PreferencesFormHandler(mockConfig, mockUserPreferences);

            preferencesFormHandler.getPreferencesForm = jest.fn().mockReturnValue(getPreferencesForm());
            const preferencesFormSpy = jest.spyOn(getPreferencesForm(), 'addEventListener');

            preferencesFormHandler.setupEventListeners();
            expect(preferencesFormSpy).toHaveBeenCalledWith('submit', preferencesFormHandler.submitEventHandler);
        })
    });

    describe('submitEventHandler', () => {
        beforeEach(async () => {
            await loadHTMLFromFile('PreferencesForm.html');
        })

        test('Form submission should consent to single preference', () => {
            const event = {
                preventDefault: jest.fn(),
                target: getPreferencesForm()
            }
            const preferencesFormHandler = new PreferencesFormHandler(mockConfig, mockUserPreferences);

            preferencesFormHandler.updatePreferences = jest.fn();
            document.getElementsByName('analytics')[1].checked = true;
            document.getElementsByName('apm')[0].checked = true;

            preferencesFormHandler.submitEventHandler(event)
            expect(event.preventDefault).toHaveBeenCalled();
            expect(preferencesFormHandler.updatePreferences).toHaveBeenCalledWith({analytics: false, apm: true});
        });

        test('Form submission should consent to multiple preferences', () => {
            const event = {
                preventDefault: jest.fn(),
                target: getPreferencesForm()
            }
            const preferencesFormHandler = new PreferencesFormHandler(mockConfig, mockUserPreferences);

            preferencesFormHandler.updatePreferences = jest.fn();
            document.getElementsByName('analytics')[0].checked = true;
            document.getElementsByName('apm')[0].checked = true;

            preferencesFormHandler.submitEventHandler(event)
            expect(event.preventDefault).toHaveBeenCalled();
            expect(preferencesFormHandler.updatePreferences).toHaveBeenCalledWith({analytics: true, apm: true});
        })
    });

    describe('updatePreferences', () => {

        test('Should update preferences', () => {
            const preferences = {category: true, anotherCategory: true};
            const preferencesFormHandler = new PreferencesFormHandler(mockConfig, mockUserPreferences);
            preferencesFormHandler.updatePreferences(preferences);

            expect(mockUserPreferences.setPreferences).toHaveBeenCalledWith(preferences);
            expect(mockUserPreferences.savePreferencesToCookie).toHaveBeenCalled();
        })
    })

    describe('configureFormRadios', () => {
        beforeEach(async () => {
            await loadHTMLFromFile('PreferencesForm.html');
        })

        test('Disable all checkboxes', () => {
            const preferences = { apm: false, analytics: false };
            const preferencesFormHandler = new PreferencesFormHandler(mockConfig, mockUserPreferences);
            const apmOnRadio = document.getElementsByName('apm')[0];
            const apmOffRadio = document.getElementsByName('apm')[1];
            const analyticsOnRadio = document.getElementsByName('analytics')[0];
            const analyticsOffRadio = document.getElementsByName('analytics')[1];

            when(mockUserPreferences.getPreferences).mockReturnValue(preferences);
            preferencesFormHandler.getPreferencesForm = jest.fn().mockReturnValue(getPreferencesForm());

            preferencesFormHandler.configureFormRadios();
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
            preferencesFormHandler.getPreferencesForm = jest.fn().mockReturnValue(getPreferencesForm());

            preferencesFormHandler.configureFormRadios();
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
            preferencesFormHandler.getPreferencesForm = jest.fn().mockReturnValue(getPreferencesForm());

            preferencesFormHandler.configureFormRadios();
            expect(mockUserPreferences.getPreferences).toHaveBeenCalled();
            expect(apmOnRadio.checked).toBe(true);
            expect(apmOffRadio.checked).toBe(false);
            expect(analyticsOnRadio.checked).toBe(false);
            expect(analyticsOffRadio.checked).toBe(true);
        });
    })
})