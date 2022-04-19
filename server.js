const express = require('express');
const app = express();
const db = require('./database/db');
// const validInfo = require("./validInfo.js")
const blancCanvas = require("./blancCanvas.json");

const { engine } = require('express-handlebars');
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');

app.use(express.static('./public'));
app.use(express.urlencoded({
    extended: false
}));



app.get('/', (req, res) => {
    console.log('Petition page got GOT REQUESTED 🟡');

    res.render("petition", { validInfo: true });
})

app.get("/thanks", (req, res) => {
    console.log("Thanks Page got requested 🟡")
    res.render("thanks")
})
app.get("/signers", (req, res) => {
    console.log("Signers Page got requested 🟡")
    res.render("signers")
})


app.post('/', function(req, res) {
    let { firstName, lastName, signiture } = req.body;
    console.log(req.body)
    if (validInfo(firstName, lastName, signiture) == false) {
        res.render("petition", { validInfo: false })
    } else {
        res.redirect("/thanks")
    }

    validInfo(firstName, lastName, signiture)
        // res.send(JSON.stringify(req.body));
});

function validInfo(firstName, lastName, signature) {
    // Check if All fields are filled 
    if (firstName == "" || lastName == "" || signature == blancCanvas) {
        console.log("Error❌")
        return false
    } else {
        console.log("✅✅✅")
        return true
    }
}


app.listen(8080, () => console.log("Listening ✅"));