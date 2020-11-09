import { Type } from '@core/repository/base/Reliable';
import { Crawler, State } from '@crawler/base/Crawler';
import { AliCrawlerFilter, CrawlerFilter, FilterAction } from '@crawler/interactor/CrawlerFilter';
import LoggingUtil from '@utils/LogUtil';
import PQueue from 'p-queue/dist';
export interface ICrawlerManager {
    addNewCrawler(crawler: Crawler<any>): Promise<void>;
    isAllowRecursion: boolean;
}

export class CrawlerManagerCounter {
    public AddRequest = 0;
    public RejectOnAddRequest = 0;

    public AddedToQueue = 0;

    public Started = 0;
    public Excuted = 0;
    public ExcutedFailed = 0;
    public ExcutedSuccessNonResult = 0;
    public ExcutedSuccessWithResult = 0;

    public RejectOnSaveResult = 0;

    public SaveResult = 0;
    public SaveResultSuccess = 0;
    public SaveResultSuccess_News = 0;
    public SaveResultFailed = 0;
    public Success = 0;
    public Failed = 0;
}

export abstract class BaseCrawlerManager implements ICrawlerManager {
    protected static _count = 1;

    protected readonly promiseQueue: PQueue;

    readonly crawlingList: Crawler<any>[] = [];
    readonly crawlUrlList: string[] = [];

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
    public readonly filter: AliCrawlerFilter = new AliCrawlerFilter(this);
    public readonly counter = new CrawlerManagerCounter();


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
        this.promiseQueue.timeout = 1000 * 60 * 5;
        this.promiseQueue.on('idle', () => {
            LoggingUtil.consoleLog(`Queue is idle.  Size: ${this.promiseQueue.size}  Pending: ${this.promiseQueue.pending}`);
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
    public async addNewCrawler(crawler: Crawler<any>): Promise<void> {
        // TODO: Check trùng trong list
        // Check chưa từng chạy

        // push vào list
        // push vào promise queue
        this.counter.AddRequest++;

        // block receiving any new crawler task
        const allowed = await this.filter.allowAction(FilterAction.ON_ADDED_TO_MANAGER, crawler, true)
        if (allowed) {
            this.crawlUrlList.push(crawler.url);
            this.crawlingList.push(crawler);
            this.counter.AddedToQueue++;
            this.addToQueue(crawler.id, crawler.priority);
        } else {
            this.counter.RejectOnAddRequest++;
        }
    }

    /**
     * Thêm domain vào 
     * @param domain vào hàng đợi
     */
    public findCrawlerByUrl(url: string, name: string = ''): Crawler<any> | null {
        return null;
    }

    public async addCrawlerByUrl(priority: number, url: string, name: string = '') {
        const crawler = this.findCrawlerByUrl(url, name);
        if (crawler)
            crawler.priority = priority;
        if (crawler)
            await this.addNewCrawler(crawler)
    }


    public findCrawlerById(id: number): Crawler<any> | null {
        return this.crawlingList.find((crawler) => crawler.id === id) || null
    }

    protected async addToQueue(crawlerId: number, priority: number) {
        await this.promiseQueue.add(async () => {
            // LogUtil.consoleLog('manager: starting new crawler')
            // TODO: 
            // - Chuyển state của domain sang starting
            const crawler = this.findCrawlerById(crawlerId);
            if (!crawler) return;

            crawler.manager = this;
            crawler.state = State.STARTING;
            this.counter.Started++;
            // TODO: check crawler validation here

            crawler.state = State.RUNNING

            // execute the crawler
            let reliable = await crawler.execute();
            this.counter.Excuted++;


            if (reliable.type == Type.FAILED) {
                this.counter.ExcutedFailed++;
            } else if (reliable.data) {
                this.counter.ExcutedSuccessWithResult++;
            } else {
                this.counter.ExcutedSuccessNonResult++;
            }

            // save result
            if (reliable.type == Type.SUCCESS && reliable.data) {
                // check if we should save result
                if (await this.filter.allowAction(FilterAction.ON_SAVE_RESULT, crawler, true)) {
                    reliable = await crawler.saveResult(reliable.data);
                    this.counter.SaveResult++;
                    if (reliable.type == Type.SUCCESS) {
                        this.counter.SaveResultSuccess++;
                        // check if this result is a news object
                        if(reliable.data && reliable.data._id && reliable.data.source?.url) {
                            this.counter.SaveResultSuccess_News ++;
                        }
                    } else {
                        this.counter.SaveResultFailed++;
                    }
                } else {
                    // do not save result
                    this.counter.RejectOnSaveResult++;
                }
            }

            if (reliable.type == Type.SUCCESS) {
                this.onCrawlerResult(reliable.data);
            }

            if (reliable.type == Type.SUCCESS) {
                crawler.state = State.FINISHED;
                this.counter.Success++;
            } else {
                crawler.state = State.FAILED;
                this.counter.Failed++;
                LoggingUtil.consoleLog("CrawlerManager: " + reliable.message);

                if (reliable.error) {
                    LoggingUtil.consoleLog("Exception: " + reliable.error);
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
        this.filter.enforceDenyReceivingAnyCrawler = true;
        this.promiseQueue.clear();
    }

    public pause(): void {
        //TODO
    }

    public resume(): void {
        //TODO
    }

    public stop(): void {
        this.filter.enforceDenyReceivingAnyCrawler = true;
        this.promiseQueue.clear()
    }

    public async waitToIdle() {
        await this.promiseQueue.onIdle();
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