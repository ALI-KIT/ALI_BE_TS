import { WebDomain } from '@entities/Domain';
import { WebCrawler, State } from './WebCrawler';
import PQueue from 'p-queue'

export interface IWebCollector {}
export enum RepeatMode {
    ONCE_TIME,
    IMMEDIATELY_AFTER,
    PER_HOUR,
    PER_HALF_HOUR,
    PER_SIX_HOUR,
    DAILY
}

export class WebCollector implements IWebCollector {
    public static readonly TIMEOUT_ENDLESS = -1;
    
    public name: string;
    public currentSession: string;

    private promiseQueue: PQueue;
    
    private domainList: WebDomain[] = [];
    private endedDomainList: WebDomain[] = [];

    private crawlerList: WebCrawler[] = [];
    public repeatMode: RepeatMode = RepeatMode.IMMEDIATELY_AFTER;

    public timeout: number = WebCollector.TIMEOUT_ENDLESS;
    public startTime: number = Date.now();
    public endTime: number = 0;
    public status : State = State.PENDING;
    public callback?: CollectorCallback

    public constructor(name?: string, session?: string) {
        this.name = name || this.startTime.toString();
        this.currentSession = session || this.startTime.toString();

        this.promiseQueue= new PQueue({concurrency: 100})

    }

    /**
     * Thêm crawler cho collector
     * @param crawler 
     */
    public addNewCrawler(crawler: WebCrawler) {
        this.crawlerList.push(crawler);
    }

    /**
     * Thêm domain vào 
     * @param domain vào hàng đợi
     */
    public addNewDomain(domain: WebDomain) {
        //TODO: Check trùng trong list
        // Check chưa từng chạy

        // push vào list
        // push vào promise queue


        this.domainList.push(domain);
        this.addDomainToPromiseQueue(domain);
    }

    private addDomainToPromiseQueue(domain: WebDomain) {
        async () => {
            await this.promiseQueue.add(() => {
                // TODO: 
                // - Chuyển state của domain sang starting
                // - bắt đầu khởi tạo
                //   + Tìm Crawler phù hợp
                //   + Chạy crawler đó, attach vào collector
                //   + Ơ thế crawler là hữu hạn ?
                // - Chuyển state của domain sang running
                // - chạy crawl
                // - chuyển state về finished
            })
        }
    }
    
    public start(): void {
    
    }

    public cancel(): void {

    }

    public pause(): void {

    }

    

    public resume(): void {

    }

   
}

export interface CollectorCallback {
       onUpdateCrawler(crawler: WebCrawler): void;
       onUpdateCollector(collector: WebCollector): void;
}