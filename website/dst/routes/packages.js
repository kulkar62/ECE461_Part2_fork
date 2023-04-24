"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const verifyToken = require('../middleware/verifyToken');
const Package_1 = __importDefault(require("../model/Package"));
const verifyRequest_1 = require("../middleware/verifyRequest");
const semver_1 = __importDefault(require("semver"));
router.post('/packages', verifyToken, verifyRequest_1.validPostPackages, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let allMatchingPackages = [];
    if (req.body.length == 1 && req.body[0].Name == '*')
        allMatchingPackages = yield Package_1.default.find();
    else {
        for (var i = 0; i < req.body.length; i++) {
            const semverRange = req.body[i].Version;
            const packageName = req.body[i].Name;
            const packages = yield Package_1.default.find({ Name: packageName });
            const matchingPackages = packages.filter(p => semver_1.default.satisfies(p.Version, semverRange));
            allMatchingPackages = allMatchingPackages.concat(matchingPackages);
        }
    }
    var offset = Number(req.query.offset);
    if (!offset)
        offset = 1;
    const pageSize = 10;
    const start = (offset - 1) * pageSize;
    const remaining = allMatchingPackages.length - start;
    const end = start + Math.min(pageSize, remaining);
    const page = allMatchingPackages.slice(start, end);
    if (page.length)
        res.status(200).send(page);
    else
        res.status(404).send('No results found');
}));
module.exports = router;
