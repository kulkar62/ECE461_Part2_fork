import fs from 'fs';
import { exec } from 'child_process';
import { execSync } from 'child_process';

async function runCommand(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        exec('./run githubURL.txt', (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                reject(error);
            } else {
                resolve(stdout);
            }
        });
    });
}



export async function getMetrics(githubURL: string){
    // write githubURL to part1code/githubURL.txt
    fs.writeFileSync('./part1code/githubURL.txt', githubURL);
    // fs.writeFileSync('./part1code/githubURL.txt', 'https://github.com/prettier/prettier');


    // run part 1 code, save output, return output
    process.chdir('part1code');

    let netScore;
    let rampUpScore;
    let correctnessScore;
    let busFactorScore;
    let respScore;
    let licenseScore;

    const stdout = await runCommand();
    process.chdir('../');

    var scoresString = stdout.substring(0, stdout.indexOf("}") + 1);
    scoresString = scoresString.replace(/'/g, '"');
    // console.log(scoresString)
    const scores = JSON.parse(scoresString)
    netScore = scores.NET_SCORE
    rampUpScore = scores.RAMP_UP_SCORE
    correctnessScore = scores.CORRECTNESS_SCORE
    busFactorScore = scores.BUS_FACTOR_SCORE
    respScore = scores.RESPONSIVE_MAINTAINER_SCORE
    licenseScore = scores.LICENSE_SCORE

    return {netScore, rampUpScore, correctnessScore, busFactorScore, respScore, licenseScore}

}
