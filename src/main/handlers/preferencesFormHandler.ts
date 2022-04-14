import { EventProcessor } from './EventHandler';
import Config from '../models/config';
import UserPreferences from './userPreferencesHandler';
import CookieHandler from './cookieHandler';

export default class PreferencesFormHandler {
    constructor (
        private readonly config: Config,
        private readonly userPreferencesHandler: UserPreferences,
        private readonly cookieHandler: CookieHandler
    ) {}

    init () {
        if (document.readyState === 'loading') {
            console.debug('DOM is not ready; adding event to bind to preference form when ready.');
            document.addEventListener('DOMContentLoaded', () => this.init());
            return;
        }

        if (!this._getPreferencesForm()) {
            return;
        }

        this._setupEventListeners();
        this._configureFormRadios();
        EventProcessor.emit('PreferenceFormInitialized');
    }

    _getPreferencesForm () {
        return document.getElementsByClassName(this.config.getPreferencesFormConfiguration().class)[0];
    }

    _setupEventListeners () {
        this._getPreferencesForm().addEventListener('submit', (event) => this._submitEventHandler(event));
    }

    _submitEventHandler (event) {
        event.preventDefault();

        const preferences = {};

        for (const radio of event.target.querySelectorAll('input[type="radio"]:checked')) {
            const name = radio.getAttribute('name');
            const value = radio.getAttribute('value');
            preferences[name] = value === 'on';
        }

        EventProcessor.emit('PreferenceFormSubmitted', (preferences));
        this._updatePreferences(preferences);
    }

    _updatePreferences (preferences: { [key: string]: boolean }) {
        this.userPreferencesHandler.setPreferences(preferences);
        this.userPreferencesHandler.savePreferencesToCookie();
        this.cookieHandler.processCookies();
    }

    _configureFormRadios () {
        const preferences = this.userPreferencesHandler.getPreferences();
        for (const key in preferences) {
            const checkboxValue = preferences[key] ? 'on' : 'off';
            const checkbox: HTMLInputElement = this._getPreferencesForm().querySelector(`input[name=${key}][value=${checkboxValue}]`);
            if (checkbox) {
                checkbox.checked = true;
            }
        }
    }
}
