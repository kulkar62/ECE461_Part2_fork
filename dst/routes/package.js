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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const verifyToken = require('../middleware/verifyToken');
const fs = __importStar(require("fs"));
const Package_1 = __importDefault(require("../model/Package"));
const child_process_1 = require("child_process");
const dependencyMetric_1 = require("../metrics/dependencyMetric");
const pullRequestMetric_1 = require("../metrics/pullRequestMetric");
const part1handler_1 = require("../metrics/part1handler");
const verifyRequest_1 = require("../middleware/verifyRequest");
router.post('/package', verifyToken, verifyRequest_1.validPostPackage, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const Content = req.body.Content;
    const URL = req.body.URL;
    const JSProgram = req.body.JSProgram;
    if (Content && URL) {
        res.status(400).send('Content and URL cannot both be set');
    }
    else if (Content) {
        fs.writeFileSync('content.txt', Content);
        (0, child_process_1.exec)(`python3 repoHandler.py Content`, (error, stdout, stderr) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                fs.unlinkSync('content.txt');
                const jsonContent = fs.readFileSync('./temp/info.json', 'utf-8');
                const data = JSON.parse(jsonContent);
                const Name = data.Name;
                const Version = data.Version;
                const githubURL = data.URL;
                (0, child_process_1.exec)('rm -rf temp');
                let pullRequestMetric, dependencyMetric, rampUpScore, correctnessScore, busFactorScore, respScore, licenseScore, netScore;
                if (!githubURL) {
                    return res.status(400).send('Package.json does not have a URL');
                }
                else {
                    const result = yield calculateMetrics(githubURL);
                    netScore = Number(result.netScore);
                    if (netScore < 0.2)
                        return res.status(424).send('Package not uploaded due to disqualified rating');
                    pullRequestMetric = Number(result.pullRequestMetric).toFixed(2);
                    dependencyMetric = Number(result.dependencyMetric);
                    rampUpScore = Number(result.rampUpScore);
                    correctnessScore = Number(result.correctnessScore);
                    busFactorScore = Number(result.busFactorScore);
                    respScore = Number(result.respScore);
                    licenseScore = Number(result.licenseScore);
                }
                const packageExists = yield Package_1.default.exists({ Name: Name, Version: Version });
                if (packageExists) {
                    res.status(409).send('Package exists already');
                }
                else {
                    const generateID = (length) => Array.from({ length }, () => Math.random().toString(36).charAt(2)).join('');
                    const ID = generateID(15);
                    const p = new Package_1.default({
                        Name: Name,
                        Version: Version,
                        ID: ID,
                        Content: Content,
                        JSProgram: JSProgram,
                        NetScore: netScore,
                        PullRequestMetric: pullRequestMetric,
                        DependencyMetric: dependencyMetric,
                        RampUpScore: rampUpScore,
                        CorrectnessScore: correctnessScore,
                        BusFactorScore: busFactorScore,
                        RespScore: respScore,
                        LicenseScore: licenseScore
                    });
                    yield p.save();
                    res.status(201).send({
                        "metadata": {
                            "Name": p.Name,
                            "Version": p.Version,
                            "ID": p.ID
                        },
                        "data": {
                            "Content": p.Content,
                            "JSProgram": p.JSProgram
                        }
                    });
                }
            }
            catch (err) {
                res.status(400).send('No package.json found');
            }
        }));
    }
    else if (URL) {
        (0, child_process_1.exec)(`python3 repoHandler.py URL ${URL}`, (error, stdout, stderr) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const jsonContent = fs.readFileSync('./temp/info.json', 'utf-8');
                const data = JSON.parse(jsonContent);
                const Name = data.Name;
                const Version = data.Version;
                const Content = data.Content;
                (0, child_process_1.exec)('rm -rf temp');
                const result = yield calculateMetrics(URL);
                let pullRequestMetric, dependencyMetric, rampUpScore, correctnessScore, busFactorScore, respScore, licenseScore, netScore;
                netScore = result.netScore;
                if (Number(netScore) < 0.2)
                    return res.status(424).send('Package not uploaded due to disqualified rating');
                pullRequestMetric = Number(result.pullRequestMetric).toFixed(2);
                dependencyMetric = Number(result.dependencyMetric);
                rampUpScore = Number(result.rampUpScore);
                correctnessScore = Number(result.correctnessScore);
                busFactorScore = Number(result.busFactorScore);
                respScore = Number(result.respScore);
                licenseScore = Number(result.licenseScore);
                const packageExists = yield Package_1.default.exists({ Name: Name, Version: Version });
                if (packageExists) {
                    res.status(409).send('Package exists already');
                }
                else {
                    const generateID = (length) => Array.from({ length }, () => Math.random().toString(36).charAt(2)).join('');
                    const ID = generateID(15);
                    const p = new Package_1.default({
                        Name: Name,
                        Version: Version,
                        ID: ID,
                        URL: URL,
                        Content: Content,
                        JSProgram: JSProgram,
                        NetScore: netScore,
                        PullRequestMetric: pullRequestMetric,
                        DependencyMetric: dependencyMetric,
                        RampUpScore: rampUpScore,
                        CorrectnessScore: correctnessScore,
                        BusFactorScore: busFactorScore,
                        RespScore: respScore,
                        LicenseScore: licenseScore
                    });
                    yield p.save();
                    res.status(201).send({
                        "metadata": {
                            "Name": p.Name,
                            "Version": p.Version,
                            "ID": p.ID
                        },
                        "data": {
                            "Content": p.Content,
                            "JSProgram": p.JSProgram
                        }
                    });
                }
            }
            catch (err) {
                res.status(400).send('No package.json found or no URL found');
            }
        }));
    }
}));
router.get('/package/:ID', verifyToken, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const p = yield Package_1.default.findOne({ ID: req.params.ID });
    if (p) {
        res.status(200).send({
            "metadata": {
                "Name": p.Name,
                "Version": p.Version,
                "ID": p.ID
            },
            "data": {
                "Content": p.Content,
                "JSProgram": p.JSProgram
            }
        });
    }
    else {
        res.status(404).send('Package does not exist');
    }
}));
router.put('/package/:ID', verifyToken, verifyRequest_1.validPutPackage, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (yield Package_1.default.exists({ Name: req.body.metadata.Name, Version: req.body.metadata.Version, ID: req.params.ID })) {
        const p = yield Package_1.default.findOneAndUpdate({ Name: req.body.metadata.Name, Version: req.body.metadata.Version, ID: req.params.ID }, {
            Content: req.body.data.Content
        }, { new: true });
        res.status(200).send('Package updated successfully');
    }
    else {
        res.status(404).send('Package does not exist');
    }
}));
router.delete('/package/:ID', verifyToken, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (yield Package_1.default.exists({ ID: req.params.ID })) {
        yield Package_1.default.findOneAndDelete({ ID: req.params.ID });
        res.status(200).send('Package deleted successfully');
    }
    else {
        res.status(404).send('Package does not exist');
    }
}));
router.delete('/package/byname/:Name', verifyToken, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (yield Package_1.default.exists({ Name: req.params.Name })) {
        yield Package_1.default.find({ Name: req.params.Name });
        res.status(200).send('Package deleted successfully');
    }
    else {
        res.status(404).send('Package does not exist');
    }
}));
function calculateMetrics(githubURL) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const result = extractOwnerAndRepo(githubURL);
        const owner = (_a = result === null || result === void 0 ? void 0 : result.owner) !== null && _a !== void 0 ? _a : '';
        const repo = (_b = result === null || result === void 0 ? void 0 : result.repo) !== null && _b !== void 0 ? _b : '';
        const pullRequestMetric = yield (0, pullRequestMetric_1.pullRequestRating)("prettier", "prettier");
        const dependencyMetric = yield (0, dependencyMetric_1.dependency)("prettier", "prettier");
        // const pullRequestMetric = 0.5
        // const dependencyMetric = 0.5
        const part1Metrics = yield (0, part1handler_1.getMetrics)(githubURL);
        const rampUpScore = part1Metrics.rampUpScore;
        const correctnessScore = part1Metrics.correctnessScore;
        const busFactorScore = part1Metrics.busFactorScore;
        const respScore = part1Metrics.respScore;
        const licenseScore = part1Metrics.licenseScore;
        const netScore = ((Number(pullRequestMetric) + Number(dependencyMetric) + Number(rampUpScore)
            + Number(correctnessScore) + Number(busFactorScore) + Number(respScore) + Number(licenseScore)) / 7).toFixed(2);
        return { pullRequestMetric, dependencyMetric, rampUpScore, correctnessScore, busFactorScore, respScore, licenseScore, netScore };
    });
}
router.get('/package/:ID/rate', verifyToken, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const p = yield Package_1.default.findOne({ ID: req.params.ID });
    if (p) {
        res.status(200).send({
            "BusFactor": p.BusFactorScore,
            "Correctness": p.CorrectnessScore,
            "RampUp": p.RampUpScore,
            "ResponsiveMaintainer": p.RespScore,
            "LicenseScore": p.LicenseScore,
            "GoodPinningPractice": p.DependencyMetric,
            "PullRequest": p.PullRequestMetric,
            "NetScore": p.NetScore
        });
    }
    else
        res.status(404).send('Package does not exist');
}));
router.post('/package/byRegEx', verifyToken, verifyRequest_1.validPostRegex, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const packages = yield Package_1.default.find({ Name: { $regex: req.body.RegEx } });
    if (packages.length) {
        var result = [];
        for (var i = 0; i < packages.length; i++) {
            result.push({
                "Version": packages[i].Version,
                "Name": packages[i].Name,
            });
        }
        res.status(200).send(result);
    }
    else
        res.status(404).send('No packages found');
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
module.exports = router;
