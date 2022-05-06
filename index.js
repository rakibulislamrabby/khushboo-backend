const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
require('dotenv').config()

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nu30w.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const productsCollection = client.db("perfumes").collection("product");

        app.get("/inventory", async (req, res) => {
            const query = {};
            const cursor = productsCollection.find(query);
            const product = await cursor.toArray();
            res.send(product);
        });

        app.get("/inventory/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query);
            res.send(product)
        })
    }
    finally {

    }

}
run().catch(console.dir)



app.get("/", (req, res) => {
    res.send("Server is running")
})

app.listen(port, () => {
    console.log('server is running');
})