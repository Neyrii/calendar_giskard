const mongoose = require('mongoose')

module.exports = () => {
    mongoose.connect(process.env.MONGODB_URI,  {
        dbName : process.env.DB_NAME,
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(() =>{
        console.log('Mongodb Connected ');
    }).catch(err => console.log(err.message))

    mongoose.connection.on('disconnected', () => {
        console.log('Mongoose connection is disconnected...');
    });

    process.on('SIGINT', () =>{
        mongoose.connection.close(() =>{
            console.log('Mongose connection closed')
            process.exit(0);
        })
    })
}