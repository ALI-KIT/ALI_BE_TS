
import { Crawler, State } from '@crawler/base/Crawler';
import PQueue from 'p-queue'
import { pid } from 'process';
import AppDatabase from '@daos/AppDatabase';
import { CreateQuery } from 'mongoose';
import { ICrawlerManager, RepeatMode } from './CrawlerManager';

export class CrawlerManager2 implements ICrawlerManager {
    public static readonly TIMEOUT_ENDLESS = -1;
    private static _count = 1;
    public static generateId(): number { return this._count++; }

    public id: number = CrawlerManager2.generateId();
    public name: string;
    public currentSession: string;

    private promiseQueue: PQueue;

    private crawlingList: Crawler<any>[] = [];
    private crawlUrlList: string[] = [];

    public repeatMode: RepeatMode = RepeatMode.IMMEDIATELY_AFTER;

    public timeout: number = CrawlerManager2.TIMEOUT_ENDLESS;
    public startTime: number = Date.now();
    public endTime: number = 0;
    public status: State = State.PENDING;
    public callback?: CollectorCallback


    public constructor(name?: string, session?: string) {
        this.name = name || this.startTime.toString();
        this.currentSession = session || this.startTime.toString();

        this.promiseQueue = new PQueue({ concurrency: 100 })
        this.promiseQueue.on('idle', () => {
            console.log(`Queue is idle.  Size: ${this.promiseQueue.size}  Pending: ${this.promiseQueue.pending}`);
        });
    }

    /**
     * Thêm crawler cho collector
     * @param crawler 
     */
    public addNewCrawler(crawler: Crawler<any>) {
        // TODO: Check trùng trong list
        // Check chưa từng chạy

        // push vào list
        // push vào promise queue
        // if (this.crawlUrlList.indexOf(crawler.url) > -1) {
        //     console.log('duplicated url: ' + crawler.url);
        // } else {
        //     this.crawlUrlList.push(crawler.url);
        //     this.crawlingList.push(crawler);
        //     this.addToQueue(crawler.id, crawler.priority);
        // }
        if (this.crawlUrlList.indexOf(crawler.url) > -1) {
            console.log('duplicated url: ' + crawler.url);
        } else if(crawler.priority===0) {
            console.log("enough!!! crawler.priority: "+ crawler.priority);
        }
        else{
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

    private addToQueue(crawlerId: number, priority: number) {
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

            const url = crawler.url;
            let error: string = ''

            const html = await crawler.loadHtml(url);
            let result;
            if (!html) error = 'crawler ' + crawler.name + ' ' + crawler.id + ' getting html failed with url ' + crawler.url;
            else if (error === '') {
                result = await crawler.parseHtml(html);
                if (!result) error = 'crawler ' + crawler.name + ' ' + crawler.id + ' failed to parsing html with url ' + crawler.url;


            }

            if (error === '') {
                const saveR = await crawler.saveResult(result);
                this.onCrawlerResult(result);
                if (saveR && saveR !== '') error = saveR;
            }

            if (error === '')
                crawler.state = State.FINISHED;
            else {
                crawler.state = State.FAILED;
                console.log(error);
            }

            crawler.manager = null;

            // remove from crawling list
            const currentPosition = this.crawlingList.indexOf(crawler);
            if (currentPosition >= -1)
                this.crawlingList.splice(currentPosition, 1)

            // - bắt đầu khởi tạo
            //   + Tìm Crawler phù hợp
            //   + Chạy crawler đó, attach vào collector
            //   + Ơ thế crawler là hữu hạn ?
            // - Chuyển state của domain sang running
            // - chạy crawl
            // - chuyển state về finished

        }, { priority })
    }

    private result: any[] = []
    public onCrawlerResult(result: any) {
        //TODO
    }

    public start(): void {
        //TODO
    }

    public cancel(): void {
        //TODO
    }

    public pause(): void {
        //TODO
    }



    public resume(): void {
        //TODO
    }


}

export interface CollectorCallback {
    onUpdateCrawler(crawler: Crawler<any>): void;
    onUpdateCollector(collector: CrawlerManager2): void;
}