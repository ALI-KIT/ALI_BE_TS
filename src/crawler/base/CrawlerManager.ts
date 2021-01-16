import { Type } from '@core/repository/base/Reliable';
import { Crawler, State } from '@crawler/base/Crawler';
import { AliCrawlerFilter, CrawlerFilter, FilterAction } from '@crawler/interactor/CrawlerFilter';
import LoggingUtil from '@utils/LogUtil';
import PQueue from 'p-queue/dist';
import { NewsCrawler } from './NewsCrawler';
export interface ICrawlerManager {
    addNewCrawler(crawler: Crawler<any>): Promise<void>;
    isAllowRecursion: boolean;
    isCachingResultInsteadOfSaving :boolean;
}

export class CrawlerManagerCounter {
    public AddRequest = 0;
    public RejectOnAddRequest = 0;

    public AddedToQueue = 0;

    public Started = 0;
    public ExecutionCount = 0;
    public FailedExecution = 0;
    public SuccessExecutionNonResult = 0;
    public SuccessExecutionWithResult = 0;
    public SuccessExecution = 0;

    public NonSaveResultCount = 0;

    public SavingResultCount = 0;
    public SavingSuccessResult = 0;
    public News_SavingSuccessResult = 0;
    public SavingFailedResult = 0;
    public Success = 0;
    public Failed = 0;
}

export abstract class BaseCrawlerManager implements ICrawlerManager {
    private static readonly MAX_PROMISE_CONCURRENCY = 1;
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
    public isCachingResultInsteadOfSaving = false;

    public readonly cachingResult: any[] = [];

    public readonly filter: AliCrawlerFilter = new AliCrawlerFilter(this);
    public readonly counter = new CrawlerManagerCounter();


    // should each crawler starting other crawler
    get isAllowRecursion(): boolean {
        return this._isAllowRecursion
    }

    set isAllowRecursion(value: boolean) {
        this._isAllowRecursion = value
    }

    public constructor(name?: string, session?: string) {
        this.name = name || this.startTime.toString();
        this.currentSession = session || this.startTime.toString();
        this.promiseQueue = new PQueue({ concurrency: CrawlerManager.MAX_PROMISE_CONCURRENCY })
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
            this.counter.ExecutionCount++;


            if (reliable.type == Type.FAILED) {
                this.counter.FailedExecution++;
            } else if (reliable.data) {
                this.counter.SuccessExecutionWithResult++;
                this.counter.SuccessExecution++;
            } else {
                this.counter.SuccessExecutionNonResult++;
                this.counter.SuccessExecution++;
            }

            // save result
            if (reliable.type == Type.SUCCESS && reliable.data) {
                // if flag {cachingResult} is turned on
                if (this.isCachingResultInsteadOfSaving) {
                    this.cachingResult.push(reliable.data);
                }
                else if (await this.filter.allowAction(FilterAction.ON_SAVE_RESULT, crawler, true)) {
                    // check if we should save result

                    reliable = await crawler.saveResult(reliable.data);
                    this.counter.SavingResultCount++;
                    if (reliable.type == Type.SUCCESS) {
                        this.counter.SavingSuccessResult++;
                        // check if this result is a news object
                        if (reliable.data && reliable.data?.title && reliable.data.source?.url) {
                            this.counter.News_SavingSuccessResult++;
                        }
                    } else {
                        this.counter.SavingFailedResult++;
                    }
                } else {
                    // do not save result
                    this.counter.NonSaveResultCount++;
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
            if (currentPosition >= -1) {
                this.crawlingList.splice(currentPosition, 1)
            }
            //LoggingUtil.consoleLog("Excuted " + this.counter.Excuted + ", Success = " + this.counter.Success + ", Failed = " + this.counter.Failed);

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
        await NewsCrawler.saveLeft();
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