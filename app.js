const express = require('express');
let app = express();

const session = require("express-session");
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { cookieSecret } = require('./credentials.js');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const { searchShows, getShowById } = require('./lib/searchService');

require("./models/db");
const User = require('./models/models').User;
const Favorite = require ('./models/models').Favorite;

passport.use(new LocalStrategy({ usernameField: 'email' }, User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(session({
    secret: cookieSecret,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// set up handlebars view engine
let handlebars = require('express-handlebars')
    .create({ defaultLayout:'main' });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', process.env.PORT || 3000);
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', async function(req, res) {
    let favorites = [];
    let email = null;
    if (req.user) {
        email = req.user.email;
        const userFavorites = await Favorite.find({ userId: req.user._id });
        const showIds = userFavorites.map(favorite => favorite.showId);
        const favoriteShows = [];
        for (const showId of showIds) {
            const showData = await getShowById(showId);
            if (showData) {
                const premiereDate = showData.premiered ? new Date(showData.premiered) : null;
                const endDate = showData.ended ? new Date(showData.ended) : null;
                showData.years = premiereDate ? premiereDate.getFullYear() : '';
                showData.years += endDate ? ' - ' + endDate.getFullYear() : '';
                favoriteShows.push(showData);
            } else {
                console.error('Failed to fetch show data for show ID:', showId);
            }
        }
        favorites = favoriteShows;
    }
    res.render('home', {
        user: req.user,
        email: email,
        favorites: favorites
    });
});

app.post('/', async function(req, res) {
    if(results) {
        res.render('home', {
            results: results,
            searchTerm: req.body.searchTerm, 
        });
    } else {
        res.render('error');
    }
});

app.get('/login', function(req, res) {
    if (req.user) {
        res.redirect('/');
    } else {
        res.render('login', { message: req.flash('error') });
    }
});

app.post('/login', passport.authenticate('local', {
	successRedirect: '/',
	successFlash: 'Welcome!',
	failureRedirect: '/login',
	failureFlash: 'Invalid email or password.',
}));

app.get('/logout', function(req, res){
    req.logout(function(err) {
        if (err) {
            console.log(err);
            return next(err);
        }
        res.redirect('/login');
    });
});
``
app.get('/register', function(req, res) {
	if (req.user) {
        res.redirect('/');
    } else {
        res.render('register', { message: req.flash('error') });
    }
});

app.post('/register', async function(req, res) {
	try {
	  const { email, password, confirmPassword } = req.body;
  
	  if (!email || !password || !confirmPassword) {
		req.flash('error', 'All fields are required.');
		return res.redirect('/login');
	  }
  
	  if (password !== confirmPassword) {
		req.flash('error', 'Passwords do not match.');
		return res.redirect('/login');
	  }
  
	  const existingUser = await User.findOne({ email: email });
	  if (existingUser) {
		req.flash('error', 'An account with this email already exists.');
		return res.redirect('/login');
	  }
  
	  const newUser = new User({ email: email });
	  const registeredUser = await User.register(newUser, password);
	  req.login(registeredUser, err => {
		if (err) {
		  console.error(err);
		  req.flash('error', 'Registration failed. Please try again.');
		  return res.redirect('/login');
		}
		req.flash('success', 'Registration successful. You are now logged in.');
		res.redirect('/');
	  });
	} catch (error) {
	  console.error(error);
	  req.flash('error', 'Registration failed. Please try again.');
	  res.redirect('/login');
	}
});
  

app.get('/search', async function(req, res) {
    const searchTerm = req.query.searchTerm;
    req.session.searchTerm = searchTerm;
    const searchResults = await searchShows(searchTerm);
    let favoriteShowIds = [];
  
    if (req.user) {
        const userFavorites = await Favorite.find({ userId: req.user._id });
        favoriteShowIds = userFavorites.map(favorite => favorite.showId.toString());
    }

    searchResults.forEach(result => {
        const show = result.show;
        const premiereDate = show.premiered ? new Date(show.premiered) : null;
        const endDate = show.ended ? new Date(show.ended) : null;
    
        show.years = premiereDate ? premiereDate.getFullYear() : '';
        show.years += endDate ? ' - ' + endDate.getFullYear() : '';
    });
  
    const resultsWithFavorites = searchResults.map(show => {
        return {
            ...show,
            isFavorite: favoriteShowIds.includes(show.show.id.toString())
        };
    });
  
    res.render('searchResults', {
        results: resultsWithFavorites,
        searchTerm,
        user: req.user
    });
});

  
app.post('/favorites/add/:showId', async function(req, res) {
	if (!req.user) return res.redirect('/login');
	try {
	  const existingFavorite = await Favorite.findOne({
		showId: req.params.showId,
		userId: req.user._id
	  });
  
	  if (!existingFavorite) {
		const favorite = new Favorite({
		  showId: req.params.showId,
		  userId: req.user._id
		});
		await favorite.save();
	  }
  
	  res.redirect('/search?searchTerm=' + req.session.searchTerm);
	} catch (error) {
	  console.error(error);
	  res.redirect('/search?searchTerm=' + req.session.searchTerm);
	}
});
	
app.post('/favorites/remove/:showId', async function(req, res) {
	if (!req.user) return res.redirect('/login');
	try {
	  await Favorite.findOneAndDelete({
		showId: req.params.showId,
		userId: req.user._id
	  });
	  res.redirect('/search?searchTerm=' + req.session.searchTerm);
	} catch (error) {
		console.error(error);
		res.redirect('/search?searchTerm=' + req.session.searchTerm);
	}
});
  
// 404 catch-all handler (middleware)
app.use(function(req, res, next){
	res.status(404);
	res.render('404');
});

// 500 error handler (middleware)
app.use(function(err, req, res, next){
    console.error(err.stack);
    res.status(500);
    res.render('500');
});

app.listen(app.get('port'), function(){
  console.log( 'Express started on http://localhost:' +
    app.get('port') + '; press Ctrl-C to terminate.' );
});
