const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
var jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config()

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

function verifyjwt(req, res, next) {
    const authHeader = req.headers.authorization;
    // console.log(authHeader);

    if (!authHeader) {
        return res.status(401).send({ massage: "unauthorized access" })
    }
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: "forbidden" })
        }
        console.log('decoded', decoded);
        req.decoded = decoded;
        next();
    })
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nu30w.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const itemsCollection = client.db("perfumes").collection("product");
        // const myitemsCollection = client.db("perfumes").collection("myitems")
        app.get("/inventory", async (req, res) => {
            // const email = req.decoded.email;
            const query = {};
            const cursor = itemsCollection.find(query);
            const product = await cursor.toArray();
            res.send(product);

        });
        app.get("/inventory/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await itemsCollection.findOne(query);
            res.send(product)
        })
        app.post("/inventory", async (req, res) => {
            const newItem = req.body;
            const result = await itemsCollection.insertOne(newItem);
            res.send(result);
        })
        //update quantity
        app.put("/inventory/:id", async (req, res) => {
            const id = req.params.id;
            const updatedItem = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    quantity: updatedItem.quantity
                }
            };
            const result = await itemsCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })

        app.delete("/inventory/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await itemsCollection.deleteOne(query);
            res.send(result);
        })
        app.post("/login", async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
        })

        // app.get("/myitems", async (req, res) => {
        //     const query = {};
        //     const cursor = itemsCollection.find(query);
        //     const items = await cursor.toArray();
        //     res.send(items);
        // })
        // //myitems
        // app.post("/myitems", async (req, res) => {
        //     const myItem = req.body;
        //     const result = await itemsCollection.insertOne(myItem);
        //     res.send(result);
        // })
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