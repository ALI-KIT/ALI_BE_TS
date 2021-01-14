import { Router } from "express";
import { ParamsDictionary } from 'express-serve-static-core';
import { OK } from "http-status-codes";

const router = Router();
router.post('/:id', async (request, response) => {
    const { id } = request.params as ParamsDictionary;
    response.status(OK).json({"message":"Invalid request"});
})

export default router;