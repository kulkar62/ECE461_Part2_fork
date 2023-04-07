import express from 'express';
import multer from 'multer';
import { GridFSBucket } from 'mongodb';
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

app.get('/directory', async (req, res) => {
    
    try {
        const collection = db.collection('uploads.files');
        const files = await collection.find().toArray();


        // Needs to be in a loop 
        const dependencyMetric = await dependency("nullivex", "nodist", "3.6.2")
        // const dependencyMetric = -1
        const pullRequestMetric = await pullRequestRating("nidhikunigal", "PS_Group6")
        // res.render('directory', { files});
        res.render('directory', { files, dependencyMetric, pullRequestMetric});
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while retrieving the files.');
    }
  });


app.get('/upload', (req, res) => {
    res.render('upload');
});

app.post('/upload', upload.array('zipfile'), async (req, res) => {
    const githubURL = req.body.githubURL
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
    // const ownerUpdate = { $set: { owner: owner} };
    // const repoUpdate = { $set: { repo: repo } };
    // const dependencyUpdate = { $set: { dependencyMetric: dependencyMetric} };
    // const pullRequestUpdate = { $set: { pullRequestMetric: pullRequestMetric} };
    

    const update = {$set: {owner: owner, repo: repo, netScore: netScore, rampUpScore: rampUpScore, 
        correctnessScore: correctnessScore, busFactorScore: busFactorScore, respScore: respScore, 
        licenseScore: licenseScore, dependencyMetric: dependencyMetric, pullRequestMetric: pullRequestMetric}}

        await collection.updateOne(filter, update)

    // await collection.updateOne(filter, ownerUpdate)
    // await collection.updateOne(filter, repoUpdate)
    // await collection.updateOne(filter, dependencyUpdate)
    // await collection.updateOne(filter, pullRequestUpdate)


    res.send('Upload worked')
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
