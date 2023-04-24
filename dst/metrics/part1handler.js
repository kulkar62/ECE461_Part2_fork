"use strict";
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
exports.getMetrics = void 0;
const fs_1 = __importDefault(require("fs"));
const child_process_1 = require("child_process");
function runCommand() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            (0, child_process_1.exec)('./run githubURL.txt', (error, stdout, stderr) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    reject(error);
                }
                else {
                    resolve(stdout);
                }
            });
        });
    });
}
function getMetrics(githubURL) {
    return __awaiter(this, void 0, void 0, function* () {
        // write githubURL to part1code/githubURL.txt
        fs_1.default.writeFileSync('./part1code/githubURL.txt', githubURL);
        // fs.writeFileSync('./part1code/githubURL.txt', 'https://github.com/prettier/prettier');
        // run part 1 code, save output, return output
        process.chdir('part1code');
        let netScore;
        let rampUpScore;
        let correctnessScore;
        let busFactorScore;
        let respScore;
        let licenseScore;
        const stdout = yield runCommand();
        process.chdir('../');
        var scoresString = stdout.substring(0, stdout.indexOf("}") + 1);
        scoresString = scoresString.replace(/'/g, '"');
        // console.log(scoresString)
        const scores = JSON.parse(scoresString);
        netScore = scores.NET_SCORE;
        rampUpScore = scores.RAMP_UP_SCORE;
        correctnessScore = scores.CORRECTNESS_SCORE;
        busFactorScore = scores.BUS_FACTOR_SCORE;
        respScore = scores.RESPONSIVE_MAINTAINER_SCORE;
        licenseScore = scores.LICENSE_SCORE;
        return { netScore, rampUpScore, correctnessScore, busFactorScore, respScore, licenseScore };
    });
}
exports.getMetrics = getMetrics;
