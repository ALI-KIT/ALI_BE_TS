import { Reliable, Type } from '@core/repository/base/Reliable';
import { Crawler } from '@crawler/base/Crawler';
import { CrawlerManager } from '@crawler/base/CrawlerManager';
import AppDatabase from '@daos/AppDatabase';

export enum FilterAction {
    ON_ADDED_TO_MANAGER,
    ON_ADDED_TO_QUEUE,
    ON_SAVE_RESULT
}

export abstract class CrawlerFilter {
    constructor(protected readonly manager: CrawlerManager) { }
    public abstract name: string;

    public async filterAction(filterAction: FilterAction, crawler: Crawler<any>, logFailed: boolean = false): Promise<boolean> {
        const result = await this.onFilterActionForResult(filterAction, crawler);

        if (result.type == Type.FAILED && logFailed) {
            console.log("CrawlerFilter: The action " + FilterAction[filterAction] + " of crawler name = [" + crawler.name + "], url = [" + crawler.url + "] had been blocked by filter [" + result.data + "], reason = [" + result.message + "]" + ((result.error) ? (" and exception " + result.error) : ""));
        }

        return result.type == Type.SUCCESS;
    }

    async onFilterActionForResult(filterAction: FilterAction, crawler: Crawler<any>): Promise<Reliable<CrawlerFilter>> {
        return Reliable.Success(this);
    }
}

export abstract class CrawlerFilterComposite extends CrawlerFilter {
    public filters: CrawlerFilter[] = [];
    public async onFilterActionForResult(filterAction: FilterAction, crawler: Crawler<any>): Promise<Reliable<CrawlerFilter>> {
        for (let index = 0; index < this.filters.length; index++) {
            const childResult = await this.filters[index].onFilterActionForResult(filterAction, crawler);
            if (childResult.type == Type.FAILED) {
                return childResult;
            }
        }
        return Reliable.Success(this);
    }

}

export class AliCrawlerFilter extends CrawlerFilterComposite {
    public name = "AliCrawlerFilter";
    private enforceDenyFilter = new EnforceDenyReceivingCrawler(this.manager);

    constructor(manager: CrawlerManager) {
        super(manager);
        this.filters.push(this.enforceDenyFilter);
        this.filters.push(new CheckDuplicatedInCurrenSession(manager));
        this.filters.push(new CheckDuplicatedInDatabase(manager));
    }

    public enforceDenyReceivingAnyCrawler: boolean = false
    get() {
        return this.enforceDenyFilter.active;
    }
    set(value: boolean) {
        this.enforceDenyFilter.active = value;
    }
}

export class CheckDuplicatedInDatabase extends CrawlerFilter {
    public name = "CheckDuplicateDatabase";

    public async onFilterActionForResult(filterAction: FilterAction, crawler: Crawler<any>): Promise<Reliable<CrawlerFilter>> {
        switch (filterAction) {
            case FilterAction.ON_ADDED_TO_MANAGER:
            case FilterAction.ON_SAVE_RESULT:
                const found = (await AppDatabase.getInstance().news2Dao.findOne({ 'source.url': crawler.url })) ? true : false;
                if (found) {
                    return Reliable.Custom(Type.FAILED, "This url had been crawled before", undefined, this);
                }
        }
        return Reliable.Success(this);
    }
}

export class EnforceDenyReceivingCrawler extends CrawlerFilter {
    public name = "EnforceDenyReceivingCrawler";
    public active = false;
    public async onFilterActionForResult(filterAction: FilterAction, crawler: Crawler<any>): Promise<Reliable<CrawlerFilter>> {
        switch (filterAction) {
            case FilterAction.ON_ADDED_TO_MANAGER:
                if (this.active) {
                    return Reliable.Custom(Type.FAILED, "The crawler manager will not receive any crawler", undefined, this);
                }

        }
        return Reliable.Success(this);
    }
}

export class CheckDuplicatedInCurrenSession extends CrawlerFilter {
    public name = "CheckDuplicatedInCurrentSession";

    public async onFilterActionForResult(filterAction: FilterAction, crawler: Crawler<any>): Promise<Reliable<CrawlerFilter>> {
        switch (filterAction) {
            case FilterAction.ON_ADDED_TO_MANAGER:
                const crawled = this.manager.crawlUrlList.includes(crawler.url);
                if (crawled) {
                    return Reliable.Custom(Type.FAILED, "This url had been crawled already in current session", undefined, this);
                }
        }
        return Reliable.Success(this);
    }
}