import { AppProcessEnvironment } from '@loadenv';
import LoggingUtil from '@utils/LogUtil';
import { AppAnalyzer } from './AppAnalyzer';

const RUN_AT_START_UP = true;
const script = new AppAnalyzer();

if (RUN_AT_START_UP) {
    script.run().then((reliable) => {
        LoggingUtil.consoleLog("Task finished with below data: ");
        LoggingUtil.consoleLog(reliable)
    }).catch(e => {
        LoggingUtil.consoleLog(e);
    }).finally(() => {
        process.exit(0);

    })
}
