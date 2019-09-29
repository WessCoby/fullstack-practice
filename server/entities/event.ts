import { prop, Typegoose, ModelType, staticMethod, Ref } from '@hasezoey/typegoose';
import { Field, Float, ObjectType, ID } from 'type-graphql';
import User from './user';

type EventModelType = ModelType<Event> & typeof Event;
// type EventInstanceType = InstanceType<Event | any>;

//! Event Class
@ObjectType()
export default class Event extends Typegoose {
    @Field(() => ID)
    readonly id: string;
    
    @Field()
    @prop({ required: true })
    public title: string;
    
    @Field()
    @prop()
    public description: string;
    
    @Field(() => Float)
    @prop()
    public price: number;
    
    @Field()
    @prop()
    public date: Date;
    
    // Reference to creator (User)
    @Field(() => User)
    @prop({ ref: "User" })
    public creator: Ref<User>;

    @Field()
    public createdAt: Date;

    @Field()
    public updatedAt: Date;

    // Static Methods
    @staticMethod
    public static async getOne(
        this: EventModelType,
        id: string
    ): Promise<Event | null> {
        return await this
                        .findById(id)
                        .populate({
                            path: 'creator',
                            populate: [
                                { path: 'createdEvents'}
                            ]
                        });
    }

    @staticMethod
    public static async getAll(
        this: EventModelType
    ): Promise<Event[]> {
        return await this
                        .find({})
                        .populate({
                            path: 'creator',
                            populate: [
                                { path: 'createdEvents'}
                            ]
                        });
    }
}

//! Event Model
export const EventModel = new Event().getModelForClass(Event, {
    schemaOptions: { timestamps: true }
})

