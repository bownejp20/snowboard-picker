module.exports = function (app, passport, db, url) {

  // normal routes ===============================================================

  // show the home page (will also have our login links)
  app.get('/', function (req, res) {
    res.render('index.ejs')
  })

  // PROFILE SECTION =========================
  app.get('/profile', isLoggedIn, function (req, res) {
      res.render('profile.ejs', {
        user: req.user,
    })
  });


  app.get('/snowboards', function (req, res) {
    console.log(req.url)
    if (!Object.keys(req.query).includes('level') || !req.query.level) {
      res.send('404 your fault!')
      return
    }//object.keys checks all the keys in an object and puts them into an array
    const { level } = req.query // query represent the full query string that we destructured 
    console.log(level)
    const snowboardObject = {
      beginner: {
        female: '/img/womenBeginnerBoard.jpg',
        male: '/img/mensBeginBoard.jpg'
      },
      intermediate: {
        female: '/img/womenInterBoard.jpg',
        male: '/img/menInterBoard.jpg'
      },
      advanced: {
        female: '/img/womenAdvBoard.jpg',
        male: '/img/mensAdvBoard.jpg'
      }
    }
    db.collection('messages').find().toArray((err, result) => {
      if (err) return console.log(err)
      res.render('snowboardPics.ejs', {male:snowboardObject[level].male, female:snowboardObject[level].female, messages:result, user:req.user})//male is a key thats getting merged with snowbaord.ejs this will replace the male from snowboardpics.ejs with the picture, level is in brackets because it can be more than one thing (its dynamic), if it was one thing you could have just used .notation
    })
    



  });



  // LOGOUT ==============================
  app.get('/logout', function (req, res) {
    req.logout(() => {
      console.log('User has logged out!')
    });
    res.redirect('/');
  });

  // message board routes ===============================================================

  app.post('/messages', (req, res) => {
    console.log(url.parse(req.headers.referer))//paring the url so we can break it down into the diff parts that make it up, referer tells you the page that took you to the next page
    const {pathname, search} = url.parse(req.headers.referer)//deconstructed,looked it up on google
    console.log(pathname + search)
    db.collection('messages').save({ name: req.body.name, msg: req.body.msg, thumbUp: 0, thumbDown: 0 }, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect(pathname + search)
    })
  })

  app.put('/messages', (req, res) => {
    db.collection('messages')
      .findOneAndUpdate({ name: req.body.name, msg: req.body.msg }, {
        $inc: {
          thumbUp: 1
        }
      }, {
        sort: { _id: -1 },
        upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
  })

  app.put('/messages/thumbDown', (req, res) => {
    db.collection('messages')
      .findOneAndUpdate({ name: req.body.name, msg: req.body.msg }, {
        $inc: {
          thumbDown: - 1
        }
      }, {
        sort: { _id: -1 },
        upsert: true  //might be a bug later on that leon leaves and you need to fix
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
  })

  app.delete('/messages', (req, res) => {
    db.collection('messages').findOneAndDelete({ name: req.body.name, msg: req.body.msg }, (err, result) => {
      if (err) return res.send(500, err)
      res.send('Message deleted!')
    })
  })

  // =============================================================================
  // AUTHENTICATE (FIRST LOGIN) ==================================================
  // =============================================================================

  // locally --------------------------------
  // LOGIN ===============================
  // show the login form
  app.get('/login', function (req, res) {
    res.render('login.ejs', { message: req.flash('loginMessage') });
  });

  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // SIGNUP =================================
  // show the signup form
  app.get('/signup', function (req, res) {
    res.render('signup.ejs', { message: req.flash('signupMessage') });
  });

  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // =============================================================================
  // UNLINK ACCOUNTS =============================================================
  // =============================================================================
  // used to unlink accounts. for social accounts, just remove the token
  // for local account, remove email and password
  // user account will stay active in case they want to reconnect in the future

  // local -----------------------------------
  app.get('/unlink/local', isLoggedIn, function (req, res) {
    var user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save(function (err) {
      res.redirect('/profile');
    });
  });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();

  res.redirect('/');
}
