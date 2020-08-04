import { WebDomain } from '@entities/Domain';
import { WebCollector } from './WebCollector';
import CrawlUtil from 'src/utils/crawlUtils';

export interface ICrawler {}

export enum State {
       PENDING,
       STARTING,
       RUNNING,
       PAUSED,
       CANCELLED,
       FINISHED,
       FAILED
}

/**
 * Nhận một Domain và tiến hành crawl domain đó
 */
export abstract class WebCrawler implements ICrawler {
    private _collector : WebCollector;
    get collector(): WebCollector { return this._collector}

    public domain: WebDomain;
    public name: string;
    
    public startTime: number = Date.now();
    public endTime: number = 0;
    public status: State = State.PENDING;

    constructor(collector: WebCollector, name: string, domain : WebDomain) {
        this.domain = domain;
        this.name = name;
        this._collector = collector;
    }

    async execute() : Promise<any> {
        const url = this.domain.url;
        const html = await this.loadHtml(url);
        const result = await this.parse(html);
        return result; 
    }

    async enqueue() : Promise<any> {
        return await this.execute();
    }

    async loadHtml(url: string) : Promise<any>{
        return await CrawlUtil.loadWebsite(url);
    }

    abstract async parse($: any): Promise<any>;
}