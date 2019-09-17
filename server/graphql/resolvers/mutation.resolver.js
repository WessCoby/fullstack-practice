import bcrypt from 'bcrypt';
import { Event, User, Booking } from '../../db/model';

export const createEvent = async (parent, args, { user }) => {
    try {
        if(!user) throw new Error("You must be Logged In to continue!")
        const { title, description, price, date, creator } = args.eventInput;
        const event = new Event({
            title,
            description,
            price: +price,
            date: new Date(date),
            creator
        })
        const createdEvent = await event.save();
        return await Event.populate(createdEvent, [{ path: 'creator' }]);
    } catch(error) {
        throw error;
    }
}

export const createUser = async (parent, args, context) => {
    try {
        // const { User } = context.db;
        const { email, password } = args.userInput;
        const existingUser = await User.findOne({ email: email }).exec();

        if (existingUser) {
            throw new Error("User already exists!");
        }
        
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({
            email,
            password: hashedPassword
        })
        const createdUser = await user.save();
        return await User.populate(createUser, [{ path: 'createdEvents' }])
    } catch(error) {
        throw error;
    }
}

export const bookEvent = async (parent, args, context) => {
    try {
        const { eventId } = args;
        // const { Booking, Event } = context.db;

        const booking = new Booking({
            user: "5d7e8b2e87bed31f9d1cb5b0",
            event: eventId
        });
        const savedBooking = await booking.save();
        return await Booking.populate(savedBooking, [{ path: 'user' }, { path: 'event' }]);
    } catch (error) {
        throw error;
    }
}