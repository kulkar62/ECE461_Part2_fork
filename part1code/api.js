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
const axios = require('axios');
const fs = require('fs');
function getScoreCard(url) {
    return __awaiter(this, void 0, void 0, function* () {
        var api_url = new String("https://api.securityscorecards.dev/projects/");
        var repo_url = new String(url);
        var repo_url_len = repo_url.length;
        var sliced_repo_url = repo_url.slice(8, repo_url_len);
        var api_repo = api_url.concat(sliced_repo_url.toString());
        const options = {
            method: 'GET',
            url: api_repo,
            params: { category: 'all', count: 2 },
        };
        var jsonfile_name = './Scorecard.json';
        yield axios
            .request(options)
            .then(function (response) {
            const jsonString = JSON.stringify(response.data, null, 2);
            fs.writeFileSync(jsonfile_name, jsonString, {
                flag: 'w'
            });
        })
            .catch(function (_error) {
            jsonfile_name = '404';
        });
        return jsonfile_name;
    });
}
function getLicense(token, url) {
    return __awaiter(this, void 0, void 0, function* () {
        const { graphql } = require("@octokit/graphql");
        var url_trim = url.trim();
        var url_len = url_trim.length;
        var sliced_url = url.slice(19, url_len);
        var repo_info = sliced_url.split("/", 2);
        var json_file = './license.json';
        try {
            const { repository } = yield graphql({
                query: `query repository_details($owner: String!, $repo: String!) {
                repository(owner:$owner, name:$repo) {
                    licenseInfo {
                        name
                    }
                }
            }`,
                owner: repo_info[0],
                repo: repo_info[1],
                headers: {
                    'Authorization': 'bearer ' + token,
                },
            });
            const jsonString = JSON.stringify(repository, null, 2);
            fs.writeFileSync(json_file, jsonString, {
                flag: 'w'
            });
        }
        catch (error) {
            json_file = "404";
        }
        return json_file;
    });
}
function getContributor(token, url, action_info) {
    return __awaiter(this, void 0, void 0, function* () {
        const { Octokit } = require("octokit");
        const octokit = new Octokit({
            auth: token
        });
        var url_trim = url.trim();
        var url_len = url_trim.length;
        var sliced_url = url.slice(19, url_len);
        var repo_info = sliced_url.split("/", 2);
        var json_file = './contribute.json';
        try {
            const contribute = yield octokit.request('GET /repos/{owner}/{repo}/{action}', {
                owner: repo_info[0],
                repo: repo_info[1],
                action: action_info
            });
            const jsonString = JSON.stringify(contribute.data, null, 2);
            fs.writeFileSync(json_file, jsonString, {
                flag: 'w'
            });
        }
        catch (error) {
            json_file = "404";
        }
        return json_file;
    });
}
function getReadme(token, url, action_info) {
    return __awaiter(this, void 0, void 0, function* () {
        const { Octokit } = require("octokit");
        const octokit = new Octokit({
            auth: token
        });
        var url_trim = url.trim();
        var url_len = url_trim.length;
        var sliced_url = url.slice(19, url_len);
        var repo_info = sliced_url.split("/", 2);
        var json_file = './readme.json';
        try {
            const readme = yield octokit.request('GET /repos/{owner}/{repo}/{action}', {
                owner: repo_info[0],
                repo: repo_info[1],
                action: action_info
            });
            const jsonString = JSON.stringify(readme.data, null, 2);
            fs.writeFileSync(json_file, jsonString, {
                flag: 'w'
            });
        }
        catch (error) {
            json_file = "404";
        }
        return json_file;
    });
}
function getLang(token, url, action_info) {
    return __awaiter(this, void 0, void 0, function* () {
        const { Octokit } = require("octokit");
        const octokit = new Octokit({
            auth: token
        });
        var url_trim = url.trim();
        var url_len = url_trim.length;
        var sliced_url = url.slice(19, url_len);
        var repo_info = sliced_url.split("/", 2);
        var json_file = './language.json';
        try {
            const lang = yield octokit.request('GET /repos/{owner}/{repo}/{action}', {
                owner: repo_info[0],
                repo: repo_info[1],
                action: action_info
            });
            const jsonString = JSON.stringify(lang.data, null, 2);
            fs.writeFileSync(json_file, jsonString, {
                flag: 'w'
            });
        }
        catch (error) {
            json_file = "404";
        }
        return json_file;
    });
}
function getGiturl(npmurl) {
    return __awaiter(this, void 0, void 0, function* () {
        const { searchPackages } = require('query-registry');
        const data = yield searchPackages({ query: { text: npmurl } });
        const url = data["objects"][0].package.links.repository;
        return url;
    });
}
module.exports = { getScoreCard, getContributor, getLicense, getReadme, getLang, getGiturl };
