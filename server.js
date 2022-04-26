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
const { request } = require('express');
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
// GET REGUESTS  /////////////////////////////////////////////////////////////    
///////////////////////////////////////////////////////////////////////////////////////////
// REDIRECT TO PETITION PAGE IF / GET REQUESTED    
app.get("/", (req, res) => {
    res.redirect("/register")
})

//////////// PETITION PAGE ////////
app.get('/petition', (req, res) => {
    // IF THERE IS ALREADY A COOKIE REDIRECT DIRECTRLY TO /THANKS
    if (!req.session.userId) {
        console.log("NO 🍪 REDIRECT RO REGISTER")
        res.redirect("/register")
        return
    }
    if (req.session.signID) {
        res.redirect("/thanks")
        return
    }

    res.render("petition", { validSig: true });
})

// GET ////////// REGISTER PAGE ////////
app.get("/register", (req, res) => {
    res.render("register", { validInfo: !req.query.error })
})


// GET ////////// LOGIN PAGE ////////
app.get("/login", (req, res) => {

    res.render("login")
})

// GET ////////// SIGNATURE PAGE ////////
app.get("/signature", (req, res) => {
    if (!req.session.userId) {
        console.log("NO 🍪 REDIRECT TO REGISTER")
        res.redirect("/register")
        return
    }
    res.render("signature")
})

