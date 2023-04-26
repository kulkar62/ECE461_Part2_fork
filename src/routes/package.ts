import express, {Application, Request, Response, NextFunction, Router, ErrorRequestHandler} from 'express';
const router: Router = express.Router();
const verifyToken = require('../middleware/verifyToken')
import * as fs from 'fs';
import Package from '../model/Package';
import { exec } from 'child_process';

import { dependency } from '../metrics/dependencyMetric';
import { pullRequestRating } from '../metrics/pullRequestMetric';
import { getMetrics } from '../metrics/part1handler';

import { validPostPackage , validPutPackage, validPostRegex } from '../middleware/verifyRequest';

router.post('/package', verifyToken, validPostPackage, async (req: Request, res: Response, next: NextFunction) => {

    const Content = req.body.Content
    const URL = req.body.URL
    const JSProgram = req.body.JSProgram

    if(Content && URL)
    {
        res.status(400).send('Content and URL cannot both be set')
    }

    else if(Content)
    {
        fs.writeFileSync('content.txt', Content)
        exec(`python3 repoHandler.py Content`,  async (error, stdout, stderr) => 
        {

           try
           {
                fs.unlinkSync('content.txt')
                
                const jsonContent = fs.readFileSync('./temp/info.json', 'utf-8');
                const data = JSON.parse(jsonContent);
                
                const Name = data.Name
                const Version = data.Version
                const githubURL = data.URL
                exec('rm -rf temp')

                let pullRequestMetric, dependencyMetric, rampUpScore, correctnessScore, busFactorScore, respScore, licenseScore, netScore
                if(!githubURL)
                {
                    return res.status(400).send('Package.json does not have a URL')
                }
                else
                {
                    const result = await calculateMetrics(githubURL)
                    netScore = Number(result.netScore)
                    if(netScore < 0.2)
                        return res.status(424).send('Package not uploaded due to disqualified rating')

                    pullRequestMetric = Number(result.pullRequestMetric).toFixed(2)
                    dependencyMetric = Number(result.dependencyMetric)
                    rampUpScore = Number(result.rampUpScore)
                    correctnessScore = Number(result.correctnessScore)
                    busFactorScore = Number(result.busFactorScore)
                    respScore = Number(result.respScore)
                    licenseScore = Number(result.licenseScore)
                    
                }


                const packageExists =  await Package.exists({Name: Name, Version: Version});
                if(packageExists)
                {
                    res.status(409).send('Package exists already')
                }

                else
                {
                    const generateID = (length: number) =>
                    Array.from({ length }, () => Math.random().toString(36).charAt(2)).join('');

                    const ID = generateID(15)

                    const p = new Package({
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
                    })
                    
                    await p.save()

                    res.status(201).send(
                        {
                            "metadata": {
                                "Name": p.Name,
                                "Version": p.Version,
                                "ID": p.ID
                            },
                            "data": {
                                "Content": p.Content,
                                "JSProgram": p.JSProgram
                            }
                        }
                    )
                }
            } 
            
            catch(err)
            {
                res.status(400).send('No package.json found')
            }
            


        });
        
        
    }

    else if(URL)
    {
        exec(`python3 repoHandler.py URL ${URL}`,  async (error, stdout, stderr) => 
        {
            try
            {

                const jsonContent = fs.readFileSync('./temp/info.json', 'utf-8');
                const data = JSON.parse(jsonContent);
                
                const Name = data.Name
                const Version = data.Version
                const Content = data.Content
                
                exec('rm -rf temp')

                const result = await calculateMetrics(URL)


                let pullRequestMetric, dependencyMetric, rampUpScore, correctnessScore, busFactorScore, respScore, licenseScore, netScore
                netScore = result.netScore
                if(Number(netScore) < 0.2)
                    return res.status(424).send('Package not uploaded due to disqualified rating')

                pullRequestMetric = Number(result.pullRequestMetric).toFixed(2)
                dependencyMetric = Number(result.dependencyMetric)
                rampUpScore = Number(result.rampUpScore)
                correctnessScore = Number(result.correctnessScore)
                busFactorScore = Number(result.busFactorScore)
                respScore = Number(result.respScore)
                licenseScore = Number(result.licenseScore)

                const packageExists =  await Package.exists({Name: Name, Version: Version});
                if(packageExists)
                {
                    res.status(409).send('Package exists already')
                }

                else
                {
                    const generateID = (length: number) =>
                    Array.from({ length }, () => Math.random().toString(36).charAt(2)).join('');

                    const ID = generateID(15)

                    const p = new Package({
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
                    })
                    
                    await p.save()

                    res.status(201).send(
                        {
                            "metadata": {
                                "Name": p.Name,
                                "Version": p.Version,
                                "ID": p.ID
                            },
                            "data": {
                                "Content": p.Content,
                                "JSProgram": p.JSProgram
                            }
                        }
                    )
                }
            }

            catch(err)
            {
                res.status(400).send('No package.json found or no URL found')
            }
            

        });
    }

});



