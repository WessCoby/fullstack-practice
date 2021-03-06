import { Resolver, Query, Arg, Mutation, Ctx, Authorized } from 'type-graphql';
import * as bcrypt from 'bcryptjs';
// import * as passport from 'passport'

import { User, UserModel } from '../entities/';
import { LoginInput, NewUserInput, MyContext } from '../types/';


@Resolver()
export default class UserResolver {
    //! Queries
    //* Get all Users
    @Authorized()
    @Query(() => [User])
    async users(): Promise<User[]> {
        let users = await UserModel.find({}).populate({ path: 'createdEvents' }).exec();
        return await users;
    }

    //* User Login
    @Query(() => User, { nullable: true })
    async login(
        @Arg("loginInput") { email, password }: LoginInput,
        @Ctx() context: MyContext
    ): Promise<User | null> {
        const isAuth = await context.login('graphql-local', { email, password });
        if(isAuth) {
            return await context.getUser();
        } else {
            return null;
        }
    }

    //* User Logout
    @Authorized()
    @Query(() => Boolean)
    async logout(@Ctx() { logout, isAuthenticated }: MyContext): Promise<boolean> {
        if(!isAuthenticated()) return false;
        else return await logout();
    }

    //* Get Current User
    @Query(() => User, { nullable: true })
    async currentUser(@Ctx() { isAuthenticated, getUser }: MyContext): Promise<User | null> {
        if(!isAuthenticated()) {
            return null;
        } else {
            return await getUser();
        }
    }

    //! Mutations
    //* User Signup
    @Mutation(() => User)
    async register(
        @Arg("newUserInput") { 
            firstName, lastName, email, password 
        }: NewUserInput
    ): Promise<User> {
        const existingUser = await UserModel.getByEmail(email);

        if (existingUser) {
            throw new Error("A user with this email address already exists!");
        }
        
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new UserModel({
            firstName, 
            lastName,
            email,
            password: hashedPassword
        })
        const createdUser = await user.save();
        return await UserModel.getById(createdUser.id) as User;
    }
}