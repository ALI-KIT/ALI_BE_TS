import { Reliable } from "@core/repository/base/Reliable";
import { CrawlerManager } from "@crawler/base/CrawlerManager";
import { AppAnalyzer } from "@scripts/analyzer/AppAnalyzer";
import LoggingUtil from "@utils/LogUtil";

export class AppRunner {
    private constructor() { }

    private static instance: AppRunner;
    public appAnalyzer?: AppAnalyzer;
    public lastReliable: Reliable<any> = Reliable.Success("Empty");
    public lastMessage = "";
    public startAt = Date.now();
    public endAt = Date.now();

    public static getInstance(): AppRunner {
        if (!AppRunner.instance) {
            AppRunner.instance = new AppRunner();
        }

        return AppRunner.instance;
    }

    /**
     * Start or skip if any
     */
    public async start() {
        if (this.appAnalyzer) {
            this.lastMessage = "Already running";
            return;
        }

        this.lastMessage = "Created new session"
        this.appAnalyzer = new AppAnalyzer();
        this.startAt = Date.now();
        LoggingUtil.logToString = true;
        const result = await this.appAnalyzer.run();
        this.endAt = Date.now();
        this.lastReliable = result;
        this.appAnalyzer = null;
        this.lastMessage = "";
    }

    /**
     * Stop the old if any then start new session
     */
    public async restart() {
        this.stop();
        this.start();
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
            lastResult: this.lastReliable
        }
    }
}