router.get('/package/:ID', verifyToken, async (req: Request, res: Response, next: NextFunction) => {

    const p = await Package.findOne({ID: req.params.ID})

    if(p)
    {
        res.status(200).send(
        {
            "metadata": {
                "Name": p.Name,
                "Version": p.Version,
                "ID": p.ID
            },
            "data": {
                "Content": p.Content,
                "JSProgram": p.JSProgram
            }
        })
    }
    else
    {
        res.status(404).send('Package does not exist')
    }

});


router.put('/package/:ID', verifyToken, validPutPackage, async (req: Request, res: Response, next: NextFunction) => {


    if(await Package.exists({Name: req.body.metadata.Name, Version: req.body.metadata.Version, ID: req.params.ID}))
    {
        const p = await Package.findOneAndUpdate({Name: req.body.metadata.Name, Version: req.body.metadata.Version, ID: req.params.ID}, {
            Content: req.body.data.Content
        }, {new: true})


        res.status(200).send('Package updated successfully')
        
    }

    else
    {
        res.status(404).send('Package does not exist')
    }
    

});

router.delete('/package/:ID', verifyToken, async (req: Request, res: Response, next: NextFunction) => {


    if(await Package.exists({ID: req.params.ID}))
    {
        await Package.findOneAndDelete({ID: req.params.ID})

        res.status(200).send('Package deleted successfully')
        
    }

    else
    {
        res.status(404).send('Package does not exist')
    }
    

});

router.delete('/package/byname/:Name', verifyToken, async (req: Request, res: Response, next: NextFunction) => {


    if(await Package.exists({Name: req.params.Name}))
    {
        await Package.find({Name: req.params.Name})

        res.status(200).send('Package deleted successfully')
        
    }

    else
    {
        res.status(404).send('Package does not exist')
    }
    

});


async function calculateMetrics(githubURL: string)
{
    const result = extractOwnerAndRepo(githubURL)
    const owner = result?.owner ?? ''
    const repo = result?.repo ?? ''

    

    const pullRequestMetric = await pullRequestRating("prettier", "prettier")
    const dependencyMetric = await dependency("prettier", "prettier")

    // const pullRequestMetric = 0.5
    // const dependencyMetric = 0.5
    


    const part1Metrics = await getMetrics(githubURL)
    const rampUpScore = part1Metrics.rampUpScore
    const correctnessScore = part1Metrics.correctnessScore
    const busFactorScore = part1Metrics.busFactorScore
    const respScore = part1Metrics.respScore
    const licenseScore = part1Metrics.licenseScore

    const netScore = ((Number(pullRequestMetric) + Number(dependencyMetric) + Number(rampUpScore)
            + Number(correctnessScore) + Number(busFactorScore) + Number(respScore) + Number(licenseScore)) / 7).toFixed(2)

    return {pullRequestMetric, dependencyMetric, rampUpScore, correctnessScore, busFactorScore, respScore, licenseScore, netScore}
}

router.get('/package/:ID/rate', verifyToken, async (req: Request, res: Response, next: NextFunction) => {

    
    const p = await Package.findOne({ID: req.params.ID})

    if(p)
    {
        res.status(200).send({
            "BusFactor": p.BusFactorScore,
            "Correctness": p.CorrectnessScore,
            "RampUp": p.RampUpScore,
            "ResponsiveMaintainer": p.RespScore,
            "LicenseScore": p.LicenseScore,
            "GoodPinningPractice": p.DependencyMetric,
            "PullRequest": p.PullRequestMetric,
            "NetScore": p.NetScore
        })
        
    }
    else
        res.status(404).send('Package does not exist')

    
    

});

router.post('/package/byRegEx', verifyToken, validPostRegex, async (req: Request, res: Response, next: NextFunction) => {

    const packages = await Package.find({ Name: { $regex: req.body.RegEx } });

    if(packages.length)
    {
        var result = []
        for(var i = 0; i < packages.length; i++)
        {
            result.push({
                "Version": packages[i].Version,
                "Name": packages[i].Name,
            })
        }
        res.status(200).send(result)
    }
    else
        res.status(404).send('No packages found')
    

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

module.exports = router
