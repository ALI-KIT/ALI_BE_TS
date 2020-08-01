import { Request, Response, Router } from 'express';
let NewsService = require('../services/NewsService')
let PlaceService = require('../services/PlaceService')
let mongoose = require('mongoose');
import unidecode from 'unidecode'  

const router = Router();//.use(adminMW);

router.get('/', async (req: Request, res:Response) => {
    const { page, per_page, location } = req.query
    const loc = unidecode(location?.toString() || "all").trim().toLowerCase()
    const limit = Number(per_page || 21)
    const skip = limit * ((Number(page||1) > 1) ? (Number(page||1) - 1) : 0)
    try {
        if (loc == "all") {
            const [data, header] = await Promise.all([NewsService.getAll(limit, skip), NewsService.getMaxNewsAndMaxPage(limit)])
            res.status(200).header(header).json(data);
        } else {

            // const id = mongoose.Types.ObjectId('5f0ae0263a55493258285092');
            const place = await PlaceService.findOne({ "name": loc })
            if (place != null) {
                const { regex, flat } = place
                const pattern = RegExp(regex, flat)
                const condition = {
                    $or: [
                        { "title": { $regex: pattern } },
                        { "summary": { $regex: pattern } },
                        { "content": { $regex: pattern } },
                        { "category": { $regex: pattern } }
                    ]
                }
                const [data, header] = await Promise.all([NewsService.findAllWithCondition(condition, limit, skip), NewsService.getMaxNewsAndMaxPageWithCondition(condition, limit)])
                res.status(200).header(header).json(data);
            }
            else {
                let result = { error: "¯\_(ツ)_/¯" };
                res.status(500).send(result)
            }
        }
    } catch (error) {
        console.log(error);
        res.status(500).send(error)
    }
})

router.get('/content/:id', async (req, res, next) => {
    const id = unidecode(req.params.id).trim().toLowerCase() || "null"
    try {
        const oId = mongoose.Types.ObjectId(id);
        const data = await NewsService.get(oId) || { error: "¯\_(ツ)_/¯" };
        res.status(200).json(data)
    } catch (error) {
        res.status(500).send({ error: "¯\_(ツ)_/¯" })
    }

})

router.get('/quan9', async (req, res, next) => {
    try {
        const id = mongoose.Types.ObjectId('5f0ae0263a55493258285092');
        const { news, place } = await Promise.all(NewsService.findAllWithCondition({}), PlaceService.get(id))
        const { regex, flat } = place
        var result = news.filter(e => IsCorrectCondition(e, RegExp(regex, flat)))
        res.status(200).json(result)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get('/regex', async (req, res, next) => {
    const id = mongoose.Types.ObjectId('5f0ae0263a55493258285092');
    try {
        const data = await PlaceService.get(id)
        res.status(200).json(data);
    } catch (error) {
        console.log(error);
        res.status(500).send(error)
    }
})

const IsCorrectCondition = (obj, regex) => {
    for (const e in obj) {
        if (regex.test([obj[e]])) {
            return true;
        }
    }
    return false
}

module.exports = router