import { EventProcessor } from './EventHandler';
import Config from '../models/config';
import UserPreferences from './userPreferencesHandler';
import CookieHandler from './cookieHandler';

export default class CookieBannerHandler {
    // eslint-disable-next-line no-useless-constructor
    constructor (
        private readonly config: Config,
        private readonly userPreferencesHandler: UserPreferences,
        private readonly cookieHandler: CookieHandler
    ) {}

    init () {
        if (document.readyState === 'loading') {
            console.debug('DOM is not ready; adding event to bind to banner when ready.');
            document.addEventListener('DOMContentLoaded', () => this.init());
            return;
        }

        const preferencesForm = document.querySelector('.' + this.config.getPreferencesFormClass());

        if (this._getBannerNode() && !preferencesForm && !this.userPreferencesHandler.getPreferenceCookie()) {
            this._setupEventListeners();
            this._getBannerNode().hidden = false;
            EventProcessor.emit('CookieBannerInitialized');
        }
    }

    _setupEventListeners () {
        const actions = this.config.getCookieBannerConfiguration()?.actions || [];

        actions.forEach(action => {
            this._getBannerNode().querySelectorAll('.' + action.buttonClass)
                .forEach(button => {
                    button.addEventListener('click', (event) => {
                        this._clickEventHandler(event, action.name, action.confirmationClass, action.consent);
                    });
                });
        });
    };

    _clickEventHandler (event: Event, name: string, confirmationClass?: string, consent?: string[] | boolean) {
        event.preventDefault();
        EventProcessor.emit('CookieBannerAction', name);

        if (confirmationClass) {
            for (const child of this._getBannerNode().children as HTMLCollection) {
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
