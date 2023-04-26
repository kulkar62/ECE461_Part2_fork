import express, {Application, Request, Response, NextFunction, ErrorRequestHandler} from 'express';
import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv'
import Package from './model/Package';

import { dependency } from './metrics/dependencyMetric';
import { pullRequestRating } from './metrics/pullRequestMetric'
import { getMetrics } from './metrics/part1handler';

dotenv.config()
const bodyParser = require('body-parser');

//is this the same database or no ?????
const uri = process.env.MONGO_URI ?? ''
const client = new MongoClient(uri);
client.connect();
const db = client.db();

mongoose.connect(process.env.MONGO_URI!);

const app: Application = express()

//frontend 
app.set('view engine', 'ejs');

app.get('/home', (req, res) => {
    res.render('home');
});

app.get('/filepage/:filename', async (req, res) => {
    const filename = req.params.filename;
    const collection = db.collection('uploads.files');
    const filter = { filename: filename };
    const file = await collection.findOne(filter)
    res.render('filepage', {file});    
});

app.get('/directory', async (req, res) => {

    try {
        const collection = db.collection('uploads.files');
        const files = await collection.find().toArray();

        res.render('directory', { files });
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while retrieving the files.');
    }
  });

app.get('/update/:filename', async (req, res) => {

    const filename = req.params.filename;
    const collection = db.collection('uploads.files');
    const filter = { filename: filename };
    const file = await collection.findOne(filter)

    res.render('update', {file});
});


app.get('/upload', (req, res) => {
    res.render('upload');
});

app.get('/rate/:filename', async (req, res) => {
    const filename = req.params.filename;
    const collection = db.collection('uploads.files');
    const filter = { filename: filename };
    const file = await collection.findOne(filter)


    res.render('rate', {file});    
});

function extractOwnerAndRepo(githubLink: string): { owner: string; repo: string } | null {
    const parts = githubLink.split('/');
    const ownerIndex = parts.indexOf('github.com') + 1;

    if (ownerIndex < 2 || ownerIndex >= parts.length - 1) {
        return null;
    }

    const owner = parts[ownerIndex];
    const repo = parts[ownerIndex + 1].replace('.git', '');

    return { owner, repo };
  }
//____________________________________________________________

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
const packagesRoute = require('./routes/packages')
const resetRoute = require('./routes/reset')

app.use('/', authenticateRoute)
app.use('/', packageRoute)
app.use('/', packagesRoute)
app.use('/', resetRoute)


app.listen(3000, () => console.log('server running on port 3000'));