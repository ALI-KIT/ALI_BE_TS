import { Reliable, Type } from "@core/repository/base/Reliable";
import express from "express";

export class CoreUtil {
    
    static async sendJsonResponse(func: () => Promise<Reliable<any>>, res: express.Response) {
        try {
            const reliable = await func();
            if (reliable.type == Type.SUCCESS) {
                res.status(200).json(reliable.data);
            } else {
                res.status(500).json(reliable);
            }
        } catch (err) {
            res.status(500).json(Reliable.Failed(err.message, err));
        }
    }
}