import { prop, Typegoose, Ref, arrayProp } from '@hasezoey/typegoose';
import { Field, ID, ObjectType, Root } from 'type-graphql';
import { Event } from './event';

//! User Class 
@ObjectType()
export class User extends Typegoose {
    @Field(() => ID)
    id: string;

    @prop()
    public firstName: string;
    
    @prop()
    public lastName: string;
    
    @Field(() => String)
    async name(@Root() {firstName, lastName}: User): Promise<String> {
        return await `${firstName} ${lastName}`;
    }
    
    @Field()
    @prop({ unique: true, required: true, index: true })
    public email: string;
    
    @prop()
    public password: string;
    
    @Field(() => [Event])
    @arrayProp({ itemsRef: Event })
    public createdEvents: Ref<Event>;

    @Field()
    public createdAt: Date

    @Field()
    public updatedAt: Date;
}

//! User Model
export const UserModel = new User().getModelForClass(User, {
    schemaOptions: { timestamps: true }
});

