import { Reliable } from '@core/repository/base/Reliable';
import axios from 'axios';
import cheerio from 'cheerio';

export default class CrawlUtil {
    public static async loadWebsite(url: string): Promise<string | null> {
        return await axios
            .get(url)
            .then(response => response.data)
            .catch(error => {
                error.status = (error.response && error.response.status) || 500;
                // console.log(error);
                return null;
            });
    }

    public static async loadWebsiteReliable(url: string): Promise<Reliable<string>> {
        try {
            const p = await axios.get(url);
            if (!p.data) {
                return Reliable.Failed("Error when loading website ["+url+"]. Status code " + p.status);
            } else return Reliable.Success<string>(p.data);

        } catch (e) {
            return Reliable.Failed<string>("Error when loading website ["+url+"]. ", e);
        }
    }


    public static async loadWebsiteWithCheerIo(url: string): Promise<any> {
        return await axios
            .get(url)
            .then(response => cheerio.load(response.data, { decodeEntities: false }))
            .catch(error => {
                error.status = (error.response && error.response.status) || 500;
                throw error;
            });
    }
}