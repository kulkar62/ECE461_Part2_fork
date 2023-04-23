import express, {Application, Request, Response, NextFunction, Router, ErrorRequestHandler} from 'express';
import Ajv from 'ajv';


const ajv = new Ajv();

function isValidGitHubUrl(url: string): boolean {
    const regex = /^https?:\/\/github.com\/[\w-]+\/[\w-]+$/;
    return regex.test(url);
}

export function validPostPackages(req: Request, res: Response, next: NextFunction)
{

    const valid = ajv.compile({
        type: "array",
        items: {
            type: "object",
            properties: {
                Version: { type: "string" },
                Name: { type: "string" },
            },
            required: ["Version", "Name"],
            additionalProperties: false,
        },
    });



    if(valid(req.body))
        next()
    else
        res.status(400).send('Bad Request')
}


export function validPostPackage(req: Request, res: Response, next: NextFunction)
{

    const validContent = ajv.compile({
        type: 'object',
        properties: {
            Content: { type: 'string' },
            JSProgram: { type: 'string' },
        },
        required: ['Content', 'JSProgram'],
        additionalProperties: false,
    });

    const validURL = ajv.compile({
        type: 'object',
        properties: {
            URL: { type: 'string' },
            JSProgram: { type: 'string' },
        },
        required: ['URL', 'JSProgram'],
        additionalProperties: false,
    });


    if(validContent(req.body) || validURL(req.body))
        next()
    else
        res.status(400).send('Bad Request')
}

export function validPutPackage(req: Request, res: Response, next: NextFunction)
{
    const valid = ajv.compile({
        type: 'object',
        properties: {
            metadata: {
                type: 'object',
                properties: {
                    Name: { type: 'string' },
                    Version: { type: 'string' },
                    ID: { type: 'string' }
                },
                required: ['Name', 'Version', 'ID'],
                additionalProperties: false,
              },
            data: {
                type: 'object',
                properties: {
                    Content: { type: 'string' },
                    URL: { type: 'string' },
                    JSProgram: { type: 'string' },
                },
                required: ['JSProgram'],
                additionalProperties: false,
            },
        },
        required: ['metadata', 'data'],
        additionalProperties: false,
    });

    if(req.body.data.URL)
    {
        if(valid(req.body) && isValidGitHubUrl(req.body.data.URL))
            next()
        else
            res.status(400).send('Bad Request')
    }
    else
    {
        if(valid(req.body))
            next()
        else
            res.status(400).send('Bad Request')
    }

    
}

export function validAuthenticateReq(req: Request, res: Response, next: NextFunction)
{
    const validateAuthRequest = ajv.compile({
        type: 'object',
        properties: {
            User: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    isAdmin: { type: 'boolean' },
                },
                required: ['name', 'isAdmin'],
                additionalProperties: false,
              },
            Secret: {
                type: 'object',
                properties: {
                    password: { type: 'string' },
                },
                required: ['password'],
                additionalProperties: false,
            },
        },
        required: ['User', 'Secret'],
        additionalProperties: false,
    });

    if(validateAuthRequest(req.body))
        next()
    else
        res.status(400).send('Bad Request')
}

export function validPostRegex(req: Request, res: Response, next: NextFunction)
{

    const valid = ajv.compile({
        type: 'object',
        properties: {
            RegEx: { type: 'string' }
        },
        required: ['RegEx'],
        additionalProperties: false,
    });



    if(valid(req.body))
        next()
    else
        res.status(400).send('Bad Request')
}