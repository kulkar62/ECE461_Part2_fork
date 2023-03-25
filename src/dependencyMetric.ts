import { Octokit} from "@octokit/rest";
import * as dotenv from 'dotenv'
dotenv.config()

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
  version: "latest",
});
export async function dependency(owner: string, repo: string, vers: string) {
  const response = await octokit.repos.getContent({
    owner,
    repo,
    path: "package-lock.json",
  });

  const responseJSON = JSON.parse(JSON.stringify(response.data))
  const packageJson = JSON.parse(Buffer.from(responseJSON.content, 'base64').toString('utf8'))
  



  // const packageJson = JSON.parse(Buffer.from(response.data["content"], 'base64').toString('utf8'));

  const dependencies = packageJson.dependencies;

  //user input version
  const[large1, med1, small1] = vers.toString().split('.')

  let counter = 0
  for (const [dependencyName, version] of Object.entries(dependencies)) {
    //finding out if it is larger than pinned dependency
    const versionJSON = JSON.parse(JSON.stringify(version))
    const [large, med, small] = versionJSON.version.toString().split('.')

    let bool = 0
    if (large > large1) {
      bool = 1
    } else if (large == large1) {
      if (med > med1) {
        bool = 1
      } else if (med == med1) {
        if (small > small1) {
          bool = 1
        }
      }
    }

    if (bool == 1) {
      counter += 1
    }
  }


  //total num of dependencies
  const numberOfDependencies = Object.keys(dependencies).length;
  // console.log(`counter = ${counter}`)
  // console.log(`The Git repository has ${numberOfDependencies} dependencies.`);
  //
    if (numberOfDependencies == 0) {
      // console.log('1.0')
      return 1.0
    } else {
      const val = counter / numberOfDependencies
      return val
    }
    
}

// dependency("nullivex", "nodist", "3.6.2")