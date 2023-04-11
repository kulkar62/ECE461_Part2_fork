import express from 'express';
import multer from 'multer';
import { GridFSBucket, ObjectId } from 'mongodb';
import { MongoClient } from 'mongodb';
import * as GridFSStorage from 'multer-gridfs-storage';
import * as dotenv from 'dotenv'
dotenv.config()
import { dependency } from './dependencyMetric';
import { pullRequestRating } from './pullRequestMetric'
import { getMetrics } from './part1handler';


// Connect to MongoDB Atlas cluster
const uri = process.env.MONGO_URI ?? ''
const client = new MongoClient(uri);
client.connect();
const db = client.db();

// Create storage bucket
const bucket = new GridFSBucket(db, { bucketName: 'uploads' });

// Create storage engine
let opts: GridFSStorage.UrlStorageOptions;
opts = {
    url: uri,
    file: (req, file) => {
        return {
            filename: file.originalname,
            bucketName: 'uploads',
        };
    },
}


const storage = new GridFSStorage.GridFsStorage(opts);
const upload = multer({ storage: storage }); 



const app = express();

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

app.post('/update/:filename', upload.array('zipfile'), async (req, res) => {

    const githubURL = req.body.githubURL

    const isValidGithubUrl = (url: string): boolean => /^https?:\/\/(www\.)?github\.com\/.+/.test(url);

    if(isValidGithubUrl(githubURL))
    {
        const filenameOld = req.params.filename;

        const collection = db.collection('uploads.files');
        const files = await collection.find().toArray();
        const fileNew = files[files.length-1]

        const fileNewId = fileNew._id


        const deleteFilter = {
            $and: [{filename: filenameOld},
                {_id: { $ne: new ObjectId(fileNewId) }}
            ]
        }

        await collection.findOneAndDelete(deleteFilter)




        const result = extractOwnerAndRepo(githubURL)
        const owner = result?.owner ?? ''
        const repo = result?.repo ?? ''

        // const collection = db.collection('uploads.files');
        // const files = await collection.find().toArray();
        const file = files[files.length-1]

        // const dependencyMetric = await dependency(owner, repo, "3.6.2")
        const dependencyMetric = -1
        // const pullRequestMetric = await pullRequestRating(owner, repo)
        const pullRequestMetric = -1


        const part1Metrics = await getMetrics(githubURL)
        const netScore = part1Metrics.netScore
        const rampUpScore = part1Metrics.rampUpScore
        const correctnessScore = part1Metrics.correctnessScore
        const busFactorScore = part1Metrics.busFactorScore
        const respScore = part1Metrics.respScore
        const licenseScore = part1Metrics.licenseScore



        const filter = { _id: file._id };

        

        const update = {$set: {owner: owner, repo: repo, netScore: netScore, rampUpScore: rampUpScore, 
            correctnessScore: correctnessScore, busFactorScore: busFactorScore, respScore: respScore, 
            licenseScore: licenseScore, dependencyMetric: dependencyMetric, pullRequestMetric: pullRequestMetric}}

        await collection.updateOne(filter, update)

        res.redirect('/home')

    }

    else
        res.redirect('/home')


});


app.get('/upload', (req, res) => {
    res.render('upload');
});

app.post('/upload', upload.array('zipfile'), async (req, res) => {
    const githubURL = req.body.githubURL

    const isValidGithubUrl = (url: string): boolean => /^https?:\/\/(www\.)?github\.com\/.+/.test(url);

    if(isValidGithubUrl(githubURL))
    {
        const result = extractOwnerAndRepo(githubURL)
        const owner = result?.owner ?? ''
        const repo = result?.repo ?? ''

        const collection = db.collection('uploads.files');
        const files = await collection.find().toArray();
        const file = files[files.length-1]

        // const dependencyMetric = await dependency(owner, repo, "3.6.2")
        const dependencyMetric = -1
        // const pullRequestMetric = await pullRequestRating(owner, repo)
        const pullRequestMetric = -1


        const part1Metrics = await getMetrics(githubURL)
        const netScore = part1Metrics.netScore
        const rampUpScore = part1Metrics.rampUpScore
        const correctnessScore = part1Metrics.correctnessScore
        const busFactorScore = part1Metrics.busFactorScore
        const respScore = part1Metrics.respScore
        const licenseScore = part1Metrics.licenseScore



        const filter = { _id: file._id };

        

        const update = {$set: {owner: owner, repo: repo, netScore: netScore, rampUpScore: rampUpScore, 
            correctnessScore: correctnessScore, busFactorScore: busFactorScore, respScore: respScore, 
            licenseScore: licenseScore, dependencyMetric: dependencyMetric, pullRequestMetric: pullRequestMetric}}

        await collection.updateOne(filter, update)

        res.redirect('/home')

    }

    else
        res.redirect('/home')
    
});

app.get('/reset', async (req, res) => {
    await bucket.drop()
    res.send("Reset Complete")
});


app.get('/download/:filename', async (req, res) => {
    const filename = req.params.filename;
    const downloadStream = bucket.openDownloadStreamByName(filename);
    downloadStream.pipe(res);
  
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



  
app.listen(3000, () => {
    console.log('Server started on port 3000');
});
