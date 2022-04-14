import { EventProcessor } from './eventHandler';
import Config from '../models/config';
import UserPreferences from './userPreferencesHandler';
import CookieHandler from './cookieHandler';

export default class CookieBannerHandler {
    constructor (
        private readonly config: Config,
        private readonly userPreferencesHandler: UserPreferences,
        private readonly cookieHandler: CookieHandler
    ) {}

    init () {
        if (this.userPreferencesHandler.getPreferenceCookie()) return;

        if (document.readyState === 'loading') {
            console.debug('DOM is not ready; adding event to bind to banner when ready.');
            document.addEventListener('DOMContentLoaded', () => this.init());
            return;
        }

        if (!this._getBannerNode()) return;

        if (document.getElementsByClassName(this.config.getPreferencesFormConfiguration().class)[0] &&
            !this.config.getCookieBannerConfiguration().showWithPreferencesForm
        ) return;

        this._setupEventListeners();
        this._getBannerNode().hidden = false;
        EventProcessor.emit('CookieBannerInitialized');
    }

    _setupEventListeners () {
        const actions = this.config.getCookieBannerConfiguration()?.actions || [];

        actions.forEach(action => {
            for (const button of this._getBannerNode().querySelectorAll('.' + action.buttonClass)) {
                button.addEventListener('click', (event) => {
                    this._clickEventHandler(event, action.name, action.confirmationClass, action.consent);
                });
            }
        });
    };

    _clickEventHandler (event: Event, name: string, confirmationClass?: string, consent?: string[] | boolean) {
        event.preventDefault();
        EventProcessor.emit('CookieBannerAction', name);

        if (confirmationClass) {
            for (const child of this._getBannerNode().children) {
                (child as HTMLDivElement).hidden = !child.classList.contains(confirmationClass);
            }
        } else {
            this._getBannerNode().hidden = true;
        }

        if (consent !== undefined) {
            const preferences = this.userPreferencesHandler.getPreferences();
            // If set to TRUE (consent all) or FALSE (reject all)
            if (typeof consent === 'boolean') {
                Object.keys(preferences).forEach(category => { preferences[category] = consent; });
            }

            // If is array of categories
            if (Array.isArray(consent)) {
                consent.forEach(category => { preferences[category] = true; });
            }

            this._updatePreferences(preferences);
        }
    }

    _updatePreferences (preferences: { [key: string]: boolean }) {
        this.userPreferencesHandler.setPreferences(preferences);
        this.userPreferencesHandler.savePreferencesToCookie();
        this.cookieHandler.processCookies();
    }

    _getBannerNode (): HTMLDivElement {
        return document.querySelector('.' + this.config.getCookieBannerConfiguration()?.class);
    };
}
