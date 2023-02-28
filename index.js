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
        const calculationCollection = client.db('landlordHub').collection('calculations');
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

        // //add expenses
        // app.put('/calculation/:id', async (req, res) => {
        //     const id = req.params.id;
        //     // console.log(id);
        //     const expenses = req.body;
        //     const filter = { _id: new ObjectId(id) }
        //     const calc = await propertyCollection.findOne(filter);
        //     const calculations = calc?.calculations;
        //     const options = { upsert: true };

        //     if (calculations) {
        //         const updatedDoc = {
        //             $set: {
        //                 calculations: [...calculations, expenses]
        //             }
        //         }
        //         const result = await propertyCollection.updateOne(filter, updatedDoc, options);
        //         return res.send(result);
        //     }

        //     const updatedDoc = {
        //         $set: {
        //             calculations: [expenses]
        //         },
        //     };
        //     const result = await propertyCollection.updateOne(filter, updatedDoc, options);
        //     res.send(result);
        // })

        // add expense and payment
        app.post("/calculation", async(req,res)=>{
            const body = req.body;
            console.log(body)
            const result = await calculationCollection.insertOne(body);
            res.send(result); 
        })
        
        // get calculation by property id 
        app.get("/calculations/:id", async(req,res)=>{
            const id = req.params.id;
            const year = req.query.year;
            const filter = { propertyId: id, date: { $regex: year } };
            const query = {propertyId: id}
            let years = [];
            const forYear = await calculationCollection.find(query).sort({date: -1}).toArray();
            const yearsArr = forYear?.map((yrs) => {
              const yr = yrs.date.slice(0, 4);

              if (!years.includes(yr)) {
                years.push(yr);
              }
              return years;
            });
            const result = await calculationCollection
              .find(filter)
              .sort({ date: -1 })
              .toArray();
            res.send({calculations:result, allYear:years})
        })
        
        // upload photo 
        app.put("/upload_photo/:id", async(req,res)=>{
            const img = req.body.img;
            const id = req.params.id;
            console.log(img,id)
            const query = {_id: new ObjectId(id)}
            const updatedDoc = {
                $set:{
                    receipt: img
                }
            }
            const options = {upsert: true};
            const result = await calculationCollection.updateOne(query,updatedDoc,options);
            res.send(result);
        })

        // get dashboard data 
        app.get("/dashboard",async(req,res)=>{
          // email month year
          const email = req.query.email;
          const month = req.query.month;
          const queryYear = req.query.year;
          const year = month ? queryYear + "-" + month : queryYear;
          const property = req.query.street;
          // query
          const propertyQuery = property
            ? { street: property, propertyOwner: email }
            : { propertyOwner: email };

          const filter = {
            propertyOwner: email,
            date: { $regex: year },
          };

          const monthQuery = {
            propertyOwner: email,
            date: { $regex: queryYear },
          };

          const result = await calculationCollection
            .find(filter)
            .sort({ date: -1 })
            .toArray();
          // year month expenses payment variable
          let years = [];
          let months = [];
          let properties = [];
          let expenses = 0;
          let payments = 0;
          let total = 0;
          let cashflow = 0;
          let cashflowData = [];
          const query = { propertyOwner: email };

          // make month array
          const monthArr = await calculationCollection
            .find(monthQuery)
            .sort({ date: -1 })
            .toArray();
          monthArr.map((singleMonth) => {
            const month = singleMonth.date.slice(5, 7);
            if (!months.includes(month)) {
              months.push(month);
            }
          });

          const forYear = await calculationCollection
            .find(query)
            .sort({ date: -1 })
            .toArray();
          //   expenses and payment calculation
          const calculataionArray = result.map((exp) => {
            if (exp.expense) {
              expenses += parseFloat(exp.amount);
            } else {
              payments += parseFloat(exp.amount);
            }

            total = parseFloat(expenses) + parseFloat(payments);
            cashflow = parseFloat(payments) - parseFloat(expenses);
          });
          //   year and month array
          const yearsArr = forYear?.map((yrs) => {
            const yr = yrs.date.slice(0, 4);
            const street = yrs.street;
            if (!years.includes(yr)) {
              years.push(yr);
            }
            if (!properties.includes(street)) {
              properties.push(street);
            }
          });
          // for property

          const propertyResult = await calculationCollection
            .find(propertyQuery)
            .toArray();
          const propertyArray = propertyResult.map((yrs) => {
            const month = yrs.date.slice(0, 7);
            if (cashflowData.length === 0) {
              const payment = yrs?.payment ? parseFloat(yrs?.amount) : 0;
              const expense = yrs?.expense ? parseFloat(yrs?.amount) : 0;
              cashflowData.push({
                date: month,
                paymentAmount: payment,
                expenseAmount: expense,
                cashflow: yrs?.expense
                  ? parseFloat(yrs?.amount)
                  : 0 - yrs?.payment
                  ? parseFloat(yrs?.amount)
                  : 0,
              });
            } else if (cashflowData.length > 0) {
              const selectedMonth = cashflowData?.find(
                (data) => data?.date == month
              );
              if (selectedMonth) {
                const payment = yrs?.payment ? parseFloat(yrs?.amount) : 0;
                const expense = yrs?.expense ? parseFloat(yrs?.amount) : 0;

                selectedMonth.paymentAmount += payment;
                selectedMonth.expenseAmount += expense;
                selectedMonth.cashflow =
                  selectedMonth.paymentAmount - selectedMonth.expenseAmount;
              } else {
                const payment = yrs?.payment ? parseFloat(yrs?.amount) : 0;
                const expense = yrs?.expense ? parseFloat(yrs?.amount) : 0;
                cashflowData = [
                  ...cashflowData,
                  {
                    date: month,
                    paymentAmount: payment,
                    expenseAmount: expense,
                    cashflow: payment - expense,
                  },
                ];
              }
            }
          });
          
          res.send({
            calculations: result,
            allYear: years,
            allMonth: months,
            allProperty: properties,
            expenses,
            payments,
            total,
            cashflow,
            cashflowData,
          });
        })

        // update table data 
        app.put('/update-calculation/:id',async(req,res)=>{
          const id = req.params.id;
          const date = req.body.date;
          const amount = req.body.amount;
          const description = req.body.description;
          const category = req.body.category;
          const query = {_id: new ObjectId(id)}
          const options = {upsert: true}
          const updatedDoc = {
            $set:{
              date,
              amount,
              description,
              category
            }
          }
          const result = await calculationCollection.updateOne(query,updatedDoc,options);
          res.send(result)
        })

        // delete calcualtion 
        app.delete('/delete-calculation/:id', async(req,res)=>{
          const id = req.params.id;
          const query = {_id: new ObjectId(id)}
          const result = await calculationCollection.deleteOne(query);
          res.send(result)
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


