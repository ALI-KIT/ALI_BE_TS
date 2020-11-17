// Nhập mô-đun mongoose
import mongoose from 'mongoose'
import { AppProcessEnvironment } from '@loadenv';
import { AliDbClient } from './dbs/AliDbClient';

// Thiết lập một kết nối mongoose mặc định

// Ép Mongoose sử dụng thư viện promise toàn cục
mongoose.Promise = global.Promise;

const NEWS_DB_URI = AppProcessEnvironment.getProcessEnv().ENV_MONGODB_URI_LOCAL;
mongoose.connect(AppProcessEnvironment.NEWS_DB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true
}).then(() => {
    console.log("mongoose connected")
}).catch(e => {
    console.log(e);
    console.log("Process terniminated due to an exception from mongoose.")
    process.exit(1);
});

// Lấy kết nối mặc định
const globalConnection = mongoose.connection;

// // Ràng buộc kết nối với sự kiện lỗi (để lấy ra thông báo khi có lỗi)
globalConnection.on('error', console.error.bind(console, 'MongoDB connection error:'));

AliDbClient.connect().then(() => {
    console.log("ali-db connected")
});

export { globalConnection }