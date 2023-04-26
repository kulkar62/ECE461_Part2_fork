import express, {Application, Request, Response, NextFunction, Router, ErrorRequestHandler} from 'express';
import Package from '../model/Package';
const router: Router = express.Router();

const verifyAdmin = require('../middleware/verifyAdmin')


router.delete('/reset', verifyAdmin, async (req: Request, res: Response, next: NextFunction) => {

    await Package.deleteMany()
    res.status(200).send('Registry has been reset successfully')

});

module.exports = router
