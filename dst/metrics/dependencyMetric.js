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
exports.dependency = void 0;
const rest_1 = require("@octokit/rest");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const octokit = new rest_1.Octokit({
    auth: process.env.GITHUB_TOKEN,
    version: "latest",
});
function dependency(owner, repo) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield octokit.repos.getContent({
                owner,
                repo,
                path: "package-lock.json"
            });
            //console.log(response.data)
            const responseJSON = JSON.parse(JSON.stringify(response.data));
            const packageJson = JSON.parse(Buffer.from(responseJSON.content, 'base64').toString('utf8'));
            const dependencies = packageJson.dependencies;
            let notPinned = 0;
            let pinned = 0;
            for (const [dependencyName, version] of Object.entries(dependencies)) {
                const versionJSON = JSON.parse(JSON.stringify(version));
                const [large, med, small] = versionJSON.version.toString().split('.');
                const finder = versionJSON.toString().indexOf("-");
                const carrot = versionJSON.toString().indexOf("^");
                //if it is in form "1"
                if ((med == undefined) && (small == undefined)) {
                    notPinned++;
                }
                //if it is in form 1.0-3.2
                else if (finder != -1) {
                    notPinned++;
                }
                //if you find a carrot 
                else if (carrot != -1) {
                    //major version pinned is unacceptable with a carrot (ex. ^2.1 is not okay, but ^0.x is okay)
                    if (large != undefined) {
                        notPinned++;
                    }
                }
                //otherwise it is in an acceptable format
                else {
                    pinned++;
                }
            }
            //total num of dependencies
            const numberOfDependencies = Object.keys(dependencies).length;
            // console.log(`counter = ${counter}`)
            // console.log(`The Git repository has ${numberOfDependencies} dependencies.`);
            //
            if (numberOfDependencies == 0) {
                return 1.0;
            }
            else {
                const val = pinned / numberOfDependencies;
                return val;
            }
        }
        catch (error) {
            const resp1 = yield octokit.repos.getContent({
                owner,
                repo,
                path: "package.json"
            });
            const responseJSON = JSON.parse(JSON.stringify(resp1.data));
            const packageJson = JSON.parse(Buffer.from(responseJSON.content, 'base64').toString('utf8'));
            const dependencies = packageJson.dependencies;
            let notPinned = 0;
            let pinned = 0;
            for (const version of Object.entries(dependencies)) {
                //finding out if it is larger than pinned dependency
                const versionJSON = JSON.parse(JSON.stringify(version));
                const [large, med, small] = versionJSON.version.toString().split('.');
                const finder = versionJSON.toString().indexOf("-");
                const carrot = versionJSON.toString().indexOf("^");
                //if it is in form "1"
                if ((med == undefined) && (small == undefined)) {
                    notPinned++;
                }
                //if it is in form 1.0-3.2
                else if (finder != -1) {
                    notPinned++;
                }
                //if you find a carrot 
                else if (carrot != -1) {
                    //major version pinned is unacceptable with a carrot (ex. ^2.1 is not okay, but ^0.x is okay)
                    if (large != undefined) {
                        notPinned++;
                    }
                }
                //otherwise it is in an acceptable format
                else {
                    pinned++;
                }
            }
            //total num of dependencies
            const numberOfDependencies = Object.keys(dependencies).length;
            if (numberOfDependencies == 0) {
                return 0.0;
            }
            else {
                const val = pinned / numberOfDependencies;
                return val;
            }
        }
    });
}
exports.dependency = dependency;
