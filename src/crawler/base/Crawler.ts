import { Reliable, Type } from '@core/repository/base/Reliable';
import { ICrawlerManager } from '@crawler/base/CrawlerManager'; 
import CrawlUtil from '@utils/crawlUtils';
import { load } from 'cheerio';
import { BaseCrawlerManager } from './CrawlerManager';

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

    public id: number = BaseCrawlerManager.generateId();
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

    public async execute() : Promise<Reliable<T>> {
        const url = this.url;

        const loadHtmlReliable = await this.loadHtml(url);

        /* step: fetch html content */
        if(loadHtmlReliable.type == Type.FAILED) {
            return Reliable.Failed<T>(loadHtmlReliable.message, loadHtmlReliable.error ? loadHtmlReliable.error! : undefined);
        } else if(!loadHtmlReliable.data) {
            /* success but no data */
            return Reliable.Success<T>(null);
        }

        /* step: parse html content */
        const parseHtmlReliable = await this.parseHtml(loadHtmlReliable.data!);
        if(parseHtmlReliable.type == Type.FAILED) {
            return Reliable.Failed<T>(parseHtmlReliable.message, parseHtmlReliable.error ? parseHtmlReliable.error! : undefined);
        } else if(!parseHtmlReliable.data) {
            /* success but no data */
            return Reliable.Success<T>(null);
        }

        /* step: save data to database */
        const saveDataReliable = await this.saveResult(parseHtmlReliable.data!);
        return saveDataReliable;        
    }

    protected async loadHtml(url: string) : Promise<Reliable<string>>{
        return await CrawlUtil.loadWebsiteReliable(url);
    }

    protected abstract async parseHtml(content: string): Promise<Reliable<T>>;
    /**
     * Khi đã xong quá trình crawl. Crawler Manger gọi hàm này để crawler lưu lại kết quả đã crawl được.
     * @param result 
     */
    protected abstract async saveResult(result: T) : Promise<Reliable<T>>;
}