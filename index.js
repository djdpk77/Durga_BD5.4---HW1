let express = require('express');
let { resolve } = require('path');
let { sequelize } = require('./lib/index');

let app = express();
let { author } = require('./models/author.model');
let { book } = require('./models/book.model');

app.use(express.json());

let authorData = [{ name: 'J.K Rowling', birthYear: 1965 }];

let bookData = [
  {
    title: "Harry Potter and the Philosopher's Stone",
    genre: 'Fantasy',
    publicationYear: 1997,
  },
  { title: 'A Game of Thrones', genre: 'Fantasy', publicationYear: 1996 },
  { title: 'The Hobbit', genre: 'Fantasy', publicationYear: 1937 },
];

app.get('/seed_db', async (req, res) => {
  try {
    await sequelize.sync({ force: true });

    await author.bulkCreate(authorData);

    await book.bulkCreate(bookData);

    res.status(200).json({ message: 'Database seeding successfull' });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error seeding the data', error: error.message });
  }
});

async function fetchAllAuthors() {
  let authors = await author.findAll();
  return { authors };
}

app.get('/authors', async (req, res) => {
  try {
    let authors = await fetchAllAuthors();

    res.status(200).json(authors);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error fetching the data', error: error.message });
  }
});

async function fetchAllBooks() {
  let books = await book.findAll();
  return { books };
}

app.get('/books', async (req, res) => {
  try {
    let books = await fetchAllBooks();

    res.status(200).json(books);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

//Function to add new author
async function addNewAuthor(newAuthor) {
  let response = await author.create(newAuthor);

  return { response };
}

//Endpoint 1: Create New Author
app.post('/authors/new', async (req, res) => {
  try {
    let newAuthor = req.body.newAuthor;
    let response = await addNewAuthor(newAuthor);

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

//Function to update author by id
async function updateAuthorById(id, updatedAuthorData) {
  let authorDetails = await author.findOne({ where: { id } });
  if (!authorDetails) {
    return {};
  }

  authorDetails.set(updatedAuthorData);
  let updatedAuthor = await authorDetails.save();

  return { message: 'Author updated successfully', updatedAuthor };
}

//Endpoint 2: Update Author by ID
app.post('/authors/update/:id', async (req, res) => {
  try {
    let updatedAuthorData = req.body;
    let id = parseInt(req.params.id);

    let response = await updateAuthorById(id, updatedAuthorData);

    if (!response.message) {
      return res.status(404).json({ message: 'Author not found' });
    }

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
