import { WebDomain } from '@entities/Domain';
import { ICrawlerManager } from '@crawler/base/CrawlerManager'; 
import CrawlUtil from '@utils/crawlUtils';
import { DefaultCrawlerManager } from './CrawlerManager';

export interface ICrawler {
    name: string;
    displayName: string;
    baseUrl: string;
    url: string
}

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
export abstract class Crawler<T> implements ICrawler {

    public id: number = DefaultCrawlerManager.generateId();
    public name: string = this.getName();
    public displayName: string = this.getName();
    public baseUrl: string = this.getBaseUrl();
    public url: string;
    public priority: number = 5;

    public abstract getName(): string;
    public abstract getDisplayName(): string;
    public abstract getBaseUrl(): string ;

    private _manager? : ICrawlerManager;
    get manager(): ICrawlerManager | null { return this._manager || null}
    set manager(value: ICrawlerManager| null) {
        this._manager = value || undefined;
    }
    
    public startTime: number = Date.now();
    public endTime: number = 0;
    private _state: State = State.PENDING;
    public get state() { return this._state}
    public set state(value: State) { 
        if(value !== this._state) {
            const old  = this._state;
            this._state = value;
            this.notifyStateChanged(old, value);
        }
    } 

    public notifyStateChanged(oldState?: State, newState?: State) {
        // TODO
    }

    constructor(url: string, piority: number = 5, manager?: ICrawlerManager) {
        this.url = url;
        this.manager = manager || null;
        this.priority = piority;
    }

    async execute() : Promise<T | null> {
        const url = this.url;
        const html = await this.loadHtml(url);
        const result = html? await this.parseHtml(html) : null;
        return result; 
    }

    async loadHtml(url: string) : Promise<string | null>{
        return await CrawlUtil.loadWebsite(url);
    }

    abstract async parseHtml(html: string): Promise<T | null>;
    abstract async saveResult(result: T) : Promise<string>;
}