const runtimeOpts = {
  timeoutSeconds: 120,
};

/* THIS DIDN'T SEEM TO DO ANYTHING> STILL NO CONNECT
const firebase = require("firebase");

var firebaseConfig = {
  apiKey: "AIzaSyClZ3ovPUJrGmRD5lwI2GvkPqR-3wGxKlE",
  authDomain: "crudapi3.firebaseapp.com",
  databaseURL: "https://crudapi3.firebaseio.com",
  projectId: "crudapi3",
  storageBucket: "crudapi3.appspot.com",
  messagingSenderId: "369166344068",
  appId: "1:369166344068:web:d995bb41e09c46b32987d1",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig); */

const functions = require("firebase-functions");
const admin = require("firebase-admin");

const serviceAccount = require("./permissions.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://crudapi3.firebaseio.com",
});
const db = admin.firestore();
console.log(db);

const express = require("express");
const app = express();

const cors = require("cors");
app.use(cors({ origin: true })); // this will allow it to go to another domain

//routes
app.get("/hw", (req, resp) => {
  return resp.status(200).send("Hello World");
});
//crud
//create
app.post("/api/create", (req, resp) => {
  (async () => {
    try {
      await db
        .collection("product")
        .doc("/" + req.body.id + "/")
        .create({
          name: req.body.name,
          description: req.body.description,
          price: req.body.price,
        });
      return resp.status(200).send(req.body.id + " added to db");
    } catch (error) {
      console.log(error);
      console.log("this request did not work");
      return resp.status(500).send(error);
    }
  })();
});

//read one doc
app.get("/api/read/:id", (req, resp) => {
  (async () => {
    try {
      const document = db.collection("product").doc(req.params.id);
      let product = await document.get();
      let response = product.data();
      return resp.status(200).send(response);
    } catch (error) {
      console.log(error);
      console.log("this request did not work");
      return resp.status(500).send(error);
    }
  })();
});

//read all docs
app.get("/api/read", (req, resp) => {
  (async () => {
    try {
      let query = db.collection("product");
      let response = [];

      await query.get().then((querySnapshot) => {
        let docs = querySnapshot.docs; // the result of the query
        for (let doc of docs) {
          const selectedItem = {
            id: doc.id,
            name: doc.data().name,
            description: doc.data().description,
            price: doc.data().price,
          };
          response.push(selectedItem);
        }
        return response; // each then should return a value
      });
      return resp.status(200).send(response);
    } catch (error) {
      console.log(error);
      return resp.status(500).send(error);
    }
    return console.log("blah");
  })();
});

//update. Put method

app.put("/api/update/:id", (req, resp) => {
  (async () => {
    try {
      const document = db.collection("product").doc(req.params.id);
      await document.update({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
      });
      return resp.status(200).send(req.body.id + "altered in db"); //req.body.id + "altered in db"
    } catch (error) {
      console.log(error);
      console.log("this request did not work");
      return resp.status(500).send(error);
    }
  })();
});

//delete
app.put("/api/delete/:id", (req, resp) => {
  (async () => {
    try {
      const toDeleteId = req.params.id;
      const document = db.collection("product").doc(req.params.id);
      await document.delete();

      return resp.status(200).send(toDeleteId + " deleted in db");
    } catch (error) {
      console.log(error);
      console.log("this request did not work");
      return resp.status(500).send(error);
    }
  })();
});
//export the api to the firebase cloud fnctions
exports.app = functions.https.onRequest(app);
