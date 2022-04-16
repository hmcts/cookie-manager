export interface CookieCategory {
    readonly name: string;
    readonly cookies?: string[];
    readonly optional?: boolean;
    readonly matchBy?: string;
}
