import { Octokit} from "@octokit/rest";
import * as dotenv from 'dotenv'
dotenv.config()

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
  version: "latest",
});

export async function pullRequestRating(owner: string, repo: string) {
    //query for git repo based off of specific owner and repo
    const pullRequestsResponse = await octokit.pulls.list({
      owner,
      repo,
    });


    //initialize vars
    let reviewedLines = 0
    let totalLines = 0

    //iterate through all the pull requests
    for (const pullRequest of pullRequestsResponse.data) {
      const pullRequestResponse = await octokit.pulls.get({
        owner,
        repo,
        pull_number: pullRequest.number,
      });

      //find diff between pull requests
      const diffUrl = pullRequestResponse.data.diff_url;
      const diffResponse = await octokit.request({
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
    if (isNaN(fractionReviewed)){
    //   console.log("0.0")
      return ("0.0")
    }
    // console.log(fractionReviewed);
    return (fractionReviewed)
}

// pullRequestRating("nidhikunigal", "PS_Group6")