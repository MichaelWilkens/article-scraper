var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require('axios');
var cheerio = require('cheerio');

var PORT = 3000;

// Require all models
var db = require("./models");

// Initialize Express
var app = express();

//handlebars view engine
var exphbs = require("express-handlebars");
app.engine(
    "handlebars",
    exphbs({
        defaultLayout: "main"
    })
);
app.set("view engine", "handlebars");

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public static folder
app.use(express.static("public"));

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/F1articles";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });


// Routes
app.get('/', (req, res) => {
    res.render("index")
})


app.get('/scrape', function (req, res) {
    var allArticles = [];
    axios.get('https://www.formula1.com/en/latest/all.html').then(function (response) {

        //load HTML into cheerio variable
        var $ = cheerio.load(response.data);
        $('.f1-latest-listing--grid-item').each(function (i, element) {

            //grab photo, link, title and time from article and save in an object
            var result = {}
            result.link = 'http://www.formula1.com/' + ($(this).children("a").attr('href'));
            result.photo = $(this).children().children().children().children('img').attr('src');
            result.title = $(this).children('a').children().children('p:nth-child(2)').text()

            allArticles.push(result)
        })
        res.render("scrapedArticles", { allArticles: allArticles })
    })
})

app.post('/savearticle', (req, res) => {
    //send scraped article object to the database
    db.Article.create(req.body).then(function (dbArticle) {
        console.log("Article added to database")
    }).catch(err => { console.log(err) });
})

app.get('/articles', (req,res)=>{
    db.Article.find({}).then(dbArticles=>res.render('favorites', {dbArticles:dbArticles}))
})

app.post('/deletearticle/:id', (req,res)=>{
    db.Article.deleteOne({_id:req.params.id}).then(response=>{res.json(response)})
})

app.get('/notes/:id', (req,res)=>{
    db.Note.find({_id:req.params.id}).then(response=>console.log(response))
})

app.post('/notes/:id', (req, res)=>{
    db.Note.create(req.body).then(response=>{
        return db.Article.findOneAndUpdate({_id:req.params.id}, {$push: {note:response._id}}, {new:true})
    }).then(responsearticle => res.json(responsearticle))
    .catch(err=>console.log(err))
})

app.put('/notes/:id', (req, res)=>{
    console.log('---------------------------')
    console.log(req.body.inputedNote)
    db.Note.findOneAndUpdate({_id:req.params.id}, {text:req.body.inputedNote}).then(response=>{console.log(response)})
})

app.get('/articlenotes/:id', (req, res)=>{
    db.Article.findOne({_id:req.params.id}).populate('note').then(articlenote=> {res.json(articlenote)})
})

app.post('/deletenote/:id', (req, res)=>{
    db.Note.deleteOne({_id:req.params.id}).then(response=>{res.json(response)})
})



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////




// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});
