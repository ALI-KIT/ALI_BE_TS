// Nhập mô-đun mongoose
import mongoose from 'mongoose'
import Bluebird from 'bluebird'

// Thiết lập một kết nối mongoose mặc định
const mongoDB: string = process.env.MONGODB_URI || '';
mongoose.connect(mongoDB, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
})
    .then(() => { /* TODO */ })
    .catch(err => {
        console.log(`DB Connection Error: ${err.message}`);
    });
// Ép Mongoose sử dụng thư viện promise toàn cục
mongoose.Promise = Bluebird;
// Lấy kết nối mặc định
const db = mongoose.connection;

// // Ràng buộc kết nối với sự kiện lỗi (để lấy ra thông báo khi có lỗi)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

export {mongoDB, db}