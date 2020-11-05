// Nhập mô-đun mongoose
import mongoose from 'mongoose'
import Bluebird from 'bluebird'
import { AliDbClient } from './dbs/AliDbClient';
import { EnvironmentConstant } from '@loadenv';

// Thiết lập một kết nối mongoose mặc định
const NEWS_DB_URI = process.env.ENV_MONGODB_URI_LOCAL;
mongoose.connect(EnvironmentConstant.NEWS_DB_URI, {
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
const globalConnection = mongoose.connection;

// // Ràng buộc kết nối với sự kiện lỗi (để lấy ra thông báo khi có lỗi)
globalConnection.on('error', console.error.bind(console, 'MongoDB connection error:'));

AliDbClient.connect().then(() => {
    console.log("ali-db connected")
});

export {globalConnection}