import './config.mjs';
import express from 'express';
import session from 'express-session'; 
const app = express();
import './db.mjs';
import mongoose from 'mongoose';
const Review = mongoose.model('Review');


// set up express static
import url from 'url';
import path from 'path';
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, 'public')));

// configure templating to hbs
app.set('view engine', 'hbs');


// body parser (req.body)
app.use(express.urlencoded({ extended: false }));

// Initialize session middleware
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
  }));
  // Middleware to count page visits
app.use((req, res, next) => {
    // If the session doesn't have a counter, initialize it
    if(!req.session.pageCount) {
      req.session.pageCount = 0;
    }
    // Increment the counter
    req.session.pageCount++;
  
    // Make the counter available to all templates
    res.locals.count = req.session.pageCount;
  
    next();
  });


app.get('/', (req, res) => {
  let query = {};

  if (req.query.semester && req.query.semester !== 'All') {
      query.semester = req.query.semester;
  }

  if (req.query.year) {
      query.year = req.query.year;
  }

  if (req.query.professor) {
      query.professor = new RegExp(req.query.professor, 'i'); // Case-insensitive search
  }

  Review.find(query)
      .then(reviews => {
          res.render('reviewsDisplay', { reviews });
      })
      .catch(err => {
          console.error("Failed to retrieve reviews:", err);
          res.status(500).send("Error occurred while fetching reviews.");
      });
});
app.get('/reviews/add', (req, res) => {
    res.render('addReview');  // This will render addReview.hbs
});
app.post('/reviews/add', (req, res) => {
    const { courseNumber, courseName, semester, year, professor, review } = req.body;

    const newReview = new Review({
        courseNumber,
        courseName,
        semester,
        year,
        professor,
        review,
        sessionId: req.session.id
    });

    newReview.save()
        .then(() => {
            res.redirect('/'); // Redirect to the home page
        })
        .catch(err => {
            console.error("Failed to save review:", err);
            res.status(500).send("Error occurred while saving review.");
        });
});
app.get('/reviews/mine', (req, res) => {
    Review.find({ sessionId: req.session.id })
        .then(reviews => {
            res.render('reviewsMine', { reviews });  
        })
        .catch(err => {
            console.error("Failed to retrieve reviews:", err);
            res.status(500).send("Error occurred while fetching reviews.");
        });
});


app.listen(process.env.PORT || 3000);
