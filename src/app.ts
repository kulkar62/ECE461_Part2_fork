import express from 'express';
import multer from 'multer';
import { GridFSBucket } from 'mongodb';
import { MongoClient } from 'mongodb';
import * as GridFSStorage from 'multer-gridfs-storage';
import * as dotenv from 'dotenv'
dotenv.config()
import { dependency } from './dependencyMetric';
import { pullRequestRating } from './pullRequestMetric'



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

app.post('/upload', upload.array('zipfile'), (req, res) => {
    res.send('Upload worked')
});


app.get('/download/:filename', async (req, res) => {
    const filename = req.params.filename;
    const downloadStream = bucket.openDownloadStreamByName(filename);
    downloadStream.pipe(res);
  
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});
