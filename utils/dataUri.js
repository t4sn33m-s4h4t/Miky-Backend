const DataUriParser = require("datauri/parser");
const path = require("path");

const getDataUri = (file) => {
    if (!file || !file.buffer) {
        throw new Error("Invalid file input");
    }

    const parser = new DataUriParser();
    const extname = path.extname(file.originalname).toString() 
    
    return parser.format(extname, file.buffer).content;
};

module.exports = getDataUri;
