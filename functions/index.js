const runtimeOpts = {
  timeoutSeconds: 120,
};

const functions = require("firebase-functions");
const admin = require("firebase-admin");

const serviceAccount = require("./permissions.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://crudapi3.firebaseio.com",
});
const db = admin.firestore();

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
        .collection("expenses")
        .doc("/" + req.body.id + "/")
        .create({
          sum: req.body.sum,
          payee: req.body.payee,
          category: req.body.category,
          account: req.body.account,
          billable: req.body.billable,
          comment: req.body.comment,
          date: req.body.date,
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
      const document = db.collection("expenses").doc(req.params.id);
      let expense = await document.get();
      let response = expense.data();
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
      let query = db.collection("expenses");
      let response = [];


      await query.get().then((querySnapshot) => {

        let docs = querySnapshot.docs; // the result of the query
        for (let doc of docs) {
          const selectedItem = {
            id: doc.id,
            sum: doc.data().sum,
            payee: doc.data().payee,
            category: doc.data().category,
            account: doc.data().account,
            billable: doc.data().billable,
            comment: doc.data().comment,
            date: doc.data().date
          };
          response.push(selectedItem);
        }
        return response; // each then should return a value
      });
      return resp.status(200).send(response);
    } catch (error) {
      console.log(error);
      return resp.status(500).send(error + " broken");
    }
  })();
});

//update. Put method

app.put("/api/update/:id", (req, resp) => {
  (async () => {
    try {
      const document = db.collection("expenses").doc(req.params.id);
      const idInfo = req.params.id;
      await document.update({
        sum: req.body.sum,
        payee: req.body.payee,
        category: req.body.category,
        account: req.body.account,
        billable: req.body.billable,
        comment: req.body.comment,
        date: req.body.date,
      });
      return resp.status(200).send(idInfo + " altered in db"); //req.body.id + "altered in db"
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
      const document = db.collection("expenses").doc(req.params.id);
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
