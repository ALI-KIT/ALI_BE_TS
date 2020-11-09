import { Request, Response, Router } from 'express';
import unidecode from 'unidecode';
import AppDatabase from '@daos/AppDatabase';
import { Place } from '@entities/Place';
import { News } from '@entities/News';

const newsDao = AppDatabase.getInstance().newsDao;
const placeDao = AppDatabase.getInstance().placeDao;
const router = Router();

router.get('/', async (req: Request, res: Response) => {
    // LogUtil.consoleLog('call this');
    const { page, per_page, location } = req.query
    const loc = unidecode(location?.toString() || 'all').trim().toLowerCase()
    const limit = Number(per_page || 21)
    const skip = limit * ((Number(page || 1) > 1) ? (Number(page || 1) - 1) : 0)

    try {
        if (loc === 'all') {
            const [data, header] = await Promise.all([newsDao.getAllPaging(limit, skip), newsDao.getMaxNewsAndMaxPage(limit)])
            res.status(200).header(header).json(data);
        } else {

            // const id = mongoose.Types.ObjectId('5f0ae0263a55493258285092');
            const place = await placeDao.findOne({ 'name': loc })
            if (place != null) {
                const { regex, flat } = place
                const pattern = RegExp(regex, flat)
                const condition = {
                    $or: [
                        { 'title': { $regex: pattern } },
                        { 'summary': { $regex: pattern } },
                        { 'content': { $regex: pattern } },
                        { 'category': { $regex: pattern } }
                    ]
                }
                const [data, header] = await Promise.all([newsDao.findAllWithCondition(condition, limit, skip), newsDao.getMaxNewsAndMaxPageWithCondition(condition, limit)])
                res.status(200).header(header).json(data);
            }
            else {
                const result = { error: '¯\_(ツ)_/¯' };
                res.status(500).send(result)
            }
        }
    } catch (error) {
        // LogUtil.consoleLog(error);
        res.status(500).send(error)
    }
});

router.get('/content/:id', async (req, res) => {
    const id = unidecode(req.params.id).trim().toLowerCase() || 'null'
    try {
        const data = await newsDao.findById(id) || { error: '¯\_(ツ)_/¯' };
        res.status(200).json(data)
    } catch (error) {
        res.status(500).send({ error: '¯\_(ツ)_/¯' })
    }

})

router.get('/quan9', async (req: Request, res: Response, next) => {
    try {
        const id = '5f0ae0263a55493258285092';
        const np = await Promise.all<News[], Place | null>([newsDao.findAll({}), placeDao.findById(id)])
        const regex = np[1]?.regex || '';
        const flat = np[1]?.flat;
        const result = np[0].filter(e => IsCorrectCondition(e, RegExp(regex, flat)))
        res.status(200).json(result)
    } catch (error) {
        res.status(500).send(error)
    }
})

router.get('/regex', async (req: Request, res: Response, next) => {
    const id = '5f0ae0263a55493258285092';
    try {
        const data = await placeDao.findById(id)
        res.status(200).json(data);
    } catch (error) {
        // LogUtil.consoleLog(error);
        res.status(500).send(error)
    }
})

const IsCorrectCondition = (obj: News, regex: RegExp) => {
    for (const e in obj) {
        if (regex.test(obj.title)
            || regex.test(obj.summary)
            || regex.test(obj.content)
        ) return true;
    }
    return false
}

export default router 