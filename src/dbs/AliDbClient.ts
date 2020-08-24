import { AliDbClientImpl } from './AliDbClientImpl';

export abstract class AliDbClient {
    private static instance = new AliDbClientImpl();

    public static getInstance() : AliDbClientImpl {
        if(!AliDbClient.instance.initted) {
            throw "AliDbClient is n't initted yet!"
        }
        return AliDbClient.instance;
    }

    public static async init(): Promise<void> {
        if(!AliDbClient.instance.initted) {
            await AliDbClient.instance.initDbs(AliDbClient.instance.baseUri);
            AliDbClient.instance.initted = true;
        }
    }

}