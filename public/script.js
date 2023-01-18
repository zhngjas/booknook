// Import the Book Module
import Book from './Book.js';

// function to get data from the Books API
const getTitle = (isbn) => {
  let endpointURL = `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`
  const options = { method: 'GET' };
  console.log(endpointURL)
  return fetch(endpointURL, options)
    .then(response => response.json())
    .then(response => {

      console.log(response.items[0])
      
      let imageThumb = (response.items[0].volumeInfo.imageLinks) ? response.items[0].volumeInfo.imageLinks.thumbnail : null;
  
      // to avoid browser warnings you might like to replace  'http://' with 'https://' in the imageThumb here
      // see also: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace
      
      return {
        "title": response.items[0].volumeInfo.title,
        "author": response.items[0].volumeInfo.authors[0],
        "image": imageThumb,
        "isbn": response.items[0].volumeInfo.industryIdentifiers[0].identifier
      }
    })
    .catch(err => console.error(err));
}

const getBooks = (sort = 'name') => {
  console.log(sort)
  $('#bookList').style.background = '/load.svg'
  // fetch and render books.
  fetch('/api/books?sort=' + sort, { "method": "GET" })
    .then(response => response.json())
    .then(response => {
      $('#bookList').style.background = 'none'
      $('#bookList').innerHTML = ''
      response.forEach(data => {
        const book = new Book(data)
        book.render()
      })
    })
    .catch(error => console.log(error))
}

getBooks()
// adding toggle functionality to the completed checkbox in the form
// when checked, the datepicker is visible, and vise versa
completed.addEventListener('change', event => {
  completed.checked ? dateContainer.style.display = 'flex' :
    dateContainer.style.display = 'none';
})

// Listen for clicks on the "Add a Book" button
addButton.addEventListener('click', event => {
  bookForm.reset()
  isbnForm.reset()
  imgPreview.innerHTML = ""
  bookTitle.innerText = ""
  authorName.innerText = ""
  isbnForm.style.display = 'flex'
  $('body').scrollIntoView()
  // when adding a new entry, only the form is visible on the page
  // all book entries are hidden
  mainContent.style.display = 'none'
})

// in addition to the default reset behaviour for form elements, 
// also reset the _id, image, heading, and visibility
document.querySelectorAll('.forms').forEach(item => {
  item.addEventListener('reset', (e) => {
    bookForm.elements['_id'].value = '';
    bookForm.elements['fileName'].value = ''
    $('#bookForm h2').innerHTML = `Add a Book`
    bookForm.style.display = 'none';
    isbnForm.style.display = 'none';
    // make main page/ list of book entries visible again
    mainContent.style.display = 'flex';
    console.log("88 bookForm")
  })
})

// display book form page when isbn is submitted
isbnForm.addEventListener('submit', async (e) => {
  // prevents page from refreshing when the submit button is pressed
  event.preventDefault()
  event.stopPropagation()
  bookForm.style.display = 'flex';
  isbnForm.style.display = 'none';
  let isbnValue = document.querySelector('#isbn').value;
  console.log(isbnValue);
  const results = await getTitle(isbnValue);
  console.log(results);
  // book information is populated from the API
  bookTitle.innerText = results.title;
  authorName.innerText = results.author;
  let displayImage = '/photo.svg'
  if (results.image != null) {
    displayImage = results.image
  }
  imgPreview.innerHTML = `<img class="image" src=${displayImage}>`

  bookForm.elements['title'].value = results.title;
  bookForm.elements['author'].value = results.author;
  bookForm.elements['fileName'].value = results.image;
})

// define a set of handler functions 
// to respond to various events
const formEvents = {
  // when the form is submitted, save the form  
  submit: async (event) => {
    const formData = new FormData(event.target)
    console.log("formData " + formData)
    const json = Object.fromEntries(formData)
    const book = new Book(json)
    book.save()
    event.target.reset()
    // when the form is open, all books and main page elements are hidden
    // when the form is submitted, the books and main page elements are revealed again
    // loop through all the books to remove the hide class and make them visible
    // the hide class holds display: none
    for (var i = 0; i < bookList.getElementsByClassName("book").length; i++) {
      bookList.getElementsByClassName("book")[i].classList.remove('hide');
    }
    addButton.style.display = 'block'
    console.log("118 submit")
  },
  // add a visual cue to indicate drag and drop is ready
  dragenter: (event) => { event.currentTarget.className = "ready" },
  dragover: (event) => { event.currentTarget.className = "ready" },
  // if a drag and drop ends, hide the visual cue styling
  dragleave: (event) => { event.currentTarget.className = "" },
  drop: (event) => {
    event.currentTarget.className = ""
    // when a file is dropped onto the form, upload it.
    upload(event.dataTransfer.files[0])
  }
}

// iterate through all the above event handlers 
// and activate them on the image form
for (const [eventName, eventHandler] of Object.entries(formEvents)) {
  bookForm.addEventListener(eventName, (event) => {
    // prevent default event handlers from running
    event.preventDefault()
    event.stopPropagation()
  })
  // listen for the event and attach the handler to it.
  bookForm.addEventListener(eventName, eventHandler)
}
