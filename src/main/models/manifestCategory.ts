export default class ManifestCategory {
    // eslint-disable-next-line no-useless-constructor
    constructor (
        private readonly name: string,
        private readonly cookies: string[] = [],
        private readonly optional: boolean = true,
        private readonly matchBy: string = 'startsWith'
    ) {}

    getName () {
        return this.name;
    };

    getCookies () {
        return this.cookies;
    }

    getMatchBy () {
        return this.matchBy;
    }

    isOptional () {
        return this.optional;
    };
}
