import express, {Application, Request, Response, NextFunction, Router, ErrorRequestHandler} from 'express';
import jwt from 'jsonwebtoken';
import { validAuthenticateReq } from '../middleware/verifyRequest';

const router: Router = express.Router();

router.put('/authenticate', validAuthenticateReq, (req: Request, res: Response, next: NextFunction) => {

    const { User, Secret } = req.body;
    const token = jwt.sign({ User }, process.env.TOKEN_SECRET!);
    res.send(token)
    

});
  
module.exports = router

