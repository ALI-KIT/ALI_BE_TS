import { Reliable, Type } from '@core/repository/base/Reliable';
import '@loadenv';
import '@mongodb';
import CrawlUtil from '@utils/crawlUtils';
import cheerio from 'cheerio';
import { Domain } from '@entities/Domain';

class TestGetTuoiTreNews {
    public async run() : Promise<Reliable<any>> {
        const contentReliable = await CrawlUtil.loadWebsiteReliable("https://tuoitre.vn/Sitemap/GoogleNews.ashx");

        if(contentReliable.type == Type.FAILED|| !contentReliable.data) {
            return contentReliable;
        }

        const $ = cheerio.load(contentReliable.data!, {decodeEntities: false, xmlMode: true});
        const items: any[] = [];

        const urlNode = $("url");
        urlNode?.each(index => {
            const element = urlNode[index];
            const date2 =$(element).find('news\\:news news\\:publication');
            const date1 = $(element).find('news\\:news news\\:publication')?.first()?.text() || null;
            const date = new Date(date1 || Date.now());
            const data = {
                title: $(element).find('news\\:news news\\:title')?.first || "",
                source : new Domain(
                    'tuoi-tre-online-sitemap',
                    'https://tuoitre.vn/',
                     "Tuổi Trẻ Online",
                     $(element).find('loc')?.first()?.text() || ""),
                publicationDate: date,
                thumbnail: $(element).find('image\\:image image\\:loc')?.first()?.text() || "",
                keywords: $(element).find('news\\:news news\\:keywords')?.first()?.text() || "",
                };

                items.push(data);
            }
        );
        return Reliable.Success(items);
    }
};

new TestGetTuoiTreNews().run().then((reliable)=> {
    console.log("Task finished with below data: ");
    console.log(reliable)
}).catch(e=>{
    console.log(e);
}).finally(()=> {
    process.exit(0);

})
