import { Reliable, Type } from '@core/repository/base/Reliable';
import { ICrawlerManager } from '@crawler/base/CrawlerManager';
import CrawlUtil from '@utils/CrawlUtils';
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

    private _manager?: ICrawlerManager = undefined;

    public startTime: number = Date.now();
    public endTime: number = 0;
    private _state: State = State.PENDING;

    public priority: number;
    public name: string;
    public readonly baseUrl: string;

    constructor(public url: string,
        public readonly displayName: string = CrawlUtil.prettyUrl(url).data || "",
    ) {
        this.baseUrl = CrawlUtil.baseUrl(url).data || "";
        this.name = CrawlUtil.prettyUrl(url).data || "";
        this.priority = 5;
    }

    get manager(): ICrawlerManager | null { return this._manager || null }
    set manager(value: ICrawlerManager | null) {
        this._manager = value || undefined;
    }


    public get state() { return this._state }
    public set state(value: State) {
        if (value !== this._state) {
            const old = this._state;
            this._state = value;
            this.notifyStateChanged(old, value);
        }
    }

    public notifyStateChanged(oldState?: State, newState?: State) {
        // TODO
    }



    /**
     * Chạy crawler này.
     * Bao gồm các bước: fetch trang web, phân tích trang và trả về kết quả
     */
    public abstract execute(): Promise<Reliable<T>>;

    /**
     * * Khi đã xong quá trình crawl. Crawler Manger gọi hàm này để crawler lưu lại kết quả đã crawl được.
     *   Có thể trả về bất cứ thứ gì vì Crawler Manager chỉ quan tâm trạng thái Success or Failed
     * * @param result
     */
    public abstract saveResult(result: T): Promise<Reliable<any>>;
}

export abstract class HtmlCrawler<T> extends Crawler<T> {
    public async execute(): Promise<Reliable<T>> {
        const url = this.url;

        const loadHtmlReliable = await this.loadHtml(url);

        /* step: fetch html content */
        if (loadHtmlReliable.type == Type.FAILED) {
            return Reliable.Failed<T>(loadHtmlReliable.message, loadHtmlReliable.error ? loadHtmlReliable.error! : undefined);
        } else if (!loadHtmlReliable.data) {
            /* success but no data */
            return Reliable.Success<T>(null);
        }

        /* step: parse html content */
        const parseHtmlReliable = await this.parseHtml(loadHtmlReliable.data!);
        return parseHtmlReliable;
    }

    protected async loadHtml(url: string): Promise<Reliable<string>> {
        return await CrawlUtil.loadWebsiteReliable(url);
    }

    protected abstract parseHtml(content: string): Promise<Reliable<T>>;
}