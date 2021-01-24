import { AppProcessEnvironment } from '@loadenv';

export default class LoggingUtil {
    private overrideConfiguration = false;
    public isAllowLogging: boolean = false;
    public isLogToString: boolean = false;
    private loggedString = "";

    private constructor() { }

    private static instance: LoggingUtil;


    public static getInstance(): LoggingUtil {
        if (!LoggingUtil.instance) {
            LoggingUtil.instance = new LoggingUtil();
        }

        return LoggingUtil.instance;
    }

    public static getLogString() {
        return LoggingUtil.getInstance().loggedString;
    }

    public static consoleLog(message?: any) {
        const enabled = (!AppProcessEnvironment.IS_PRODUCTION) && (!LoggingUtil.getInstance().overrideConfiguration || (LoggingUtil.getInstance().overrideConfiguration && LoggingUtil.getInstance().isAllowLogging))
        if (enabled) {
            LoggingUtil.consoleLogInternal(message);
        }
    }

    private static consoleLogInternal(message?: any) {
        if (!LoggingUtil.getInstance().isLogToString) {
            console.log(message);
        } else {

            // log to string
            if (!LoggingUtil.getInstance().loggedString) {
                LoggingUtil.getInstance().loggedString = "";
            } else if (LoggingUtil.length > 200 * 100) {
                LoggingUtil.getInstance().loggedString = LoggingUtil.getInstance().loggedString.substring(0, 200 * 100 - 1)
            }

            LoggingUtil.getInstance().loggedString = message + "\n" + LoggingUtil.getInstance().loggedString;
        }
    }
}