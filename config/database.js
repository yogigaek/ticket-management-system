const mongoose = require('mongoose');
const { dbPass, dbName, dbPort, dbUser, dbHost0, dbHost1, dbHost2, dbSsl } = require("./config");
const mongoURI = `mongodb://${dbUser}:${dbPass}@${dbHost0}:${dbPort},${dbHost1}:${dbPort},${dbHost2}:${dbPort}/${dbName}?${dbSsl}`;
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Database Connection Estabilished....');
})
.catch((err) => {
    console.log("Error : Database Connection can not be estabilished...", err);
})