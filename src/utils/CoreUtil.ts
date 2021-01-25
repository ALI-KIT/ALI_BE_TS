import { Reliable } from "@core/repository/base/Reliable";
import express from "express";

export class CoreUtil {
    public static tryCatchJsonReliableResponse(promise: Promise<Reliable<any>>, res: express.Response) {
      /*   try {
            res.status(200).json(promise()));
        } catch (err) {
            res.status(400).json({ message: err.message, error: err });
        } */
    }
}