import axios from 'axios';
import cheerio from 'cheerio';

export default class CrawlUtil {
    public static async loadWebsite(url: string): Promise<any> {
        return await axios
            .get(url)
            .then(response => cheerio.load(response.data, { decodeEntities: false }))
            .catch(error => {
                error.status = (error.response && error.response.status) || 500;
                throw error;
            });
    }
}