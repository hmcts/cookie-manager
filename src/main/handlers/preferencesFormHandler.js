export default function PreferencesFormHandler (Config, UserPreferencesHandler) {
    this._Config = Config;
    this._UserPreferencesHandler = UserPreferencesHandler;
}

PreferencesFormHandler.prototype.init = function () {
    if(this.getPreferencesForm()) {
        this.setupEventListeners();
        this.configureFormRadios();
    }
}

PreferencesFormHandler.prototype.getPreferencesForm = function () {
    return document.getElementById(this._Config.getPreferencesFormId());
}

PreferencesFormHandler.prototype.setupEventListeners = function () {
    this.getPreferencesForm().addEventListener('submit', this.submitEventHandler)
}

PreferencesFormHandler.prototype.submitEventHandler = function (event) {
    event.preventDefault();

    const preferences = {};
    event.target
        .querySelectorAll('input[type="radio"]:checked')
        .forEach(radio => {
            const name = radio.getAttribute('name');
            const value = radio.getAttribute('value');
            preferences[name] = value === 'on';
        })

    this.updatePreferences(preferences);
}

PreferencesFormHandler.prototype.updatePreferences = function (preferences) {
    this._UserPreferencesHandler.setPreferences(preferences);
    this._UserPreferencesHandler.savePreferencesToCookie();
}

PreferencesFormHandler.prototype.configureFormRadios = function () {
    Object.entries(this._UserPreferencesHandler.getPreferences())
        .forEach(([category, value]) => {
            const checkboxValue = value ? 'on' : 'off'
            const checkbox = this.getPreferencesForm().querySelector(`input[name=${category}][value=${checkboxValue}]`);
            if(checkbox) {
                checkbox.checked = true;
            }
        })
}
