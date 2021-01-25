import { Reliable } from '@core/repository/base/Reliable';
import { Schema, Model, Document, CreateQuery, MongooseFilterQuery, Connection } from 'mongoose'

export class Dao<T extends Document> {
    public model: Model<T, {}> | null = null;

    public constructor(private collectionName: string, private schema: Schema<any>) { }

    public async init(connection: Connection): Promise<Reliable<any>> {
        this.model = connection.model<T>(this.collectionName, this.schema);
        return Reliable.Success(null);
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