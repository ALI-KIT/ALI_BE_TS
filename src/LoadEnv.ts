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

export class EnvironmentConstant {
   
    public static readonly INSTANCE = new EnvironmentConstant();

    //  this is the mongodb uri of the local (local of server) 
    public static readonly URI_LOCAL = process.env.ENV_MONGODB_URI_LOCAL || "";

    // this is the mongodb uri of the atlas remote db
    public static readonly URI_REMOTE = process.env.ENV_MONGODB_URI_REMOTE || "";

    public static readonly ENV_MODE : Mode = (process.env.NODE_ENV === 'production') ? Mode.PRODUCTION : Mode.DEVELOPMENT;
    public static readonly IS_PRODUCTION : boolean = EnvironmentConstant.ENV_MODE == Mode.PRODUCTION;
    
    /**
     * Database tin tức sẽ lưu ở local (dung lượng lớn)
     */
    public static readonly NEWS_DB_URI : string = EnvironmentConstant.URI_LOCAL;

    /**
     * Còn database config sẽ lưu ở remote (dung lượng nhỏ)
     */
    public static readonly CONFIG_DB_URI : string = EnvironmentConstant.URI_REMOTE;

}