import { Reliable } from '@core/repository/base/Reliable';
import { Schema, model, Model, Document, CreateQuery, MongooseFilterQuery } from 'mongoose'

export abstract class Dao<T extends Document> {
    public model: Model<T, {}>


    public constructor(collectionName: string, schema: Schema<any>) {
        this.model = model<T>(collectionName, schema)
    }

    public async create(doc: CreateQuery<T>): Promise<Reliable<T>> {
        try {
            const data = await this.model.create(doc);
            return Reliable.Success(data);
        }
        catch (error) {
            return Reliable.Failed("Couldnot create new document", error);
        }
    }


    public async findById(id: string): Promise<T | null> {
        return await this.model.findById(id);
    }


    public async findOne(condition: MongooseFilterQuery<T>): Promise<T | null> {
        return await this.model.findOne(condition);
    }


    public async findAll(condition: any): Promise<T[]> {
        return await this.model.find(condition) || [];
    }


    public async getAll(): Promise<T[]> {
        return await this.model.find({});
    }
}