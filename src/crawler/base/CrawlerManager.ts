import { Type } from '@core/repository/base/Reliable';
import { Crawler, State } from '@crawler/base/Crawler';
import PQueue from 'p-queue/dist';
export interface ICrawlerManager {
    addNewCrawler(crawler: Crawler<any>): any;
    isAllowRecursion: boolean;
}

export abstract class BaseCrawlerManager implements ICrawlerManager {
    protected static _count = 1;

    protected promiseQueue: PQueue;

    protected crawlingList: Crawler<any>[] = [];
    protected crawlUrlList: string[] = [];

    protected result: any[] = []

    public static readonly TIMEOUT_ENDLESS = -1;
    public static generateId(): number { return this._count++; }

    public id: number = CrawlerManager.generateId();
    public name: string;
    public currentSession: string;


    public repeatMode: RepeatMode = RepeatMode.IMMEDIATELY_AFTER;

    public timeout: number = CrawlerManager.TIMEOUT_ENDLESS;
    public startTime: number = Date.now();
    public endTime: number = 0;
    public status: State = State.PENDING;
    public callback?: Callback;
    public _isAllowRecursion: boolean = false;
    public willNotReceiveNewCrawler = false;

    // k phai
    get isAllowRecursion(): boolean {
        return this._isAllowRecursion
    }

    set isAllowRecursion(value: boolean) {
        this._isAllowRecursion = value
    }

    public constructor(name?: string, session?: string) {
        this.name = name || this.startTime.toString();
        this.currentSession = session || this.startTime.toString();
        this.promiseQueue = new PQueue({ concurrency: 100 })
        this.promiseQueue.on('idle', () => {
            console.log(`Queue is idle.  Size: ${this.promiseQueue.size}  Pending: ${this.promiseQueue.pending}`);
            this.status = State.FINISHED
            this.onIdle?.();
        });
        this.promiseQueue.on('active', () => {
            this.status = State.RUNNING
            this.onActive?.();
        });

    }

    public onIdle?: () => void;
    public onActive?: () => void;

    /**
     * Thêm crawler cho collector
     * @param crawler 
     */
    public addNewCrawler(crawler: Crawler<any>) {
        // TODO: Check trùng trong list
        // Check chưa từng chạy

        // push vào list
        // push vào promise queue

        //if(crawler.priority < 4) return; 

        // block receiving any new crawler task
        if (this.willNotReceiveNewCrawler) {
            return
        }

        if (this.crawlUrlList.indexOf(crawler.url) > -1) {
            console.log('duplicated url: ' + crawler.url);
        } else {

            this.crawlUrlList.push(crawler.url);
            this.crawlingList.push(crawler);
            this.addToQueue(crawler.id, crawler.priority);
        }
    }

    /**
     * Thêm domain vào 
     * @param domain vào hàng đợi
     */
    public findCrawlerByUrl(url: string, name: string = ''): Crawler<any> | null {
        return null;
    }

    public addCrawlerByUrl(priority: number, url: string, name: string = '') {
        const crawler = this.findCrawlerByUrl(url, name);
        if (crawler)
            crawler.priority = priority;
        if (crawler)
            this.addNewCrawler(crawler)
    }


    public findCrawlerById(id: number): Crawler<any> | null {
        return this.crawlingList.find((crawler) => crawler.id === id) || null
    }

    protected addToQueue(crawlerId: number, priority: number) {
        this.promiseQueue.add(async () => {
            // console.log('manager: starting new crawler')
            // TODO: 
            // - Chuyển state của domain sang starting
            const crawler = this.findCrawlerById(crawlerId);
            if (!crawler) return;

            crawler.manager = this;
            crawler.state = State.STARTING;
            // TODO: check crawler validation here

            crawler.state = State.RUNNING

            const reliable = await crawler.execute();

            if (reliable.type == Type.SUCCESS) {
                this.onCrawlerResult(reliable.data);
            }

            if (reliable.type == Type.SUCCESS)
                crawler.state = State.FINISHED;
            else {
                crawler.state = State.FAILED;
                console.log(reliable.message);

                if (reliable.error) {
                    console.log("This crawler throws an exception: " + reliable.error);
                }
            }

            crawler.manager = null;

            // remove from crawling list
            const currentPosition = this.crawlingList.indexOf(crawler);
            if (currentPosition >= -1)
                this.crawlingList.splice(currentPosition, 1)

        }, { priority })
    }

    public onCrawlerResult(result: any) {
        //TODO
    }

    public start(): void {
        //TODO
    }

    public cancel(): void {
        //TODO
        this.willNotReceiveNewCrawler = true;
        this.promiseQueue.clear();
    }

    public pause(): void {
        //TODO
    }

    public resume(): void {
        //TODO
    }

    public stop(): void {
        this.willNotReceiveNewCrawler = true;
        this.promiseQueue.clear()
    }

}

export enum RepeatMode {
    ONCE_TIME,
    IMMEDIATELY_AFTER,
    PER_HOUR,
    PER_HALF_HOUR,
    PER_SIX_HOUR,
    DAILY
}

export class CrawlerManager extends BaseCrawlerManager {

    protected constructor(name?: string, session?: string) {
        super(name, session)
    }

    private static instances: CrawlerManager[] = [];

    private static createInstance(name?: string, session?: string): CrawlerManager {
        const manager = new CrawlerManager(name);
        this.instances.push(manager)
        return manager;
    }

    public static getInstance(name?: string): CrawlerManager {
        return this.instances.find(manager => {
            return manager.name === name
        }) || CrawlerManager.createInstance(name);
    }

    public static findInstance(name?: string): CrawlerManager | null {
        return this.instances.find(manager => {
            return manager.name === name
        }) || null
    }
}

export interface Callback {
    onUpdateCrawler(crawler: Crawler<any>): void;
    onUpdateCollector(collector: CrawlerManager): void;
}