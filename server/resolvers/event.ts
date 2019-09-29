import { Resolver, Query, Arg, Ctx, Mutation, Authorized } from 'type-graphql';

import Event, { EventModel } from '../entities/event';
import { NewEventInput } from '../types/inputs';
import { MyContext } from '../types/interfaces';
import User from '../entities/user';

@Resolver()
export class EventResolver {
    //! Queries
    //* Get all Events
    @Query(() => [Event])
    async events(): Promise<Event[]> {
        return await EventModel.getAll()
    }

    //* Get a single Event
    @Query(() => Event, { nullable: true })
    async event(@Arg("eventId") eventId: string): Promise<Event | null> {
        return await EventModel.getOne(eventId);
    }

    //! Mutations
    //* Create a new Event
    @Authorized()
    @Mutation(() => Event)
    async createEvent(
        @Arg("newEventInput") { title, date, price, description }: NewEventInput,
        @Ctx() { getUser }: MyContext
    ): Promise<Event> { 
        try {
            const user = await getUser() as User;
    
            // Add Current User Id to new Event
            const event = new EventModel({
                title,
                description,
                price: +price,
                date: new Date(date),
                creator: user
            })
    
            const createdEvent: Event = await event.save() as Event;
            await user.addEvent(createdEvent);
            return await EventModel.getOne(createdEvent.id) as Event;
        } catch(error) {
            throw error;
        }
    }
}