import { assert } from 'chai'

import {dependency} from metric.ts
import {pullRequestRating} from pullRequest.ts

describe("Test Dependency Metric", () =>
{
        it("should return average score for a repo with both old/new dependencies", async() =>
        {
                const owner = "nullivex"
                const repo = "nodist"
                const vers = "1.3.2"
                const depend = await dependency(owner, repo, vers)
                const bool = depend > 0.4
                assert.equal(bool, true)
        })
})

describe("Test Dependency Metric", () =>
{
        it("should return high score for a repo with new dependencies", async() =>
        {
                const owner = "cloudinary"
                const repo = "cloudinary_npm"
                const vers = "2.0.0"
                const depend = await dependency(owner, repo, vers)
                const bool = depend > 0.7
                assert.equal(bool, true)
        })
})

describe("Test Pull Request Metric", () =>
{
        it("should return high score for a repo with lots of pull requests introduced with code review", async() =>
        {
                const owner = "nullivex"
                const repo = "nodist"
                const depend = await dependency(owner, repo)
                const bool = depend > 0.6
                assert.equal(bool, true)
        })
})

describe("Test Pull Request Metric", () =>
{
        it("should return low score for a repo with no pull requests introduced with code review", async() =>
        {
                const owner = "nidhikunigal"
                const repo = "PS_group6"
                const depend = await dependency(owner, repo)
                const bool = depend > 0.1
                assert.equal(bool, false)
        })
})