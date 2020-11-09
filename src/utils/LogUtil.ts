import { EnvironmentConstant } from '@loadenv';

export default class LoggingUtil {
    private static overrideConfiguration = false;
    private static _allowLoggin : boolean = false;
    public static allowLogging : boolean
    get() {
        return LoggingUtil._allowLoggin;
    }
    set(value: boolean) {
        LoggingUtil._allowLoggin = value;
        LoggingUtil.overrideConfiguration = true;
    }
    public static consoleLog(message?: any, ...optionalParams: any[]) {
        const enabled = (!EnvironmentConstant.IS_PRODUCTION) && (LoggingUtil.overrideConfiguration && LoggingUtil._allowLoggin)
        if (enabled) {
            if(message) {
            console.log(message, optionalParams);
            } else {
                console.log(message);
            }
        }
    }
}