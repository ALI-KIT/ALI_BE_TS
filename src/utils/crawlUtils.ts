import axios from 'axios';
import cheerio from 'cheerio';

exports.loadWebSite = async (url: string) => {
    return await axios
        .get(url)
        .then(response => cheerio.load(response.data, { decodeEntities: false }))
        .catch(error => {
            error.status = (error.response && error.response.status) || 500;
            throw error;
        });
}