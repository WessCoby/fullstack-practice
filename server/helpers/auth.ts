import { sign, verify } from 'jsonwebtoken';
import { Request, Response } from 'express';
import { ACCESS_TOKEN_SECRET } from '../config';
import User, { UserModel } from '../entities/user';
import { MyContext } from '../types/interfaces';


export function buildContext(request: Request, response: Response): MyContext {
    const signUser = (user: User): string => {
        return sign(
            { userId: user.id },
            ACCESS_TOKEN_SECRET,
            { expiresIn: '1h' }
        );
    };
    
    const verifyUser = (token: string): object => {
        return verify(token, ACCESS_TOKEN_SECRET) as object;
    }
    
    const login = async (email: string, password: string): Promise<boolean> => {
        const user = await UserModel.getByEmail(email);
        if(!user) return false;
    
        const isPasswordMatch = await user.isPasswordMatch(password);
        if(!isPasswordMatch) return false;
    
        const token = signUser(user);
        request.session!.token = token;
        return true;
    }

    const logout = async(): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            request.session!.destroy(error => {
                if(error) return reject(false);
                response.clearCookie("connect.sid");
                return resolve(true);
            })
        })
    }

    const isAuthenticated = (): boolean => (request.session!.token) ? true : false;
    
    const getUser = async(): Promise<User | null> => {
        const token = request.session!.token
        if(token) {
            const { userId } = verifyUser(token) as any;
            return await UserModel.getById(userId) as User;
        } else {
            return null;
        }
    }

    return {
        request, response, getUser, login, isAuthenticated, logout
    }
}
