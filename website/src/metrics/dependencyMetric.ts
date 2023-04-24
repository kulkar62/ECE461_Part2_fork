import { Octokit} from "@octokit/rest";
import * as dotenv from 'dotenv'
dotenv.config()

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
  version: "latest",
});

export async function dependency(owner: string, repo: string) {
  try {
    const response = await octokit.repos.getContent({
      owner,
      repo,
      path: "package-lock.json"
    });
  //console.log(response.data)
  const responseJSON = JSON.parse(JSON.stringify(response.data))
  const packageJson = JSON.parse(Buffer.from(responseJSON.content, 'base64').toString('utf8'))
  const dependencies = packageJson.dependencies;

  let notPinned = 0;
  let pinned = 0;
  for (const [dependencyName, version] of Object.entries(dependencies)) {
    const versionJSON = JSON.parse(JSON.stringify(version))
    const [large, med, small] = versionJSON.version.toString().split('.')
    const finder = versionJSON.toString().indexOf("-")
    const carrot = versionJSON.toString().indexOf("^")

    //if it is in form "1"
    if ((med == undefined) && (small == undefined)){
      notPinned++
    }
    //if it is in form 1.0-3.2
    else if (finder != -1 ){
      notPinned++
    }
    //if you find a carrot 
    else if (carrot != -1){
      //major version pinned is unacceptable with a carrot (ex. ^2.1 is not okay, but ^0.x is okay)
      if (large != undefined){
        notPinned++
      }
    }
    //otherwise it is in an acceptable format
    else {
      pinned++
    }
  }

  //total num of dependencies
  const numberOfDependencies = Object.keys(dependencies).length;
  // console.log(`counter = ${counter}`)
  // console.log(`The Git repository has ${numberOfDependencies} dependencies.`);
  //
    if (numberOfDependencies == 0) {
      return 1.0
    } else {
      const val = pinned / numberOfDependencies
      return val
    }

  }
  catch(error) {
    const resp1 = await octokit.repos.getContent({
      owner,
      repo,
      path: "package.json"
    });
    const responseJSON = JSON.parse(JSON.stringify(resp1.data))
    const packageJson = JSON.parse(Buffer.from(responseJSON.content, 'base64').toString('utf8'))

    const dependencies = packageJson.dependencies;


    let notPinned = 0
    let pinned = 0

    for (const version of Object.entries(dependencies)) {
      //finding out if it is larger than pinned dependency
      const versionJSON = JSON.parse(JSON.stringify(version))
      const [large, med, small] = versionJSON.version.toString().split('.')
      const finder = versionJSON.toString().indexOf("-")
      const carrot = versionJSON.toString().indexOf("^")
  

      //if it is in form "1"
      if ((med == undefined) && (small == undefined)){
        notPinned++
      }
      //if it is in form 1.0-3.2
      else if (finder != -1 ){
        notPinned++
      }
      //if you find a carrot 
      else if (carrot != -1){
        //major version pinned is unacceptable with a carrot (ex. ^2.1 is not okay, but ^0.x is okay)
        if (large != undefined){
          notPinned++
        }

      }
      //otherwise it is in an acceptable format
      else {
        pinned++
      }
    }

      //total num of dependencies
      const numberOfDependencies = Object.keys(dependencies).length;

        if (numberOfDependencies == 0) {
          return 0.0
        } else {
          const val = pinned / numberOfDependencies
          return val
        }
    }

}
