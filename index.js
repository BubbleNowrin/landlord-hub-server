const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

//midlleware
app.use(express.json());
app.use(cors());

// const states = [
//     { name: "Alabama", code: "AL" },
//     { name: "Alaska", code: "AK" },
//     { name: "Arizona", code: "AZ" },
//     { name: "Arkansas", code: "AR" },
//     { name: "California", code: "CA" },
//     { name: "Colorado", code: "CO" },
//     { name: "Connecticut", code: "CT" },
//     { name: "Delaware", code: "DE" },
//     { name: "Florida", code: "FL" },
//     { name: "Georgia", code: "GA" },
//     { name: "Hawaii", code: "HI" },
//     { name: "Idaho", code: "ID" },
//     { name: "Illinois", code: "IL" },
//     { name: "Indiana", code: "IN" },
//     { name: "Iowa", code: "IA" },
//     { name: "Kansas", code: "KS" },
//     { name: "Kentucky", code: "KY" },
//     { name: "Louisiana", code: "LA" },
//     { name: "Maine", code: "ME" },
//     { name: "Maryland", code: "MD" },
//     { name: "Massachusetts", code: "MA" },
//     { name: "Michigan", code: "MI" },
//     { name: "Minnesota", code: "MN" },
//     { name: "Mississippi", code: "MS" },
//     { name: "Missouri", code: "MO" },
//     { name: "MontanA", code: "MT" },
//     { name: "Nebraska", code: "NE" },
//     { name: "Nevada", code: "NV" },
//     { name: "New Hampshire", code: "NH" },
//     { name: "New Jersey", code: "NJ" },
//     { name: "New Mexico", code: "NM" },
//     { name: "New York", code: "NY" },
//     { name: "North Carolina", code: "NC" },
//     { name: "North Dakota", code: "ND" },
//     { name: "Ohio", code: "OH" },
//     { name: "Oklahoma", code: "OK" },
//     { name: "Oregon", code: "OR" },
//     { name: "Pennsylvania", code: "PA" },
//     { name: "Rhode Island", code: "RI" },
//     { name: "South Carolina", code: "SC" },
//     { name: "South Dakota", code: "SD" },
//     { name: "Tennessee", code: "TN" },
//     { name: "Texas", code: "TX" },
//     { name: "Utah", code: "UT" },
//     { name: "Vermont", code: "VT" },
//     { name: "Virginia", code: "VA" },
//     { name: "Washington", code: "WA" },
//     { name: "West Virginia", code: "WV" },
//     { name: "Wisconsin", code: "WI" },
//     { name: "Wyoming", code: "WY" },
//   ];

const uri = `mongodb+srv://landlordDB:rAbl5SNHMn83C90D@cluster0.ng69xjx.mongodb.net/?retryWrites=true&w=majority`;
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
        const statesCollection = client.db('landlordHub').collection('States');

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
            // console.log(email);
            const query = { email: email }
            const data = await propertyCollection.find(query).toArray();
            // console.log(data);
            const result = data?.filter(prc => prc.archived !== true);
            // console.log(result);
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
                    status: property?.status,
                    bedroom: property?.bedroom,
                    bathroom: property?.bathroom
                }
            }
            const result = await propertyCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })

        //update image
        app.put('/upload/:id', async (req, res) => {
            const id = req.params.id;
            const propImage = req.body;
            console.log(propImage);
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    img: propImage?.img
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

        // year specific data
        // app.get('/year/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const year = req.query.year;
        //     // console.log(year);
        //     const query = {
        //         _id: new ObjectId(id)
        //     }
        //     const data = await propertyCollection.findOne(query);

        //     console.log(data.calculations);
        //     const yearCalculations = data?.calculations?.filter(exp => exp.date.slice(0, 4) === year);
        //     // console.log(yearCalculations);
        //     res.send({ data, yearCalculations });
        // })

        //delete specific property
        app.delete("/delete/:id", async (req, res) => {
            const id = req.params.id;
            // console.log(id);
            const filter = { _id: new ObjectId(id) }
            const result = await propertyCollection.deleteOne(filter);
            res.send(result);
        })

        //Move specific property to archive
        app.put("/archived/:id", async (req, res) => {
            const id = req.params.id;
            // console.log(id);
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    archived: true
                },
            };
            const result = await propertyCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })

        app.get('/arhived-property', async (req, res) => {
            const email = req.query.email;
            // console.log(email);
            const query = { email: email }
            const data = await propertyCollection.find(query).toArray();
            // console.log(data);
            const result = data?.filter(prc => prc.archived === true);
            // console.log(result);
            return res.send(result);
        })

        //Move specific property from archive to my Property
        app.put("/reactivate/:id", async (req, res) => {
            const id = req.params.id;
            // console.log(id);
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updatedDoc = {
                $set: {
                    archived: false
                },
            };
            const result = await propertyCollection.updateOne(filter, updatedDoc, options);
            res.send(result);
        })

        //get all the states
        app.get('/states', async (req, res) => {
            const query = {};
            const result = await statesCollection.find(query).toArray();
            res.send(result);
        })

        // update expense image 
        app.put("/update_image/:id", async (req, res) => {
            const id = req.params.id;
            const data = req.body;
            const img = data.img;
            const expId = data.id;

            // const options = { upsert: true }
            // console.log(img, expId);
            const result =
                await propertyCollection.updateOne(
                    { _id: new ObjectId(id), "calculations._id": expId },
                    { $set: { "calculations.$.receipt": img } }, { upsert: true }
                )
            res.send(result);
        })

    }

    finally {

    }
}

run().catch(console.log())


