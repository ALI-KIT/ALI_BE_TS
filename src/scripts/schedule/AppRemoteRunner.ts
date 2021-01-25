import { Reliable } from "@core/repository/base/Reliable";
import { CrawlerManager } from "@crawler/base/CrawlerManager";
import CrawlerScript from "@crawler/CrawlerScript";
import { AppAnalyzer } from "@scripts/analyzer/AppAnalyzer";
import LoggingUtil from "@utils/LogUtil";

export class AppRemoteRunner {
    private constructor() { }

    private static instance: AppRemoteRunner;
    public appAnalyzer?: AppAnalyzer;
    public lastReliable: Reliable<any> = Reliable.Success("Empty");
    public lastMessage = "";
    public startAt = Date.now();
    public endAt = Date.now();

    public static getInstance(): AppRemoteRunner {
        if (!AppRemoteRunner.instance) {
            AppRemoteRunner.instance = new AppRemoteRunner();
        }

        return AppRemoteRunner.instance;
    }

    /**
     * Start or skip if any
     */
    public async start(crawler: boolean, triggerAnalyticsOnly: boolean, analytics: boolean) {
        if (this.appAnalyzer) {
            this.lastMessage = "Already running";
            return;
        }

        this.lastMessage = "Created new session"
        this.appAnalyzer = new AppAnalyzer();
        this.appAnalyzer.runCrawlerTasks = crawler;
        this.appAnalyzer.triggerAnalyticsOnly = triggerAnalyticsOnly;
        this.appAnalyzer.runAnalyticsTask = analytics;
        this.startAt = Date.now();
        LoggingUtil.getInstance().isLogToString = true;
        let result: Reliable<any>;
        try {
            result = await this.appAnalyzer.run();
            LoggingUtil.consoleLog("Task finished with below data: ");
            LoggingUtil.consoleLog(result)
        } catch (e) {
            LoggingUtil.consoleLog(e);
        };

        this.endAt = Date.now();
        this.lastReliable = result;

        this.appAnalyzer = null;
        this.lastMessage = "";
    }

    /**
     * Stop the old if any then start new session
     */
    public async restart(crawler: boolean = true, triggerAnalyticsOnly: boolean, analytics: boolean = true) {
        this.stop();
        this.start(crawler, triggerAnalyticsOnly, analytics);
    }

    /**
     * Stop the running if any
     */
    public stop() {
        this.appAnalyzer = null;
    }

    public getStatus() {
        return {
            message: this.lastMessage,
            isRunning: (this.appAnalyzer != null && this.appAnalyzer != undefined),
            duration: Date.now() - this.startAt,
            startAt: new Date(this.startAt).toISOString(),
            managerCounter: (this.appAnalyzer?.tasks[0] as CrawlerScript)?.manager?.counter,
            lastResult: this.lastReliable
        }
    }
}