"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyRequest_1 = require("../middleware/verifyRequest");
const router = express_1.default.Router();
router.put('/authenticate', verifyRequest_1.validAuthenticateReq, (req, res, next) => {
    const { User, Secret } = req.body;
    const token = jsonwebtoken_1.default.sign({ User }, process.env.TOKEN_SECRET);
    res.send(token);
});
module.exports = router;
