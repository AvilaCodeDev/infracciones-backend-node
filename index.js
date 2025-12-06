import express from 'express';

const app = express();

app.get('/api-node/', (require, res) => {
    res.send("Te amo, Erika Marisol <3");
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
