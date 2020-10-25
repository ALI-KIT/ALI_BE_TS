import { Reliable, Type } from '@core/repository/base/Reliable';
import '@loadenv';
import '@mongodb';
import CrawlUtil from '@utils/CrawlUtils';
import cheerio from 'cheerio';
import { Domain } from '@entities/Domain';
import Sitemapper from 'sitemapper';

class TestGetTuoiTreNews {
    public async run(): Promise<Reliable<any>> {
        const site = new Sitemapper({
            url:"https://zingnews.vn/sitemap/sitemap-news.xml"
        });

        const data = (await site.fetch()).sites;
        return Reliable.Success(data);

        const contentReliable = await CrawlUtil.loadWebsiteReliable("https://zingnews.vn/sitemap/sitemap-news.xml");

        if (contentReliable.type == Type.FAILED || !contentReliable.data) {
            return contentReliable;
        }

        const $ = cheerio.load(contentReliable.data!, { decodeEntities: false, xmlMode: true });
        const items: any[] = [];

        const urlNode = $("url");
        urlNode?.each(index => {
            const element = urlNode[index];
            const date2 = $(element).find('news\\:news news\\:publication');
            const date1 = $(element).find('news\\:news news\\:publication')?.first()?.text() || null;
            const date = new Date(date1 || Date.now());
            const data = {
                title: $(element).find('news\\:news news\\:title')?.first()?.text() || null,
                source: new Domain(
                    'tuoi-tre-online-sitemap',
                    'https://tuoitre.vn/',
                    "Tuổi Trẻ Online",
                    $(element).find('loc')?.first()?.text() || ""),
                publicationDate: date,
                thumbnail: $(element).find('image\\:image image\\:loc')?.first()?.text() || null,
                keywords: $(element).find('news\\:news news\\:keywords')?.first()?.text() || null
            };

            items.push(data);
        }
        );
        return Reliable.Success(items);
    }
};

new TestGetTuoiTreNews().run().then((reliable) => {
    console.log("Task finished with below data: ");
    console.log(reliable)
}).catch(e => {
    console.log(e);
}).finally(() => {
    process.exit(0);

})
