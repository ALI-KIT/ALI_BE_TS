import { Reliable } from '@core/repository/base/Reliable';
import { DynamicSource, SourceStatus, SourceType } from '@crawler/interactor/DynamicNewsSourceGetter';
import { MongoDbCrawlerClient } from '@daos/MongoDbCrawlerClient';
import { DbScript } from '@scripts/DbScript';

const RUN_AT_STARTUP = true;

/**
 * Đoạn script này tạo một số Dynamic News Source mẫu trong databasedatabase
 */
export class CreateInitialDynamicNewsSources extends DbScript<any> {
    protected async runInternal(): Promise<Reliable<any>> {
        const list: DynamicSource[] = [
            /* 24H, Tin moi */
            new DynamicSource(
                "24H",
                "https://cdn.24h.com.vn/upload/rss/tintuctrongngay.rss",
                SourceType.RSS,
                SourceStatus.ENABLED
            ),
            /* 24H, Trang chu */
            new DynamicSource(
                "24H",
                "https://cdn.24h.com.vn/upload/rss/trangchu24h.rss",
                SourceType.RSS,
                SourceStatus.ENABLED
            ),

            /* Tien Phong */
            new DynamicSource(
                "Tiền Phong",
                "https://www.tienphong.vn/rss/infographics-287.rss",
                SourceType.RSS,
                SourceStatus.ENABLED
            ),

            /* Tien Phong, Xã Hội */
            new DynamicSource(
                "Tiền Phong",
                "https://www.tienphong.vn/rss/xa-hoi-2.rss",
                SourceType.RSS,
                SourceStatus.ENABLED
            ),

            /* Tinh Tế */
            new DynamicSource(
                "Tinh Tế",
                "https://tinhte.vn/rss",
                SourceType.RSS,
                SourceStatus.ENABLED
            ),

            /* Báo Pháp Luật */
            new DynamicSource(
                "Báo Pháp Luật",
                "https://baophapluat.vn/rss/home.rss",
                SourceType.RSS,
                SourceStatus.ENABLED
            ),

            /* VTV */
            new DynamicSource(
                "VTV",
                "https://vtv.vn/trong-nuoc.rss",
                SourceType.RSS,
                SourceStatus.ENABLED
            ),

            /* Zing News */
            new DynamicSource(
                "Zing",
                "https://zingnews.vn/sitemap/sitemap-news.xml",
                SourceType.RSS,
                SourceStatus.ENABLED
            ),
            /* Kenh14 */
            new DynamicSource(
                "Kenh14",
                "https://kenh14.vn/Sitemaps/GoogleNews.ashx",
                SourceType.SITEMAP,
                SourceStatus.ENABLED
            ),

            /* PLO */
            new DynamicSource(
                "PLO",
                "https://plo.vn/sitemaps/newsindex.xml",
                SourceType.SITEMAP,
                SourceStatus.ENABLED
            )
        ]
        const collection = MongoDbCrawlerClient.getInstance().useServerConfig().collection("dynamic-news-sources");
        for (const ds of list) {

            await collection.updateOne({ url: ds.url }, {
                $set: {
                    displayName: ds.displayName,
                    url: ds.url,
                    priority: ds.priority,
                    status: DynamicSource.toStringStatus(ds.status),
                    type: DynamicSource.toStringType(ds.type)
                }
            }, { upsert: true });
        };

        return Reliable.Success("");
    }

}

if (RUN_AT_STARTUP) DbScript.exec(new CreateInitialDynamicNewsSources());