import { Reliable } from '@core/repository/base/Reliable';
import { DbScript } from '@scripts/DbScript';
import CrawlUtil from '@utils/CrawlUtils';

const RUN_AT_STARTUP = true;
export class TestRawContentGetter extends DbScript<any> {
    protected async runInternal(): Promise<Reliable<any>> {
        const text = '<div><div>(PLO)- Cục Hàng không Việt Nam chấp thuận phương án vận hành máy bay khi đưa vào khai thác đường băng 25R/07L, thời gian dự kiến từ 0 giờ ngày 1-1-2021.</div></div><div><div></div></div><div><span>Tin liên quan</span><ul><li><h2><a href="https://plo.vn/do-thi/san-bay-tan-son-nhat-noi-ve-25000-dong-phi-gui-xe-950566.html">Sân bay Tân Sơn Nhất nói về 25.000 đồng phí gửi xe</a></h2></li><li><h2><a href="https://plo.vn/the-thao/cong-an-cua-khau-tan-son-nhat-co-hinh-the-dep-trong-90-ngay-949863.html">Công an Cửa khẩu Tân Sơn Nhất có hình thể đẹp trong 90 ngày</a></h2></li><li><h2><a href="https://plo.vn/do-thi/giao-thong/nang-cap-duong-lan-tan-son-nhat-xong-de-kip-don-tet-947581.html">Nâng cấp đường lăn Tân Sơn Nhất: Xong để kịp đón tết</a></h2></li></ul></div><div><div><div><p>Cục Hàng không Việt Nam vừa chấp thuận kế hoạch thi công chuyển đổi tên đường lăn, vị trí đỗ máy bay tại Cảng hàng không quốc tế Tân Sơn Nhất.</p><p>Theo đó, giai đoạn 1, chuyển đổi tên các vị trí đỗ máy bay bao gồm sơn kẻ tín hiệu nhận dạng và đầu vị trí đỗ; thay thế các biển báo liên quan đến các vị trí đỗ. Thời gian thực hiện 15-12 đến 20-12.</p><p>Giai đoạn 2, chuyển đổi toàn bộ tên các đường lăn bao gồm thay thế các biển báo liên quan đến tên các đường lăn. Thời gian thực hiện thi công chuyển đổi từ ngày 30-12 đến 31-12.</p><p><img src="https://image.plo.vn/w800/uploaded/2020/dqmbtwvo/2020_11_17/san-bay-tan-son-nhat_rqly_thumb.jpg" alt="Đổi tên đường lăn, sân đỗ máy bay tại Tân Sơn Nhất - ảnh 1" /><br /><em>Hiện sân bay Tân Sơn Nhất đang sửa chữa nâng cấp đường lăn và đường băng. Ảnh: Cục Hàng không </em></p><p>Cạnh đó, Cục Hàng không Việt Nam cũng chấp thuận phương án vận hành máy bay khi đưa vào khai thác đường băng 25R/07L, các đường lăn P1, P2, P5 và P6, thời gian dự kiến từ 0 giờ ngày 1-1-2021. Song song đó, điều chỉnh phương án khai thác và tên gọi các vị trí đỗ máy bay không khai thác trên đường lăn, vệt lăn tại sân bay, thời gian áp dụng dự kiến từ 0 giờ ngày 30-12.<br /></p><div></div><p><a href="https://plo.vn/tags/IEPhu6VjIEjDoG5nIEtow7RuZw==/cuc-hang-khong.html">Cục Hàng không</a> Việt Nam yêu cầu Cảng hàng không quốc tế Tân Sơn Nhất có trách nhiệm bố trí xe dẫn (Followme car) để dẫn máy bay trong suốt quá trình chuyển đổi tên đường lăn, sân đỗ máy bay và 30 ngày sau khi chuyển đổi. Duy trì hoạt động khai thác Cảng hàng không quốc tế Tân Sơn Nhất đảm bảo an ninh, an toàn.</p><p>Sân bay này cũng được giao nhiệm vụ thông báo các nội dung trên đến các hãng hàng không, cơ quan, đơn vị liên quan biết để phối hợp điều hành hoạt động khai thác tại cảng. Đồng thời, phối hợp chặt chẽ với Công ty Quản lý bay miền Nam trong quá trình cung cấp dịch vụ điều hành bay đảm bảo tuyệt đối an toàn hoạt động bay.</p><p>Được biết, hiện <a href="https://plo.vn/tags/IFPDom4gQmF5IFTDom4gU8ahbiBOaOG6pXQ=/san-bay-tan-son-nhat.html">sân bay Tân Sơn Nhất</a> đang cải tạo, nâng cấp đường lăn và đường băng. Việc điều chỉnh các nội dung trên nhằm phù hợp với các hạng mục vừa hoàn thành chuẩn bị đưa vào khai thác.</p><article><a href="https://plo.vn/do-thi/cuc-hang-khong-yeu-cau-khong-luu-giam-sat-toc-do-khi-tiep-can-928982.html"><img src="https://image.plo.vn/w800/uploaded/2020/dqmbtwvo/2020_11_17/khongluugiamsattocdolivj_lsjb.jpg" alt="Cục hàng không yêu cầu không lưu giám sát tốc độ khi tiếp cận" /></a><a href="https://plo.vn/do-thi/cuc-hang-khong-yeu-cau-khong-luu-giam-sat-toc-do-khi-tiep-can-928982.html">Cục hàng không yêu cầu không lưu giám sát tốc độ khi tiếp cận</a><div>(PLO)- Kiểm sát viên không lưu giám sát việc tuân thủ các giới hạn tốc độ của máy bay và báo cáo các trường hợp vi phạm về Cục hàng không để xử lý.</div></article></div><div><strong>V.LONG</strong><br /></div><div><div></div></div></div><div><ul><li></li></ul><ul><li></li><li></li><li></li></ul></div><div><div></div></div></div>'
        const result = CrawlUtil.getRawTextContent(text);
        return Reliable.Success(result);
    }

}

if (RUN_AT_STARTUP) {
    DbScript.exec(new TestRawContentGetter());
}