// GET ////////// THANKS PAGE ////////
app.get("/thanks", (req, res) => {
    // IF THERE IS A COOKIE RENDER /THANKS
    if (!req.session.userId) {
        console.log("NO 🍪 REDIRECT TO REGISTER")
        res.redirect("/register")
        return
    }
    if (req.session.userId) {
        console.log("THANKS HAS BEEN REQUESTED ✅")

        // store the current id in a variable
        const currentId = req.session.userId;
        // pass currentId to getSigById fctn  

        db.getSigById(currentId).then(({ rows }) => {
            console.log(rows);

            let { firstname, lastname, signature } = rows[0]
                //count all id's from signitures giving back the number of rows
            db.getSigCount().then(({ rows }) => {
                const numberOfSigners = rows[0].count

                res.render("thanks", { firstname, lastname, signature, numberOfSigners })
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
        // ❌❌❌❌❌
        console.log("THANKS HAS BEEN REQUESTED ❌❌❌❌❌")

        res.render("thanks");
    }
})

// GET ////////// SIGNERS PAGE ///////
app.get("/signers", (req, res) => {
    // if there are cookies 
    console.log("SIGNERS GOT REQUESTED")
    if (req.session.userId) {
        console.log("COOKIES ARE THERE ✅ 🍪")
            // get the infos of the signitures table  
        db.getSign().then(({ rows }) => {
            // console.log("ROWS ➡", rows)
            // pass the all rows as argument to the signers handlebar,
            // here we cann loop through all rows and display only the names 
            res.render("signers", { rows })
        }).catch((error) => {
            console.log(error)
            res.sendStatus(500);
        });
        // if no cookies then redirect to "/"
    } else {
        console.log("NO COOKIES DETECTED ")
        res.redirect("/")
    }
})

// GET ////////// SIGNERS/:CITY PAGE ///////
app.get("/signers/:city", function(req, res) {
    console.log("PARAMS", req.params);
    db.getSignersByCity(req.params).then((results) => {
        console.log(results.rows);
        res.render("city", {
            city: results.rows[0].city,
            user: results.rows
        });
    })

})

// GET ////////// PROFILE PAGE ///////
app.get("/profile", function(req, res) {
    if (!req.session.userId) {
        console.log("NO 🍪 REDIRECT TO REGISTER")
        res.redirect("/register")
        return
    }
    console.log("Profil Page has been requested ")
    res.render("profile")
})

// GET EDIT PAGE ///////////////////////////
app.get("/profile/edit", function(req, res) {
    console.log("USER ID #️⃣", req.session.userId);
    db.getUserProfileById(req.session.userId).then(({ rows }) => {
        console.log("ROWS RESULTS", rows);
        res.render("edit", {
            firstname: rows[0].first_name,
            lastname: rows[0].last_name,
            city: rows[0].city,
            url: rows[0].url,
            age: rows[0].age,
            email: rows[0].email,
        });
    })
})



//////////////// POST REQUEST /////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////

//////////////// POST ON LOGIN //////////////////////

app.post("/login", function(req, res) {
    console.log("POST ON LOGIN📝")
    let { email, password } = req.body;
    if (email == "" || password == "") {
        console.log("EMAIL OR PW MISSING ❌")
        return false
    }

    db.login(req.body).then(user => {
        console.log("REQ BODY", req.body)

        if (!user) {
            console.log("CREDENTIALS WRONG OR USER DOESNT EXIST ❌")
            res.redirect("/login")
            return
        }
        console.log("LOGGED IN ✅")
        req.session.userId = user.id
            // req.session.userName = user
        let firstname = user.firstname
            /// ❌❌❌❌❌ CANT DISPLAY SIGNATURE
        res.redirect("/thanks")

        console.log("LOGGED USER", user);
    })

})

//POST ON REGISTER ////////////////////////////////
app.post('/register', function(req, res) {
    console.log("POST ON REGISTER 📝")
    let { firstname, lastname, email, password } = req.body;

    // if the form is not filled correctly, render petition with false
    if (validInfo(firstname, lastname, email, password) == false) {
        res.redirect("/register?error=true")
        return
    }
    // call createUser with passed arguments
    db.createUser(req.body)
        .then(({ rows }) => {
            // store the id in a cookie

            req.session.userId = rows[0].id
            console.log("⬆️ Upload Complete!!")
            console.log("ROWS", rows);

            res.redirect("/profile")
        })
        .catch((error) => {
            res.render("register")
            console.log("USER EXISTS ALREADY EXISTS ❌", error);

            // hint: error.constraint === "users_email_key"
            // is your friend!
            // res.sendStatus(500);
        });
});

// POST SIGNATURE PAGE ///////////////////////////////
app.post("/petition", function(req, res) {
    let { signature } = req.body;
    // ❌❌❌ NEED TO ADD THE SIGNITURE TO TABLE
    // console.log("📥", req.body)
    if (validSig(signature) == false) {
        console.log("SIGNATURE MISSING! ❌ 📝")
        res.redirect("/petition?error=true")
        return
    }
    console.log("SIGNED✅ 📝!!")
    db.addSign(req.session.userId, signature).then(() => {
        console.log("Signature has been added to Database")
    })
    res.render("thanks", { signature })
});


// POST ON PROFILE ////////////////////////////////////
app.post("/profile", function(req, res) {

    // ❌ ❌ ❌  VALIDATE IF HTTP IS ENTERED!!!!!
    // if (!req.body.url.startsWith("https")) {
    //     // res.sendStatus(500);
    //     res.render("profile", false)
    // }
    console.log("POST HAS BEEN MADE ON PROFILE 👨🏽‍⚕️")
    let { age, city, url } = req.body;
    const sessionId = req.session.userId
        // ADD EVEN IF NOT EVERYTHING IS FILLED 
    console.log("first: ", req.body, req.session.userId)
    db.newProfile(req.body, req.session.userId).then(() => {
        res.redirect("/petition")
    }).catch((error) => {
        console.log(error)
    })

})


//app.post()

app.post('/profile/edit', (req, res) =>

    {
        let { firstname, lastname, email, age, city, url } = req.body;
        console.log("Changed PROFIL Values 📝 :", firstname, lastname, email, age, city, url)

        Promise.all([
            db.updateUser(firstname, lastname, email, req.session.userId),
            db.updateUserProfile(age, url, city, req.session.userId)
        ]).then(() => {
            console.log("PROFILE IS UPDATED 📝 ✅")
            res.redirect("/profile");
        }).catch((error) => {
            console.log(error)
        })

    });



///// POST ON SIGNATURE/DELETE

app.post("/signature/delete", (req, res) => {
    console.log("DELETE SIGNATURE ")

    db.deleteSignature(req.session.userId).then(() => {
        console.log("DELETE SIGNATURE ")
    })
    res.redirect("/signature")
})

//////////////////// VALIDIDATION//////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////

///// VALID IF FORM HAS BEEN FILLED CORRECTLY////////
function validSig(signature) {
    // Check if All fields are filled 
    if (signature == "") {
        console.log("Error❌")
        return false
    } else {
        console.log("✅✅✅")
        return true
    }
}

function validInfo(firstname, lastname, email, password) {
    // Check if All fields are filled 
    if (firstname == "" || lastname == "" || email == "" || password == "") {
        console.log("Error❌")
        return false
    } else {
        console.log("✅✅✅")
        return true
    }
}



// function vadigLogin(email, password)








////////////  START SERVER  //////////////             
app.listen(8080, () => console.log("Listening ✅"));