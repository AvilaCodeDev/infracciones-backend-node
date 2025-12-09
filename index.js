import express from 'express';

const app = express();

app.get('/api-node/', (require, res) => {
    res.send("Back end Node");
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
