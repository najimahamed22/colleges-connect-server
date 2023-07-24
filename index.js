const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5acr8wm.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();
    // More code will be here
    const collegeCollection = client.db("endGame").collection("colleges");
    const researchPaperCollection = client
      .db("endGame")
      .collection("researchPaper");
    const galleryCollection = client.db("endGame").collection("gallery");
    const usersCollection = client.db("endGame").collection("users");
    const classesCollection = client.db("endGame").collection("classes");
    const reviewCollection = client.db("endGame").collection("review");

    app.get("/allColleges", async (req, res) => {
      const result = await collegeCollection.find().toArray();
      res.send(result);
    });

    app.get("/singleCollege/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await collegeCollection.findOne(query);
      res.send(result);
    });
    app.get("/searchColleges/:name", async (req, res) => {
      const name = req.params.name;
      // Create a case-insensitive regular expression to match the college names
      const query = { collegeName: { $regex: new RegExp(name, "i") } };
      const result = await collegeCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/researchPaper", async (req, res) => {
      const result = await researchPaperCollection.find().toArray();
      res.send(result);
    });
    app.get("/gallery", async (req, res) => {
      const result = await galleryCollection.find().toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;

      const query = { email: user.email };
      const existingUser = await usersCollection.findOne(query);

      if (existingUser) {
        return res.send({ message: "User already exists" });
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    });

    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });
    app.patch("/updateData/:email", async (req, res) => {
      const email = req.params.email;
      const find = { email: email };
      const query = await usersCollection.findOne(find);
      const options = { upsert: true };
      const updateUser = req.body;
      const user = {
        $set: {
          name: updateUser.name,
          address: updateUser.address,
          photoURl: updateUser.photoURl,
          university: updateUser.university,
        },
      };
      const result = await usersCollection.updateOne(query, user, options);
      res.send(result);
    });

    app.post("/classes", async (req, res) => {
      const classData = req.body;

      const result = await classesCollection.insertOne(classData);
      res.send(result);
    });

    app.get("/classes", async (req, res) => {
      const result = await classesCollection.find().toArray();
      res.send(result);
    });

    app.get("/classes/:candidateEmail", async (req, res) => {
      const candidateEmail = req.params.candidateEmail;
      const result = await classesCollection.findOne({ candidateEmail });
      res.send(result);
    });

    app.post("/reviews", async (req, res) => {
      const review = req.body;

      try {
        const result = await reviewCollection.insertOne(review);
        res.send(result);
      } catch (error) {
        console.error("Error posting review:", error);
        res.status(500).send({ error: "Error posting review" });
      }
    });
    app.get("/reviews", async (req, res) => {
      const result = await reviewCollection.find().toArray();
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
