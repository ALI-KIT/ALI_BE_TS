import { Local } from '@entities/Local'
import { Document, Schema, model } from 'mongoose'
import { Domain } from '@entities/Domain'

export interface News extends Document {
    title: string
    summary: string
    content: string
    thumbnail: string

    crawlDate: Date
    publicationDate: Date
    aggregator: Domain
    source: Domain

    keywords: string[]
    locals: Local[]

    categories: string[]
}

/* const DomainSchema: Schema = new Schema({
    name: { type: String, required: true, default: '' },
    displayName: { type: String, default: "" },
    baseUrl: { type: String, default: '' },
    url: { type: String, default: '' }
}) */

export const NewsSchema: Schema = new Schema({
    title: { type: String, required: true, default: '' },
    summary: { type: String, required: true, default: '' },
    content: { type: String, required: true, default: '' },
    thumbnail: { type: String, required: false, default: '' },

    /* ngày kéo dữ liệu */
    crawlDate: {
        type: Date,
        default: Date.now()
    },

    /* ngày xuất bản */
    publicationDate: {
        type: Date,
        default: Date.now()
    },

    /* thông tin của trang tổng hợp tin tức */
    aggregator: {
        name: { type: String, default: '' },
        displayName: { type: String, default: '' },
        baseUrl: { type: String, default: '' },
        url: { type: String, default: '' },
        required: false
    },

    /* thông tin của trang bài viết gốc */
    source: {
        name: { type: String, default: '' },
        displayName: { type: String, default: '' },
        baseUrl: { type: String, default: '' },
        url: { type: String, default: '' },
        required: false
    },

    /* keywords, hay tags của tin bài */
    keywords: { type: Array, default: [] },

    /* địa phương liên quan của tin bài */
    locals: { type: Array, default: [] },

    /* Thể loại tin bài */
    categories: { type: Array, default: [] },
})