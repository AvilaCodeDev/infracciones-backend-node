import express from 'express';

const app = express();

app.get('/', (require, res) => {
    res.send("Hola Mundo!");
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
