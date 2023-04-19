import jwt from 'jsonwebtoken'
import {Request, Response, NextFunction} from 'express';

module.exports = function (req: Request | any, res: Response, next: NextFunction) {
    const token = req.header('X-Authorization');
    if(!token) return res.status(400).send('Invalid Authentication Token');

    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET!);
        req.user = verified;
        next();
    }catch(err){
        res.status(400).send('Invalid Authentication Token')
    }
}