import { Octokit} from "@octokit/rest";

const octokit = new Octokit({
  auth: `token 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`,
  version: "latest",
});

async function dependency(owner, repo, vers) {
  try {
    const response = await octokit.repos.getContent({
      owner,
      repo,
      path: "package-lock.json"
    });
  //console.log(response.data)
  const packageJson = JSON.parse(Buffer.from(response.data["content"], 'base64').toString('utf8'));

  const dependencies = packageJson.dependencies;

  //user input version
  const[large1, med1, small1] = vers.toString().split('.')

  let counter = 0
  for (const [dependencyName, version] of Object.entries(dependencies)) {
    //finding out if it is larger than pinned dependency
    const [large, med, small] = version["version"].toString().split('.')

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
      console.log('1.0')
    } else {
      const val = counter / numberOfDependencies
      console.log(val)
    }

  }
  catch(error) {
    const resp1 = await octokit.repos.getContent({
      owner,
      repo,
      path: "package.json"
    });
    const packageJson = JSON.parse(Buffer.from(resp1.data["content"], 'base64').toString('utf8'));

    const dependencies = packageJson.dependencies;
    //user input version
    const[large1, med1, small1] = vers.toString().split('.')

    let counter = 0
    for (const version of Object.entries(dependencies)) {
      //finding out if it is larger than pinned dependency
        var strr = version[1].toString().slice(1)
        const [large, med, small] = strr.split('.')

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

        if (numberOfDependencies == 0) {
          console.log('0.0')
        } else {
          const val = counter / numberOfDependencies
          console.log(val)
    }
    }

}

dependency("cloudinary", "cloudinary_npm", "2.0.0")