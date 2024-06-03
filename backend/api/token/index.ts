import User from "../models/user";
import * as jwt from 'jsonwebtoken';
import fs from "fs";
import * as process from "node:process";

interface TokenPayload {
    email: string;
    role: string;
}

const privateKeyName: string = process.env.API_SECRET_KEY_PATH || "test_purpose_private_key.pem";
const privateKey: string = fs.readFileSync(`secrets/${privateKeyName}`, 'utf8');
const serviceName: string = process.env.API_SERVICE_NAME || "IntelliinferApi";

function generateToken(user: User): string {
    const tokenPayload: TokenPayload = {
        email: user.email,
        role: user.role,
    };

    const iat: number = Math.floor(Date.now() / 1000);

    return jwt.sign(tokenPayload, privateKey, {
        algorithm: 'RS256',
        expiresIn: '24h',
        issuer: serviceName,
        notBefore: iat,
        subject: user.email,
    });
}

export { generateToken };
