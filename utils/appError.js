class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
   
        if (!statusCode || typeof statusCode !== "number") {
            throw new Error("statusCode must be a number");
        }

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
 
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;