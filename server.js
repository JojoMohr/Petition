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
    secret: `skateordie`,
    maxAge: 1000 * 60 * 60 * 24 * 14
}));
/////////////////////////////////////////////

app.get('/', (req, res) => {
    res.render("petition", { validInfo: true });


})

app.get("/thanks", (req, res) => {
    const sessionId = req.session.id
    res.render("thanks")
})
app.get("/signers", (req, res) => {
    res.render("signers")
})


app.post('/', function(req, res) {
    let { firstName, lastName, signature } = req.body;
    db.addSign(firstName, lastName, signature)
        .then(({ rows }) => {
            req.session.id = rows[0].id
            console.log('rows: ', rows);
        })
        .catch(err => {
            console.log('err: ', err);
            res.sendStatus(500);
        });
    console.log(req.body)
    if (validInfo(firstName, lastName, signature) == false) {
        res.render("petition", { validInfo: false })

    } else {
        res.redirect(301, "/thanks")
    }

    validInfo(firstName, lastName, signature)
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