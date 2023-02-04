const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

//midlleware
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ng69xjx.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

app.get('/', (req, res) => {
    res.send('landlord server running');
})

app.listen(port, () => {
    console.log(`server running on ${port}`);
})

async function run() {
    try {
        //collections
        const usersCollection = client.db('landlordHub').collection('users');
        const propertyCollection = client.db('landlordHub').collection('property');

        //add users
        app.post("/users", async (req, res) => {
            const user = req.body;
            const userEmail = user.email;
            const query = { email: userEmail };
            const existsUser = await usersCollection.findOne(query);
            if (existsUser) {
                return res.send({ message: "User already exists!!" });
            }
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });

        //add property
        app.post('/add-property', async (req, res) => {
            const property = req.body;
            console.log(property);
            const result = await propertyCollection.insertOne(property);
            res.send(result);
        })

        //get user specific property
        app.get('/property', async (req, res) => {
            const email = req.query.email;
            console.log(email);
            const query = { email: email }
            const result = await propertyCollection.find(query).toArray();

            return res.send(result);


        })

        //get user specific property
        app.get('/property/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await propertyCollection.findOne(query);
            res.send(result)
        })

        //update property
        app.put('/edit-property/:id', async (req, res) => {
            const id = req.params.id;
            const property = req.body;
            console.log(property);
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    rent: property?.rent,
                    address: property?.address,
                    status: property?.status,
                    bedroom: property?.bedroom,
                    parking: property?.parking,
                    bathroom: property?.bathroom,
                    img: property?.img
                }
            }
            const result = await propertyCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })

        //add expenses
        app.put('/calculation/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id);
            const expenses = req.body;
            const filter = { _id: new ObjectId(id) }
            const calc = await propertyCollection.findOne(filter);
            const calculations = calc?.calculations;
            const options = { upsert: true };

            if (calculations) {
                const updatedDoc = {
                    $set: {
                        calculations: [...calculations, expenses]
                    }
                }
                const result = await propertyCollection.updateOne(filter, updatedDoc, options);
                return res.send(result);
            }

            const updatedDoc = {
                $set: {
                    calculations: [expenses]
                },
            };
            const result = await propertyCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })


    }

    finally {

    }
}

run().catch(console.log())


