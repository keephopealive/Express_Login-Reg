// Express
let express = require("express");
let app = express();
const path = require("path");


// #############################################################################
// Express-Session
// var cookieParser = require('cookie-parser');
// app.use(express.cookieParser('keyboard cat'));

var session = require('express-session');
var sessionStore = new session.MemoryStore;
app.use(session({
    cookie: { maxAge: 60000 },
    store: sessionStore,
    saveUninitialized: true,
    resave: 'true',
    secret: 'secret'
}));

// #############################################################################
// Express-Flash
var flash = require('express-flash');
app.use(flash());

// #############################################################################
// Static Folder
app.use(express.static(__dirname + '/public'));

// #############################################################################
// EJS
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs'); 

// #############################################################################
// Body Parser
let bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

// #############################################################################
// Morgan
let morgan = require("morgan");
app.use(morgan('dev'));

// #############################################################################
// Mongo Database
let mongoose = require("mongoose");

mongoose.connect('mongodb://localhost/login', {
    useMongoClient: true
});

let User = mongoose.model('User', {
    first_name: { type: String, required: [true, 'Please include your first name.'] },
    last_name: { type: String, required: [true, 'Please include your last name.'] },
    email: { type: String, required: [true, 'Please include your email.'] },
    password: { type: String, required: [true, 'Please include your password.'] }
})

// #############################################################################
// Routes
app.get("/", (req, res, next) => { 
    console.log("Server > GET '/'");
    return res.render('landing.ejs', { 
        loginErrors: req.flash('loginErrors') || '',
        registrationErrors: req.flash('registrationErrors') || '',
        registrationSuccess: req.flash('registrationSuccess') || '',
        formData: req.flash('formData')[0] || {first_name:'',last_name:'',email:'',password:''}
    });
})
app.get("/dashboard", (req, res, next) => { 
    return res.render('dashboard.ejs');
})

// Login 
app.post("/sessions", (req, res, next) => {
    console.log("Server > POST '/sessions' | req.body: ", req.body);
    
    User.findOne(req.body)
    .catch( err => {
        console.log(err);
        return res.redirect('/');
    })
    .then( user => {
        if(user) return res.redirect('/dashboard');
        req.flash('loginErrors', 'Invalid Credentials');
        return res.redirect('/');
    })

})
// Register
app.post("/users", (req, res, next) => {
    console.log("Server > POST '/users' | req.body: ", req.body);

    User.create(req.body, function(err, user){
        if(err){ 
            req.flash('registrationErrors', err.errors);
            req.flash('formData', req.body);
            return res.redirect('/')  
        } else {
            req.flash('registrationSuccess', 'Successful Registration - Please Login');
            return res.redirect('/')  
        }
        
    })


})
// #############################################################################
// Server Listening @ 1337
app.listen(1337, () => console.log("Server running at 1337")); 