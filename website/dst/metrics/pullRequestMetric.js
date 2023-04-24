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
Object.defineProperty(exports, "__esModule", { value: true });
exports.pullRequestRating = void 0;
const rest_1 = require("@octokit/rest");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const octokit = new rest_1.Octokit({
    auth: process.env.GITHUB_TOKEN,
    version: "latest",
});
function pullRequestRating(owner, repo) {
    return __awaiter(this, void 0, void 0, function* () {
        //query for git repo based off of specific owner and repo
        const pullRequestsResponse = yield octokit.pulls.list({
            owner,
            repo,
        });
        //initialize vars
        let reviewedLines = 0;
        let totalLines = 0;
        //iterate through all the pull requests
        for (const pullRequest of pullRequestsResponse.data) {
            const pullRequestResponse = yield octokit.pulls.get({
                owner,
                repo,
                pull_number: pullRequest.number,
            });
            //find diff between pull requests
            const diffUrl = pullRequestResponse.data.diff_url;
            const diffResponse = yield octokit.request({
                url: diffUrl,
            });
            const diff = diffResponse.data;
            const lines = diff.split("\n");
            //see which lines are reviewed through pull request + code review
            for (const line of lines) {
                if (line.startsWith("+") && !line.startsWith("+++")) {
                    totalLines++;
                    if (line.includes("//")) {
                        continue;
                    }
                    reviewedLines++;
                }
                if (line.startsWith("-") && !line.startsWith("---")) {
                    totalLines++;
                }
            }
        }
        //compute the fraction
        const fractionReviewed = reviewedLines / totalLines;
        if (isNaN(fractionReviewed)) {
            //   console.log("0.0")
            return ("0.0");
        }
        // console.log(fractionReviewed);
        return (fractionReviewed);
    });
}
exports.pullRequestRating = pullRequestRating;
// pullRequestRating("nidhikunigal", "PS_Group6")
