import jwt from 'jsonwebtoken'
import {Request, Response, NextFunction} from 'express';


interface Jwt {
    header: any;
    payload: JwtPayload | string;
    signature: string;
  }

  interface JwtPayload {
    User: {
      name: string;
      isAdmin: boolean;
    };
    iat: number;
  }

module.exports = function (req: Request | any, res: Response, next: NextFunction) {
    const token = req.header('X-Authorization');
    if(!token) return res.status(400).send('Invalid Authentication Token');

    const decodedToken = jwt.decode(token, { complete: true }) as Jwt;

    const payload = decodedToken.payload as JwtPayload;
    
    const isAdmin = payload.User.isAdmin;

    if(isAdmin)
    {
        try {
            const verified = jwt.verify(token, process.env.TOKEN_SECRET!);
            req.user = verified;
            next();
        }catch(err){
            res.status(400).send('Invalid Authentication Token')
        }
    }

    else
        res.status(401).send('You do not have permission to reset the registry')


    
}