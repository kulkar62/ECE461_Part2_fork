import express, {Application, Request, Response, NextFunction, Router, ErrorRequestHandler} from 'express';
const router: Router = express.Router();
const verifyToken = require('../middleware/verifyToken')
import * as fs from 'fs';
import Package from '../model/Package';
import { exec } from 'child_process';

import { dependency } from '../metrics/dependencyMetric';
import { pullRequestRating } from '../metrics/pullRequestMetric';
import { getMetrics } from '../metrics/part1handler';

router.post('/package', verifyToken, async (req: Request, res: Response, next: NextFunction) => {

    const Content = req.body.Content
    const URL = req.body.URL
    const JSProgram = req.body.JSProgram

    if(Content && URL)
    {
        res.status(400).send('Content and URL cannot both be set')
    }

    else if(Content)
    {
        exec(`python3 repoHandler.py Content ${Content}`,  async (error, stdout, stderr) => 
        {
            
            // console.log(`Python script output:\n${stdout}`);
            const jsonContent = fs.readFileSync('./temp/info.json', 'utf-8');
            const data = JSON.parse(jsonContent);
            
            const Name = data.Name
            const Version = data.Version
            
            exec('rm -rf temp')

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
                    JSProgram: JSProgram
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


        });
        

        


        
    }

    else if(URL)
    {
        exec(`python3 repoHandler.py URL ${URL}`,  async (error, stdout, stderr) => 
        {
            const jsonContent = fs.readFileSync('./temp/info.json', 'utf-8');
            const data = JSON.parse(jsonContent);
            
            const Name = data.Name
            const Version = data.Version
            
            exec('rm -rf temp')

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
                    JSProgram: JSProgram
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

        });
    }

});

// router.get('/package', (req: Request, res: Response, next: NextFunction) => {



    // Code for download, not sure where this goes for now
    // const base64String = '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'
    // const bufferData = buffer.Buffer.from(base64String, 'base64');
    // res.setHeader('Content-Type', 'application/zip');
    // res.setHeader('Content-Disposition', 'attachment; filename=download.zip');
    // res.send(bufferData)

// });

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


router.put('/package/:ID', verifyToken, async (req: Request, res: Response, next: NextFunction) => {


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

router.get('/package/:ID/rate', verifyToken, async (req: Request, res: Response, next: NextFunction) => {

    
    const p = await Package.findOne({ID: req.params.ID})

    if(p)
    {
        const githubURL = p.URL
        if(!githubURL)
        {
            res.status(400).send('Package does not have a URL')
        }
        else
        {
            const result = extractOwnerAndRepo(githubURL)
            const owner = result?.owner ?? ''
            const repo = result?.repo ?? ''

            const pullRequestMetric = await pullRequestRating(owner, repo)
            const dependencyMetric = await dependency(owner, repo)
            // const dependencyMetric = -1

            const part1Metrics = await getMetrics(githubURL)
            // const netScore = part1Metrics.netScore
            const rampUpScore = part1Metrics.rampUpScore
            const correctnessScore = part1Metrics.correctnessScore
            const busFactorScore = part1Metrics.busFactorScore
            const respScore = part1Metrics.respScore
            const licenseScore = part1Metrics.licenseScore

            const netScore = ((Number(pullRequestMetric) + Number(dependencyMetric) + Number(rampUpScore)
                 + Number(correctnessScore) + Number(busFactorScore) + Number(respScore) + Number(licenseScore)) / 7).toFixed(2)
            
            res.status(200).send({
                "BusFactor": busFactorScore,
                "Correctness": correctnessScore,
                "RampUp": rampUpScore,
                "ResponsiveMaintainer": respScore,
                "LicenseScore": licenseScore,
                "GoodPinningPractice": dependencyMetric,
                "PullRequest": Number(pullRequestMetric),
                "NetScore": Number(netScore)
            })
            
        }
    }
    else
        res.status(404).send('Package does not exist')

    
    

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
