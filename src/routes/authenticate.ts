import express, {Application, Request, Response, NextFunction, Router, ErrorRequestHandler} from 'express';
import jwt from 'jsonwebtoken';
import Ajv from 'ajv';

const router: Router = express.Router();

interface AuthRequest {
    User: {
      name: string;
      isAdmin: boolean;
    };
    Secret: {
      password: string;
    };
  }

const ajv = new Ajv();
const validateAuthRequest = ajv.compile({
  type: 'object',
  properties: {
    User: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        isAdmin: { type: 'boolean' },
      },
      required: ['name', 'isAdmin'],
      additionalProperties: false,
    },
    Secret: {
      type: 'object',
      properties: {
        password: { type: 'string' },
      },
      required: ['password'],
      additionalProperties: false,
    },
  },
  required: ['User', 'Secret'],
  additionalProperties: false,
});





router.put('/authenticate', (req: Request, res: Response, next: NextFunction) => {

    const valid = validateAuthRequest(req.body);
    if (!valid) {
      return res.status(400).json({ error: 'Invalid request body' });
    }


    const { User, Secret } = req.body;
    const token = jwt.sign({ User }, process.env.TOKEN_SECRET!);
    res.send(token)
    

  });
  
module.exports = router

