import dotenv from 'dotenv';
import commandLineArgs from 'command-line-args';

// Setup command line options
const options = commandLineArgs([
    {
        name: 'env',
        alias: 'e',
        defaultValue: 'development',
        type: String,
    },
]);

// Set the env file
const result2 = dotenv.config({
    path: `${__dirname}/../env/${options.env}.env`,
});

if (result2.error) {
    throw result2.error;
}

export enum Mode {
    PRODUCTION,
    DEVELOPMENT
}

export class AppProcessEnvironment {

    public static getProcessEnv(): NodeJS.ProcessEnv {
        return process.env;
    }

    public static readonly INSTANCE = new AppProcessEnvironment();

    //  this is the mongodb uri of the local (local of server) 
    public static readonly URI_LOCAL = AppProcessEnvironment.getProcessEnv().ENV_MONGODB_URI_LOCAL || "";

    // this is the mongodb uri of the atlas remote db
    public static readonly URI_REMOTE = AppProcessEnvironment.getProcessEnv().ENV_MONGODB_URI_REMOTE || "";

    public static readonly ENV_MODE: Mode = (AppProcessEnvironment.getProcessEnv().NODE_ENV === 'production') ? Mode.PRODUCTION : Mode.DEVELOPMENT;
    public static readonly IS_PRODUCTION: boolean = AppProcessEnvironment.ENV_MODE == Mode.PRODUCTION;

    /**
     * Database tin tức sẽ lưu ở local (dung lượng lớn)
     */
    public static readonly NEWS_DB_URI: string = AppProcessEnvironment.URI_LOCAL;

    /**
     * Còn database config sẽ lưu ở remote (dung lượng nhỏ)
     */
    public static readonly CONFIG_DB_URI: string = AppProcessEnvironment.URI_REMOTE;

}