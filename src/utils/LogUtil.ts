import { AppProcessEnvironment } from '@loadenv';

export default class LoggingUtil {
    private static overrideConfiguration = false;
    private static _allowLoggin: boolean = false;
    public static allowLogging: boolean;
    public static logToString: boolean = false;
    private static logString = "";
    public static getLogString() {
        return LoggingUtil.logString;
    }

    get() {
        return LoggingUtil._allowLoggin;
    }
    set(value: boolean) {
        LoggingUtil._allowLoggin = value;
        LoggingUtil.overrideConfiguration = true;
    }
    public static consoleLog(message?: any, ...optionalParams: any[]) {
        const enabled = (!AppProcessEnvironment.IS_PRODUCTION) && (!LoggingUtil.overrideConfiguration || (LoggingUtil.overrideConfiguration && LoggingUtil._allowLoggin))
        if (enabled) {
            LoggingUtil.consoleLogInternal(message, optionalParams);
        }
    }

    private static consoleLogInternal(message?: any, ...optionalParams: any[]) {
        if (!LoggingUtil.logToString) {
            if (message && optionalParams && optionalParams.length != 0) {
                console.log(message, optionalParams);
            } else {
                console.log(message);
            }
        } else {

            // log to string
            if (!LoggingUtil.logString) {
                LoggingUtil.logString = "";
            } else if (LoggingUtil.length > 200 * 100) {
                LoggingUtil.logString = LoggingUtil.logString.substring(0, 200 * 100 -1)
            }

            LoggingUtil.logString = message + "\n"+ LoggingUtil.logString;
        }
    }
}