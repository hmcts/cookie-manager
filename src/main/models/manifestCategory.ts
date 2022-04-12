export default class ManifestCategory {
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
