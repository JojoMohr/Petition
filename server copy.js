const express = require('express');
const app = express();
const db = require('./database/db');
// const validInfo = require("./validInfo.js")

//////////// HANDLEBARS //////////////////////////////////////////////
const { engine } = require('express-handlebars');
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');

////////////  MIDDLEWARE  ////////////////////////////////////////////   
// Serve poublic folder incl. css, js , images   with express.static       
app.use(express.static('./public'));

// express.undercoded to parse form data
app.use(express.urlencoded({
    extended: false
}));

////////// REQUIERE COOKIE-SESSION ///////////////////////////////////
const cookieSession = require('cookie-session');
app.use(cookieSession({
    // the secret string helps to encode
    secret: `noscooters`,
    // cookies will stay for 2 weeks
    maxAge: 1000 * 60 * 60 * 24 * 14,
    //sameSite: true to prevent the browser from 
    //sending  cookies set by a domain as part of requests to 
    //that domain unless user  is viewing a page served by that domain.
    sameSite: true
}));
////////////  GET REGUESTS  /////////////////////////////////////////////////////////////    
///////////////////////////////////////////////////////////////////////////////////////////
/// REDIRECT TO PETITION PAGE IF / GET REQUESTED    
app.get("/", (req, res) => {
    res.redirect("/petition")
})

//////////// PETITION PAGE ////////
app.get('/petition', (req, res) => {
    // IF THERE IS ALREADY A COOKIE REDIRECT DIRECTRLY TO /THANKS
    if (req.session.signID) {
        res.redirect("/thanks")
        return
    }
    res.render("petition", { validInfo: true });
})

//////////// REGISTER PAGE ////////
app.get("/register", (req, res) => {
    res.render("register")
})


//////////// LOGIN PAGE ////////

app.get("/login", (req, res) => {
        res.render("login")
    })
    //////////// SIGNATURE PAGE ////////
app.get("/signature", (req, res) => {
    res.render("signature")
})

//////////// THANKS PAGE ////////
app.get("/thanks", (req, res) => {
    // IF THERE IS A COOKIE RENDER /THANKS
    if (req.session.signID) {
        // store the current id in a variable
        const currentId = req.session.signID;
        // pass currentId to getSigById fctn  
        db.getSigById(currentId).then(({ rows }) => {
            //deconstruct names and sig from the row
            let { firstname, lastname, signature } = rows[0]
                //count all id's from signitures giving back the number of rows
            db.getSigCount().then(({ rows }) => {
                const numberOfSigners = rows[0].count
                    // render the "thanks" page and
                    // pass object with 4 properties to it, the handlebars now have access to them 
                res.render("thanks", { numberOfSigners, firstname, lastname, signature })
                    // catch possible error
            }).catch((error) => {
                console.log(error)
                    //if error then send status 500 to the browser
                res.sendStatus(500);
            })

        }).catch((error) => {
            console.log(error);
            res.sendStatus(500);
        })

        // IF THERE IS NO COOKIE, REDIRECT TO /
    } else {
        res.redirect("/");
    }
})

//////////// SIGNERS PAGE ///////
app.get("/signers", (req, res) => {
    // if there are cookies 
    if (req.session.signID) {
        // get the infos of the signitures table  
        db.getSign().then(({ rows }) => {
            // pass the all rows as argument to the signers handlebar,
            // here we cann loop through all rows and display only the names 
            res.render("signers", { rows })
        }).catch((error) => {
            console.log(error)
            res.sendStatus(500);
        });
        // if no cookies then redirect to "/"
    } else {
        res.redirect("/")
    }
})


//////////////// POST REQUEST /////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////
app.post("/login", function(req, res) {
    console.log("POST ON LOGIN📝")
})


app.post('/register', function(req, res) {
    console.log("POST ON REGISTER 📝")

    // decunstruct names and signature from the req.body
    let { firstName, lastName, signature } = req.body;
    // if the form is not filled correctly, render petition with false
    if (validInfo(firstName, lastName, signature) == false) {
        res.render("petition", { validInfo: false })


    } else {
        // call addSign with passed arguments
        db.addSign(firstName, lastName, signature)
            .then(({ rows }) => {
                // store the id in a cookie
                req.session.signID = rows[0].id
                console.log("⬆️ Upload Complete!!")
                res.redirect("/thanks")
            })
            .catch(error => {
                console.log("error", error);
                res.sendStatus(500);
            });

    }

    validInfo(firstName, lastName, signature)
});


///// VALID IF FORM HAS BEEN FILLED CORRECTLY////////

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

////////////  START SERVER  //////////////             
app.listen(8080, () => console.log("Listening ✅"));