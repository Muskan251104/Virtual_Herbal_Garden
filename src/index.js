const express = require("express")
const path = require("path")
const app = express()
const session = require('express-session');
app.use(session({
  secret: 'your-secret-key', // Keep this key secure in an environment variable in production
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));

const router = express.Router();
// const hbs = require("hbs")
const { LogInCollection, Movie, Plant ,User} = require('./mongo');
const { error } = require("console");
const port = process.env.PORT || 3000
app.use(express.json())

app.use(express.urlencoded({ extended: false }))

const tempelatePath = path.join(__dirname, '../tempelates')
const publicPath = path.join(__dirname, '../public')
console.log(publicPath);

app.set('view engine', 'hbs')
app.set('views', tempelatePath)
app.use(express.static(publicPath))


// hbs.registerPartials(partialPath)


app.get('/signup', (req, res) => {
    res.render('signup')
})
app.get('/', (req, res) => {
    res.render('login')
})
app.get('/login', (req, res) => {
  res.render('login');
});



// app.get('/home', (req, res) => {
//     res.render('home')
// })

app.post('/signup', async (req, res) => {
    try {
        // Check if the username already exists in the database
        const usernameCheck = await LogInCollection.findOne({ name: req.body.name });

        if (usernameCheck) {
            // If the username is found, send an error message
            return res.render('signup', { errorMessage: "Username already taken, please choose another." });
        }

        // // Check if the email already exists in the database
        // const emailCheck = await LogInCollection.findOne({ email: req.body.email });

        // if (emailCheck) {
        //     // If the email is found, send an error message
        //     return res.render('signup', { errorMessage: "Email already registered, please use another." });
        // }

        // If username and email are unique, save the new user
        const data = {
            name: req.body.name,  // Username to be unique
            // email: req.body.email,
            password: req.body.password,
            bookmarks: [] 
        };

        await LogInCollection.insertMany([data]);

        // Render home page after successful signup
        return res.status(201).render("home", { naming: req.body.name });
        
    } catch (err) {
      
        return res.render("signup", { errorMessage: "Something went wrong, please try again." });
    }
});



app.post('/login', async (req, res) => {
  try {
      const user = await LogInCollection.findOne({ name: req.body.name }); // Corrected field name

      if (user && user.password === req.body.password) { // Make sure user is found before checking password
          req.session.userId = user._id; // Store userId in session
          return res.redirect('/home');
      } else {
          res.render("login", { errorMessage: "Incorrect password or username. Please try again." });
      }
  } catch (e) {
      console.error('Error logging in:', e); // Log the error for debugging
      res.render("login", { errorMessage: "User not found or wrong details." });
  }
});


// app.get('/plants', async (req, res) => {
//     try {
//         const movies = await Movie.find({});
//         res.render('plants', {
//             moviesList: movies
//         });
//     } catch (err) {
//         res.status(500).send("Error fetching movies");
//     }
// });

//copy paste


app.get('/plants/:plantName', async (req, res) => {
    try {
      const plantName = req.params.plantName;
      console.log('Searching for plant:', plantName); // Debug log
      const baseUrl = `${req.protocol}://${req.get('host')}/plants/${plantName}`; // Generate the full URL
  
      const plant = await Plant.findOne({ name: plantName });
      
      if (!plant) {
        console.log('Plant not found in database'); // Debug log
        return res.status(404).send("Plant not found");
      }
      
      console.log('Plant found:', plant); // Debug log
      res.render('plants', { plant });
       
    } catch (err) {
      console.error('Error fetching plant details:', err); // Debug log
      res.status(500).send("Error fetching plant details");
    }
  });


  app.get('/debug/plants', async (req, res) => {
    try {
      const plants = await Plant.find({}, 'name');
      res.json(plants);
    } catch (err) {
      res.status(500).json({ error: 'Error fetching plants' });
    }
  });


  // Add a search route
app.get('/search', async (req, res) => {
    try {
      const searchQuery = req.query.query;
  
      // Search for plants in the database by name (case-insensitive)
      const searchResults = await Plant.find({
        name: { $regex: new RegExp(searchQuery, 'i') }  // 'i' makes it case-insensitive
      });
  
      // Render the home template with search results
      res.render('home', { searchResults });
    } catch (err) {
      console.error('Error searching for plants:', err);
      res.status(500).send("Error searching for plants");
    }
  });
  


  // Add this route for category-based filtering
app.get('/category/:categoryName', async (req, res) => {
  try {
      const categoryName = req.params.categoryName;

      // Fetch plants that belong to the selected category
      const plants = await Plant.find({ category: categoryName });

      if (!plants || plants.length === 0) {
          return res.status(404).render('home', { errorMessage: `No plants found for the category ${categoryName}` });
      }

      // Render the home page with filtered plant results
      res.render('home', { searchResultss: plants });
  } catch (err) {
      console.error('Error fetching plants by category:', err);
      res.status(500).send("Error fetching plants by category");
  }
});



function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
}

