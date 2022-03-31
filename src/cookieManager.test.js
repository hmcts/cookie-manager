import CookieManager from "./cookieManager";
import {deleteAllCookies} from "./common.test";

describe('CookieManager', () => {
    const config = {
        'user-preference-cookie-name': 'preference-cookie',
        'cookie-manifest': [
            {
                "category-name": "essential",
                "optional": false,
                "cookies": [ "first-essential-cookie", "second-essential-cookie" ]
            },
            {
                "category-name": "non-essential",
                "optional": true,
                "cookies": [ "first-non-essential-cookie", "second-non-essential-cookie" ]
            },
            {
                "category-name": "another-non-essential",
                "optional": true,
                "cookies": [ "third-non-essential-cookie" ]
            }
        ]
    }


    test('init', () => {
        const cookieManager = new CookieManager(config);

        cookieManager.processCookies = jest.fn();

        cookieManager.init();
        expect(cookieManager.processCookies).toBeCalled();
    });

    describe('Process cookies', () => {
        const cookieOne = 'first-essential-cookie=cookie-value';
        const cookieTwo = 'second-non-essential-cookie=cookie-value';
        const cookieThree = 'third-non-essential-cookie=cookie-value';
        const cookieFour = 'first-non-essential-cookie=cookie-value';

        beforeEach(() => {
            deleteAllCookies();
        })

        test('Process cookies with default consent set to false', () => {
            const customConfig = {...config, 'default-consent-value': false }
            const cookieManager = new CookieManager(customConfig);
            document.cookie = cookieOne;
            document.cookie = cookieTwo;
            document.cookie = cookieThree;

            expect(document.cookie).toBe(`${cookieOne}; ${cookieTwo}; ${cookieThree}`);

            cookieManager.init();

            expect(document.cookie).toBe(`${cookieOne}`);
        });

        test('Process cookies with default consent set to true', () => {
            const customConfig = {...config, 'default-consent-value': true }
            const cookieManager = new CookieManager(customConfig);
            document.cookie = cookieOne;
            document.cookie = cookieTwo;
            document.cookie = cookieThree;

            expect(document.cookie).toBe(`${cookieOne}; ${cookieTwo}; ${cookieThree}`);

            cookieManager.init();
            cookieManager.processCookies();

            expect(document.cookie).toBe(`${cookieOne}; ${cookieTwo}; ${cookieThree}`);
        });

        test('Process cookies with user preferences set', () => {
            const customConfig = {...config, 'default-consent-value': false }
            const cookieManager = new CookieManager(customConfig);
            const preferenceCookie = `preference-cookie=${JSON.stringify({ 'non-essential': 'off', 'another-non-essential': 'on' })}`;
            document.cookie = cookieOne;
            document.cookie = cookieTwo;
            document.cookie = cookieThree;
            document.cookie = cookieFour;
            document.cookie = preferenceCookie;

            expect(document.cookie).toBe(`${cookieOne}; ${cookieTwo}; ${cookieThree}; ${cookieFour}; ${preferenceCookie}`);

            cookieManager.init();

            expect(document.cookie).toBe(`${cookieOne}; ${cookieThree}; ${preferenceCookie}`);
        });

        describe('Process cookies which are uncategorized', () => {

            beforeEach(() => {
                deleteAllCookies();
            })

            test('Processed uncategorized cookies should be deleted', () => {
                const customConfig = {...config, 'delete-undefined-cookies': true }
                const cookieManager = new CookieManager(customConfig);
                const preferenceCookie = `preference-cookie=${JSON.stringify({ 'non-essential': 'off', 'another-non-essential': 'on' })}`;

                document.cookie = cookieOne;
                document.cookie = 'uncategorized-cookie=cookie-value'
                document.cookie = preferenceCookie;

                expect(document.cookie).toBe(`${cookieOne}; uncategorized-cookie=cookie-value; ${preferenceCookie}`);

                cookieManager.init();

                expect(document.cookie).toBe(`${cookieOne}; ${preferenceCookie}`);
            });

            test('Processed uncategorized cookies should be kept', () => {
                const customConfig = {...config, 'delete-undefined-cookies': false }
                const cookieManager = new CookieManager(customConfig);
                const preferenceCookie = `preference-cookie=${JSON.stringify({ 'non-essential': 'off', 'another-non-essential': 'on'})}`;

                document.cookie = cookieOne;
                document.cookie = 'uncategorized-cookie=cookie-value'
                document.cookie = preferenceCookie;

                expect(document.cookie).toBe(`${cookieOne}; uncategorized-cookie=cookie-value; ${preferenceCookie}`);

                cookieManager.init();

                expect(document.cookie).toBe(`${cookieOne}; uncategorized-cookie=cookie-value; ${preferenceCookie}`);
            })
        });
    })
});