"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const mongodb_1 = require("mongodb");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const bodyParser = require('body-parser');
//is this the same database or no ?????
const uri = (_a = process.env.MONGO_URI) !== null && _a !== void 0 ? _a : '';
const client = new mongodb_1.MongoClient(uri);
client.connect();
const db = client.db();
mongoose_1.default.connect(process.env.MONGO_URI);
const app = (0, express_1.default)();
//frontend 
app.set('view engine', 'ejs');
app.get('/home', (req, res) => {
    res.render('home');
});
app.get('/filepage/:filename', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filename = req.params.filename;
    const collection = db.collection('uploads.files');
    const filter = { filename: filename };
    const file = yield collection.findOne(filter);
    res.render('filepage', { file });
}));
app.get('/directory', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const collection = db.collection('uploads.files');
        const files = yield collection.find().toArray();
        res.render('directory', { files });
    }
    catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while retrieving the files.');
    }
}));
app.get('/update/:filename', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filename = req.params.filename;
    const collection = db.collection('uploads.files');
    const filter = { filename: filename };
    const file = yield collection.findOne(filter);
    res.render('update', { file });
}));
// app.post('/update/:filename', upload.array('zipfile'), async (req, res) => {
//     const githubURL = req.body.githubURL
//     const isValidGithubUrl = (url: string): boolean => /^https?:\/\/(www\.)?github\.com\/.+/.test(url);
//     if(isValidGithubUrl(githubURL))
//     {
//         const filenameOld = req.params.filename;
//         const collection = db.collection('uploads.files');
//         const files = await collection.find().toArray();
//         const fileNew = files[files.length-1]
//         const fileNewId = fileNew._id
//         const deleteFilter = {
//             $and: [{filename: filenameOld},
//                 {_id: { $ne: new ObjectId(fileNewId) }}
//             ]
//         }
//         await collection.findOneAndDelete(deleteFilter)
//         const result = extractOwnerAndRepo(githubURL)
//         const owner = result?.owner ?? ''
//         const repo = result?.repo ?? ''
//         const file = files[files.length-1]
//         const dependencyMetric = -1
//         const pullRequestMetric = -1
//         const part1Metrics = await getMetrics(githubURL)
//         const netScore = part1Metrics.netScore
//         const rampUpScore = part1Metrics.rampUpScore
//         const correctnessScore = part1Metrics.correctnessScore
//         const busFactorScore = part1Metrics.busFactorScore
//         const respScore = part1Metrics.respScore
//         const licenseScore = part1Metrics.licenseScore
//         const filter = { _id: file._id };
//         const update = {$set: {owner: owner, repo: repo, netScore: netScore, rampUpScore: rampUpScore, 
//             correctnessScore: correctnessScore, busFactorScore: busFactorScore, respScore: respScore, 
//             licenseScore: licenseScore, dependencyMetric: dependencyMetric, pullRequestMetric: pullRequestMetric}}
//         await collection.updateOne(filter, update)
//         res.redirect('/home')
//     }
//     else
//         res.redirect('/home')
// });
app.get('/upload', (req, res) => {
    res.render('upload');
});
// app.post('/upload', upload.array('zipfile'), async (req, res) => {
//     const githubURL = req.body.githubURL
//     const isValidGithubUrl = (url: string): boolean => /^https?:\/\/(www\.)?github\.com\/.+/.test(url);
//     if(isValidGithubUrl(githubURL))
//     {
//         const result = extractOwnerAndRepo(githubURL)
//         const owner = result?.owner ?? ''
//         const repo = result?.repo ?? ''
//         const collection = db.collection('uploads.files');
//         const files = await collection.find().toArray();
//         const file = files[files.length-1]
//         const dependencyMetric = -1
//         const pullRequestMetric = -1
//         const part1Metrics = await getMetrics(githubURL)
//         const netScore = part1Metrics.netScore
//         const rampUpScore = part1Metrics.rampUpScore
//         const correctnessScore = part1Metrics.correctnessScore
//         const busFactorScore = part1Metrics.busFactorScore
//         const respScore = part1Metrics.respScore
//         const licenseScore = part1Metrics.licenseScore
//         const filter = { _id: file._id };
//         const update = {$set: {owner: owner, repo: repo, netScore: netScore, rampUpScore: rampUpScore, 
//             correctnessScore: correctnessScore, busFactorScore: busFactorScore, respScore: respScore, 
//             licenseScore: licenseScore, dependencyMetric: dependencyMetric, pullRequestMetric: pullRequestMetric}}
//         await collection.updateOne(filter, update)
//         res.redirect('/home')
//     }
//     else
//         res.redirect('/home')
// });
// app.get('/reset', async (req, res) => {
//     await bucket.drop()
//     res.send("Reset Complete")
// });
// app.get('/download/:filename', async (req, res) => {
//     const filename = req.params.filename;
//     const downloadStream = bucket.openDownloadStreamByName(filename);
//     downloadStream.pipe(res);
// });
app.get('/rate/:filename', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filename = req.params.filename;
    const collection = db.collection('uploads.files');
    const filter = { filename: filename };
    const file = yield collection.findOne(filter);
    res.render('rate', { file });
}));
function extractOwnerAndRepo(githubLink) {
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
app.use(express_1.default.json());
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError) {
        return res.status(400).send('Request formed improperly');
    }
    next();
});
const authenticateRoute = require('./routes/authenticate');
const packageRoute = require('./routes/package');
const packagesRoute = require('./routes/packages');
const resetRoute = require('./routes/reset');
app.use('/', authenticateRoute);
app.use('/', packageRoute);
app.use('/', packagesRoute);
app.use('/', resetRoute);
app.listen(3000, () => console.log('server running on port 3000'));
