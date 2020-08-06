import { Schema, model, Model, Document, CreateQuery, MongooseFilterQuery } from 'mongoose'

export abstract class IDao<T extends Document> {
    public model: Model<T, {}>
    public constructor(collectionName: string, schema: Schema<any>) {
        this.model = model<T>(collectionName, schema)
    }

    public async create(doc: CreateQuery<T>): Promise<T | Error | null> {
        try {
            const data = await this.model.create(doc);
            return data;
        }
        catch (error) {
            return error;
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

    public async getAll() : Promise<T[]> {
     return await this.model.find({});
    }
}