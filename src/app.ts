import express, {Application, Request, Response, NextFunction, ErrorRequestHandler} from 'express';
import mongoose from 'mongoose';
import * as dotenv from 'dotenv'
dotenv.config()
const bodyParser = require('body-parser');

mongoose.connect(process.env.MONGO_URI!);


const app: Application = express()



app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));



app.use(express.json());

app.use((err: ErrorRequestHandler, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError) {
        return res.status(400).send('Request formed improperly');
    }
    next();
});


const authenticateRoute = require('./routes/authenticate')
const packageRoute = require('./routes/package')
const resetRoute = require('./routes/reset')

app.use('/', authenticateRoute)
app.use('/', packageRoute)
app.use('/', resetRoute)


app.listen(3000, () => console.log('server running on port 3000'));
