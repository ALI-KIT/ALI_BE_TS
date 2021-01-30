import { GetInfo } from "@core/usecase/common/GetInfo";
import { CoreUtil } from "@utils/CoreUtil";
import { Router } from "express";

export const HomeRouter = Router();
HomeRouter.get('/', async (request, response) => {
    await CoreUtil.sendJsonResponse(new GetInfo().invoke, response);
})