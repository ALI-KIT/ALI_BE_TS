import { Schema, model, Model, Document } from 'mongoose'

export abstract class IDao<T extends Document> {
    public model: Model<T, {}>
    public constructor(collectionName: string, schema: Schema<any>) {
        this.model = model<T>(collectionName, schema)
    }

    public async abstract create(item: T): Promise<T | Error | null>;

    public async findById(id: string): Promise<T | null> {
        return await this.model.findById(id);
    }

    public async findOne(condition: any): Promise<T | null> {
        return await this.model.findOne(condition);
    }

    public async findAll(condition: any): Promise<T[]> {
        return await this.model.find(condition) || [];
    }

    public async getAll() : Promise<T[]> {
     return await this.model.find({});
    }
}