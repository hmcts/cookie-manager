import { EventProcessor } from './EventHandler';

export default class PreferencesFormHandler {
    constructor (Config, UserPreferencesHandler, CookieHandler) {
        this._config = Config;
        this._userPreferencesHandler = UserPreferencesHandler;
        this._cookieHandler = CookieHandler;
    }

    init () {
        if (document.readyState === 'loading') {
            console.debug('DOM is not ready; adding event to bind to preference form when ready.');
            document.addEventListener('DOMContentLoaded', () => this.init());
            return;
        }

        if (this._getPreferencesForm()) {
            this._setupEventListeners();
            this._configureFormRadios();
            EventProcessor.emit('PreferenceFormInitialized');
        }
    }

    _getPreferencesForm () {
        return document.querySelector('.' + this._config.getPreferencesFormClass());
    }

    _setupEventListeners () {
        this._getPreferencesForm().addEventListener('submit', (event) => this._submitEventHandler(event));
    }

    _submitEventHandler (event) {
        event.preventDefault();

        const preferences = {};
        event.target
            .querySelectorAll('input[type="radio"]:checked')
            .forEach(radio => {
                const name = radio.getAttribute('name');
                const value = radio.getAttribute('value');
                preferences[name] = value === 'on';
            });

        EventProcessor.emit('PreferenceFormSubmitted', (preferences));
        this._updatePreferences(preferences);
    }

    _updatePreferences (preferences) {
        this._userPreferencesHandler.setPreferences(preferences);
        this._userPreferencesHandler.savePreferencesToCookie();
        this._cookieHandler.processCookies();
    }

    _configureFormRadios () {
        Object.entries(this._userPreferencesHandler.getPreferences())
            .forEach(entry => {
                const checkboxValue = entry[1] ? 'on' : 'off';
                const checkbox = this._getPreferencesForm().querySelector(`input[name=${entry[0]}][value=${checkboxValue}]`);
                if (checkbox) {
                    checkbox.checked = true;
                }
            });
    }
}
