const express  = require('express');
const app = express(); 
const morgan = require('morgan');
const helmet = require("helmet");
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const path = require("path");
const userRouter = require("./Routes/userRoutes");
const globalErrorHandler = require('./Controllers/errorController');
const postRouter = require("./Routes/postRoutes");


const App = express();
App.use("/", express.static("uploads"));
App.use(cookieParser());
App.use(helmet());
App.use(cors({
    origin:[
        "http://localhost:3000",
        "https://miky-frontend.vercel.app",
    ],
    credentials:true,
}
));

App.use(express.static(path.join(__dirname, "public")));
if (process.env.NODE_ENV === 'development') {
    App.use(morgan('dev'));
} 
App.use(express.json({limit: "10kb"}));
App.use(mongoSanitize());

// Routes for Users 
App.use("/api/v1/users", userRouter);

// Routes for Posts
App.use("/api/v1/posts", postRouter);


app.all("*", (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
}
);

App.use(globalErrorHandler);
module.exports = App;