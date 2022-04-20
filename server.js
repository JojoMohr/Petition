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


////////// REQUIERE COOKIE-SESSION ///////////
const cookieSession = require('cookie-session');

app.use(cookieSession({
    secret: `noscooters`,
    maxAge: 1000 * 60 * 60 * 24 * 14,
    sameSite: true
}));
/////////////////////////////////////////////

////////////  BROWSER REGUESTS  //////////////             
app.get('/', (req, res) => {
    if (req.session.signID) {
        res.redirect("/thanks")
        return
    }
    res.render("petition", { validInfo: true });

})

app.get("/thanks", (req, res) => {
    if (req.session.signID) {
        const currentId = req.session.signID;
        db.getSigById(currentId).then(({ rows }) => {
                console.log("THIS IS THE data from getSigByID", rows);
                let { firstname, lastname, signature } = rows[0]
                db.getSigCount().then(({ rows }) => {

                    const numberOfSigners = rows[0].count
                    res.render("thanks", { numberOfSigners, firstname, lastname, signature })
                }).catch((error) => {
                    console.log(error)
                    res.sendStatus(500);
                })


            }).catch((error) => {
                console.log(error);
                res.sendStatus(500);
            })
            //const sessionId = req.session.id
    } else {
        res.redirect("/");
    }
})


app.get("/signers", (req, res) => {
    db.getSign().then(({ rows }) => {
        console.log(rows)
        res.render("signers", { rows })
    }).catch((error) => {
        console.log(error)
        res.sendStatus(500);
    });

})

app.post('/', function(req, res) {
    let { firstName, lastName, signature } = req.body;
    if (validInfo(firstName, lastName, signature) == false) {
        res.render("petition", { validInfo: false })
    } else {
        db.addSign(firstName, lastName, signature)
            .then(({ rows }) => {
                console.log(rows);
                req.session.signID = rows[0].id

                // req.session.id = rows[0].id
                console.log("⬆️Upload Complete!!")
                res.redirect("/thanks")
            })
            .catch(err => {
                console.log('err: ', err);
                res.sendStatus(500);
            });

    }

    validInfo(firstName, lastName, signature)
        // res.send(JSON.stringify(req.body));
});

function validInfo(firstName, lastName, signature) {
    // Check if All fields are filled 
    if (firstName == "" || lastName == "" || signature == "") {
        console.log("Error❌")
        return false
    } else {
        console.log("✅✅✅")
        return true
    }
}



app.listen(8080, () => console.log("Listening ✅"));