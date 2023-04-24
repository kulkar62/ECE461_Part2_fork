"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validPostRegex = exports.validAuthenticateReq = exports.validPutPackage = exports.validPostPackage = exports.validPostPackages = void 0;
const ajv_1 = __importDefault(require("ajv"));
const ajv = new ajv_1.default();
function isValidGitHubUrl(url) {
    const regex = /^https?:\/\/github.com\/[\w-]+\/[\w-]+$/;
    return regex.test(url);
}
function validPostPackages(req, res, next) {
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
    if (valid(req.body))
        next();
    else
        res.status(400).send('Bad Request');
}
exports.validPostPackages = validPostPackages;
function validPostPackage(req, res, next) {
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
    if (validContent(req.body) || validURL(req.body))
        next();
    else
        res.status(400).send('Bad Request');
}
exports.validPostPackage = validPostPackage;
function validPutPackage(req, res, next) {
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
    if (req.body.data.URL) {
        if (valid(req.body) && isValidGitHubUrl(req.body.data.URL))
            next();
        else
            res.status(400).send('Bad Request');
    }
    else {
        if (valid(req.body))
            next();
        else
            res.status(400).send('Bad Request');
    }
}
exports.validPutPackage = validPutPackage;
function validAuthenticateReq(req, res, next) {
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
    if (validateAuthRequest(req.body))
        next();
    else
        res.status(400).send('Bad Request');
}
exports.validAuthenticateReq = validAuthenticateReq;
function validPostRegex(req, res, next) {
    const valid = ajv.compile({
        type: 'object',
        properties: {
            RegEx: { type: 'string' }
        },
        required: ['RegEx'],
        additionalProperties: false,
    });
    if (valid(req.body))
        next();
    else
        res.status(400).send('Bad Request');
}
exports.validPostRegex = validPostRegex;
