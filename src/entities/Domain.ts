
export interface IDomain {
    name: string,
    displayName: string,
    url: string,
}

export class Domain implements IDomain {
    public name: string;
    public displayName: string;
    public baseUrl: string;
    public url: string;
    public constructor(name: string, currentUrl: string, displayName: string = "", baseUrl: string = "") {
        this.name = name;
        this.url = currentUrl;
        this.displayName = displayName;
        this.baseUrl = baseUrl;
    }

}

/**
 * Domain dùng để crawl nội dung
 */
export class CrawlerDomain extends Domain {
    public priority: number = 5;
}