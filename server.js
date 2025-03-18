const dotenv = require('dotenv');
const mongoose = require("mongoose");
process.on("uncaughtException", (err) => {
    console.log("uncaught exception! Shutting Down Server");
    console.log(err.name,":", err);
    process.exit(1);
}
);
dotenv.config();
const App = require('./app');

mongoose.connect(process.env.DB_CONNECTION_URI).then(() => {
    console.log("DB Connected Successfully");
}).catch((err) => {
    console.log("Error in DB Connection", err);
}
);

const port = process.env.PORT || 3000;

const server = App.listen(port, () => {
    console.log(`Server running on port http://localhost:${port}`);
});

process.on("unhandledRejection", (err) => {
    console.log("Unhandled rejection! Shutting Down Server...");
    console.log(err.name,":", err.message);
    server.close(() => {
        process.exit(1);
    });
});