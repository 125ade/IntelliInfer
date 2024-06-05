import User from "../models/user";
import * as jwt from 'jsonwebtoken';
import fs from "fs";
import * as process from "node:process";
import {verify, VerifyOptions} from "jsonwebtoken";

export interface ITokenPayload {
    email: string;
    role: string;
}

const privateKeyName: string = process.env.API_SECRET_KEY_PATH || "test_purpose_private_key.pem";
const privateKey: string = fs.readFileSync(`secrets/${privateKeyName}`, 'utf8');
const publicKeyName: string = process.env.API_PUBLIC_KEY_PATH || "test_purpose_public_key.pem";
const publicKey: string = fs.readFileSync(`secrets/${publicKeyName}`, 'utf8');
const token_expire: string = process.env.TOKEN_EXPIRE || '24h';
const token_algorithm: jwt.Algorithm = (String(process.env.TOKEN_ALGORITHM) as jwt.Algorithm) || "RS256";
const serviceName: string = process.env.API_SERVICE_NAME || "IntelliinferApi";

export function generateToken(user: User): string {
    const tokenPayload: ITokenPayload = {
        email: user.email,
        role: user.role,
    };
    const tokenSignOptions: jwt.SignOptions = {
        algorithm: token_algorithm,
        expiresIn: token_expire,
        issuer: serviceName,
    };
    return jwt.sign(tokenPayload, privateKey, tokenSignOptions);
}


export function validateToken(token: string): Promise<ITokenPayload> {

    const verifyOptions: VerifyOptions = {
        algorithms: [token_algorithm],
        issuer: serviceName,
    };

    return new Promise((resolve, reject) => {
        verify(token, publicKey, verifyOptions, (err, decoded) => {
            if (err) {
                return reject(err);
            }
            resolve(decoded as ITokenPayload);
        });
    });

}


export function decodeToken(token: string): any {
    return jwt.decode(token);
}