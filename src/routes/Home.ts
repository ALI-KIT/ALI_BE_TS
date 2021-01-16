import { Router } from "express";
import { ParamsDictionary } from 'express-serve-static-core';
import { OK } from "http-status-codes";

const router = Router();
router.post('/:id', async (request, response) => {
    const { id } = request.params as ParamsDictionary;
    response.status(OK).send('5692E86A11A31CE27EADF6F71F21B704');
})

export default router;