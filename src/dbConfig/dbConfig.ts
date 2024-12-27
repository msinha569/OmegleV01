import mongoose from "mongoose";

export async function connect(){
    try {
        await mongoose.connect(process.env.MONGO_URI!)
        const connection = mongoose.connection

        connection.on('connected', () => {
            console.log('MongoDB Connected');
            
        })

        connection.on('error', (error) => {
            console.log('MongoDB connection error,'+error);
            process.exit(1)
        })
    } catch (error) {
        console.log("something went wrong while connectiong to database", error);
        
    }
}