app.post('/notes', async (req, res) => {
  console.log(req.body);
  console.log('User ID:', req.session.userId);  // Log userId
  console.log('Note Text:', req.body.noteText); 
  const userId = req.session.userId;
  const noteText = req.body.noteText; // Extracting note text from request body

  // Check if user is logged in
  if (!userId) {
    return res.status(401).json({ success: false, message: "You need to log in to save notes." });
  }

  // Check if noteText is provided and not empty
  if (!noteText || noteText.trim() === '') {
    return res.status(400).json({ success: false, message: "Note text cannot be empty." });
  }

  try {
    const user = await LogInCollection.findById(userId);

    // Create a new note object

    const newNote = { text: noteText.trim() };
    console.log('New Note:', newNote); 
    user.notes.push(newNote); // Push the new note to user's notes array

    await user.save();

    
    // Return success response
    
    
  } catch (error) {
    console.error('Error saving note:', error);
    res.status(500).json({ success: false, message: "Error saving note." });
  }
});



app.get('/notes', async (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.redirect('/login');
  }

  try {
    // Find the logged-in user and get their notes
    const user = await LogInCollection.findById(userId);

    // Render the notes.hbs template with the user's notes
    res.render('notes', { notes: user.notes });
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).send("Error fetching notes.");
  }
});


app.post('/delete-note/:noteId', async (req, res) => {
  const userId = req.session.userId;
  const noteId = req.params.noteId;

  if (!userId) {
    return res.status(401).send("You need to log in to delete notes.");
  }

  try {
    // Find the user and remove the note with the matching ID
    await LogInCollection.updateOne(
      { _id: userId },
      { $pull: { notes: { _id: noteId } } }
    );

    res.redirect('/notes');
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).send("Error deleting note.");
  }
});

// ===========================TRY NEW
// app.get('/home', async (req, res) => {
  // console.log('Home route accessed');
  // try {
      // Fetch all plants from the database
      // const plants = await Plant.find({});
      // 
      // Pass the plants data to home.hbs when rendering
      // res.render('home', { plantsList: plants });
  // } catch (err) {
      // console.error('Error fetching plants:', err);
      // res.status(500).send("Error fetching plants from the database");
  // }
// });
// 

app.get('/home', async (req, res) => {
  console.log('Home route accessed');
  try {
    const plants = await Plant.find({});
    let bookmarkedPlantIds = [];
    
    if (req.session.userId) {
      const user = await LogInCollection.findById(req.session.userId);
      bookmarkedPlantIds = user.bookmarks.map(id => id.toString());
    }

    const plantsWithBookmarkInfo = plants.map(plant => ({
      ...plant.toObject(),
      isBookmarked: bookmarkedPlantIds.includes(plant._id.toString())
    }));

    res.render('home', { plantsList: plantsWithBookmarkInfo });
  } catch (err) {
    console.error('Error fetching plants:', err);
    res.status(500).send("Error fetching plants from the database");
  }
});
// ===============================TRY ENDED


// ============================TRY NEW
// Toggle bookmark
app.post('/toggle-bookmark', async (req, res) => {
  const userId = req.session.userId;
  const plantId = req.body.plantId;

  if (!userId) {
    return res.status(401).json({ success: false, message: "You need to log in to bookmark plants." });
  }

  if (!plantId) {
    return res.status(400).json({ success: false, message: "Plant ID is required." });
  }

  try {
    const user = await LogInCollection.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const bookmarkIndex = user.bookmarks.indexOf(plantId);

    if (bookmarkIndex > -1) {
      // Remove bookmark
      user.bookmarks.splice(bookmarkIndex, 1);
    } else {
      // Add bookmark
      user.bookmarks.push(plantId);
    }

    await user.save();
    res.json({ success: true, message: "Bookmark toggled successfully." });
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    res.status(500).json({ success: false, message: "Error toggling bookmark: " + error.message });
  }
});

// View bookmarks
app.get('/bookmarks', async (req, res) => {
  const userId = req.session.userId;

  if (!userId) {
    return res.redirect('/login');
  }

  try {
    const user = await LogInCollection.findById(userId).populate('bookmarks');
    res.render('bookmarks', { bookmarkedPlants: user.bookmarks });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    res.status(500).send("Error fetching bookmarks.");
  }
});


// ============================================TRY END
app.listen(3000, () => {
    console.log('port connected');
})