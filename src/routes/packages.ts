import express, {Application, Request, Response, NextFunction, Router, ErrorRequestHandler} from 'express';
const router: Router = express.Router();
const verifyToken = require('../middleware/verifyToken')
import Package from '../model/Package';
import { validPostPackages } from '../middleware/verifyRequest';
import semver from 'semver'



router.post('/packages', verifyToken, validPostPackages, async (req: Request, res: Response, next: NextFunction) => {

    let allMatchingPackages: Array<any> = [];
    
    if(req.body.length == 1 && req.body[0].Name == '*')
        allMatchingPackages = await Package.find()
    
    else
    {
        for(var i = 0; i < req.body.length; i++)
        {
            const semverRange = req.body[i].Version
            const packageName = req.body[i].Name
            const packages = await Package.find({Name: packageName});
            const matchingPackages = packages.filter(p => semver.satisfies(p.Version, semverRange));
            
            allMatchingPackages = allMatchingPackages.concat(matchingPackages)
        }
    }
    


    var offset = Number(req.query.offset)
    if(!offset)
        offset = 1

    const pageSize = 10;
    const start = (offset - 1) * pageSize;
    const remaining = allMatchingPackages.length - start;
    const end = start + Math.min(pageSize, remaining);
    const page = allMatchingPackages.slice(start, end);

    if(page.length)
        res.status(200).send(page)
    
    else
        res.status(404).send('No results found')    

});









module.exports = router