export default class Book {

  constructor(data) {
    // console.log("consutrctor")
    this.importJSON(data)
  }

  // Given the provided JSON data
  // copy all fields into this object
  importJSON = (data) => {
    // console.log("importJSON")
    for (const key in data) { this[key] = data[key] }
  }

  // Below we prepare a JSON object (e.g. for saving to a database)
  exportJSON = () => {
    // console.log("exportJSON")
    console.log("this author " + this.author)
    this.completed = (this.completed == "on") ? true : false;
    // build a JSON object that the database will respect.
    return {
      title: this.title,
      author: this.author,
      description: this.description,
      quotation: this.quotation,
      page: this.page,
      completed: this.completed,
      completedDate: this.completedDate,
      fileName: this.fileName
    }
  }

  // In this iteration the Create and Update are combined 
  // into a single "save" function
  save = () => {
    console.log("save")
    let method = "POST"
    let endpoint = '/api/book/'
    if (this._id) {
      method = "PUT"
      endpoint = '/api/book/' + this._id
    }
    fetch(endpoint, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.exportJSON())
    })
      .then(response => response.json())
      .then(data => {
        console.log(data)
        this.importJSON(data)
        // add the newly created book to the page.
        this.render()
        // auto scroll to the newly created book.
        $(`[id="${this._id}"]`).scrollIntoView()
      })
      .catch(error => console.log(error))
  }

  // delete this book from the database.
  // i.e. remove the data for this book from the database
  // by means of an API endpoint using the DELETE method
  delete = () => {
    fetch('/api/book/' + this._id, { "method": "DELETE" })
      .then(response => response.json())
      .then(response => {
        // also remove book from page layout
        this.remove()
      })
      .catch(error => console.log(error))
  }


  // Below we have a function that populates the HTML form with data
  edit = () => {
    const bookForm = $('#bookForm');
    bookForm.elements['_id'].value = this._id
    bookTitle.innerText = this.title
    authorName.innerText = this.author
    bookForm.elements['description'].value = this.description
    bookForm.elements['quotation'].value = this.quotation
    bookForm.elements['page'].value = this.page
    bookForm.elements['completed'].checked = this.completed
    // display the datepicker if the completed checkbox is checked
    if (bookForm.elements['completed'].checked == true) {
      dateContainer.style.display = 'flex'
      bookForm.elements['completedDate'].value = this.completedDate?.slice(0, 10)
    }
    let displayImage = '/photo.svg'
    if (this.fileName != "") {
      displayImage = this.fileName
    }
    imgPreview.innerHTML = `<img class="image" src=${displayImage}>`
    // set the heading for the form to match our intentions.
    $('#bookForm h2').innerHTML = `Edit ${this.title}`
    // make the form appear (normally it is set to display="none")
    bookForm.style.display = 'flex'
    // auto-scroll to the top of the page when editing a book.
    $('body').scrollIntoView();
    // hide other books when the edit form is open
    mainContent.style.display = 'none';

  }

  // function to return to the main page when the expanded view is open
  back = () => {
    console.log("back")
    // the book class styles the entry into a main page card
    // the book class hides detail content shown in the expanded view (ex. "thoughts", edit and delete buttons, etc.)
    // the bookDetail class reveals detail content that is hidden by the book class
    // this function swaps these classes for the main page state
    $(`[id="${this._id}"]`).classList.add('book')
    $(`[id="${this._id}"]`).classList.remove('bookDetail')
    // the button to add an entry is only displayed on the main page
    addButton.style.display = 'block';
    // the hide class holds display="none"
    // elements in the list of books with the book class are looped through in order to remove the hide class
    // all books are now displayed in the main page with the same styling
    for (var i = 0; i < bookList.getElementsByClassName("book").length; i++) {
      bookList.getElementsByClassName("book")[i].classList.remove('hide');
    }
  }

  // remove this book from the page
  remove = () => {
    $(`[id="${this._id}"]`).remove();
    console.log("104 remove");
    // when a book is removed, the user is taken back to the main page
    addButton.style.display = 'block';
    // the delete button is only accessible in the expanded detail view
    // when a book is deleted, all other books are still hidden
    // loop through all the books to remove the hide class, and make them visible again
    for (var i = 0; i < bookList.getElementsByClassName("book").length; i++) {
      bookList.getElementsByClassName("book")[i].classList.remove('hide');
      document.getElementsByClassName('book')[i].classList.remove('bookDetail')
    }
  }

  // function to display the expanded detail view
  detail = () => {
    console.log("detail")
    // the bookDetail class styles the book entry to be the expanded view
    // the book class styles the entry as a card, and is removed for the expanded state
    $(`[id="${this._id}"]`).classList.add('bookDetail')
    $(`[id="${this._id}"]`).classList.remove('book')
    // the button to add an entry is hidden in this state
    addButton.style.display = 'none'
    // to hide all the other book entries, loop through them and apply the hide class
    for (var i = 0; i < bookList.getElementsByClassName("book").length; i++) {
      bookList.getElementsByClassName("book")[i].classList.add('hide');
    }
  }


  // render the book's template on the page
  render = () => {
    // build an html template
    const template = this.template()
    // look for an already existing version on the page
    const existing = $(`[id="${this._id}"]`);
    // if a previous version exists, replace it
    if (existing) $('#bookList').replaceChild(template, existing)
    // if this is a new book, add it to the top of the page.
    else $('#bookList').prepend(template)
    // activate the edit button
    $(`[id="${this._id}"] button.edit`)
      .addEventListener('click', (event) => this.edit())
    // activate the delete button
    $(`[id="${this._id}"] button.delete`)
      .addEventListener('click', (event) => this.delete())
    // activate the back button
    $(`[id="${this._id}"] button.back`)
      .addEventListener('click', (event) => this.back())
    // activate state change on click/ open expanded view
    $(`[id="${this._id}"] section.image`)
      .addEventListener('click', (event) => this.detail())
  }

  // build an html template for this book
  template = () => {
    let div = document.createElement('div')
    div.classList.add('bookGeneral')
    div.classList.add('book')
    // attach the _id of the book to a id attribute.
    // this helps us to easily identify it elsewhere in our code.
    div.setAttribute('id', this._id)
    // the template holds all the information in a book entry, while css classes control what information is shown/ hidden
    let bookHTML =
      `<main><div class="buttonsContainer">
            <button class="back">← Back</button>
            <div class="optionsContainer">
            <button class="edit">Edit</button>
            <button class="delete">Delete</button>
            </div>
          </div></main>
          <div class="content">
      <section class="image" style="background-image: url(${this.imageURL()})"> 
          <a href="${this.imageURL()}" target="_blank">
            <img src="/open.svg" alt="Open">
          </a>
        </section>
        <section class="information">
          <header class="bookHeader"> 
          <div class="basicInfo"> 
            <h2 class="title">${this.title}</h2>
            <h3>  
              <span class="author">${this.author}</span>
            </h3>
            <h3>${this.badge()}</h3>
          </div>
        </header>
        <main>
          <div class="options">
          <div>
          <h5>Thoughts</h5>
          <p>${this.description}</p>
          <h5>Favourite Quote</h5>
          <p>${this.quotation}, pg ${this.page}</p>
          </div>
        </main>
        </section>
        </div>
      `
    div.innerHTML = bookHTML
    return div
  }

  // convert the JSON date to a more user readable date
  completedYear = () => {
    let completedDate = new Date(this.completedDate)
    let format = { year: 'numeric', timeZone: "UTC" }
    return completedDate.toLocaleString("en-CA", format)
  }
  completedMonth = () => {
    let completedDate = new Date(this.completedDate)
    let format = { month: 'short', timeZone: "UTC" }
    return completedDate.toLocaleString("en-CA", format)
  }
  completedDay = () => {
    let completedDate = new Date(this.completedDate)
    let format = { day: '2-digit', timeZone: "UTC" }
    return completedDate.toLocaleString("en-CA", format)
  }

  badge = () => {
    return (this.completed) ?
      `<div class="completion">COMPLETED •  ${this.completedMonth()} ${this.completedDay()} ${this.completedYear()}</div>` :
      '<div class="completion">STILL READING<div class="alert"></div></div>'
  }

  imageURL = () => {
    if (this.fileName.length < 20) {
      return (this.fileName) ? '/uploads/' + this.fileName : '/photo.svg';
    } else {
      return this.fileName
    }
  }
}
