
const express = require('express')
const router = express.Router()
const Book = require("../models/Book")


// the "fs" (filesystem) library lets us store images on Replit.
const fs = require('fs')
// the "path" library helps with the naming of files and folders
const path = require('path')
// set the file upload size limit (i.e. 5MB)
const uploadMaxSize = 5 * 1024 * 1024
// set the folder where uploads will be stored.
const uploadFolder = path.resolve(__dirname, '..', 'public', 'uploads')


// FILE UPLOAD (ENDPOINT)
// listen for a POST request with a file attachment.
router.post("/file", (req, res) => {
  // check if we recieved a file with the name "image"
  if (req.files.image) {
    // make sure the file isn't too big
    if (req.files.image.size < uploadMaxSize) {
      // get the file extension of the uploaded image
      const fileExt = path.extname(req.files.image.name)
      // generate a new filename based on the current time
      const fileName = new Date().getTime() + fileExt
      // define the destination for the upload
      const destination = path.join(uploadFolder, fileName)
      // move the uploaded file to its destination
      req.files.image.mv(destination, (err) => {
        // if successful send the fileName back to the frontend.
        if (!err) res.send({ fileName: fileName })
        // if we failed ot move the file, send an error
        else res.status(500).send({ error: "File Save Failed" })
      })
    }
    else {
      // if the file was too big, send an error
      res.status(400).send({ error: "File Too Large" })
    }
  }
  else {
    // if no file was received, send an error
    res.status(400).send({ error: "File Not Found" })
  }
})

// CREATE
router.post('/book', (req, res) => {
  // this endpoint looks for JSON data in the body of the request
  delete req.body._id // no need for an id when creting a new book
  console.log(req.body)
  new Book(req.body).save()
    .then(book => res.send(book))
    .catch(err => res.status(500).send(err))
})
// READ
router.get('/books', (req, res) => {

  let filter = {}
  let sort = {}
  if (req.query.sort == "birthDate") {
    sort.birthDate = "ascending"
  }
  if (req.query.sort == "name") {
    sort.name = "descending"
  }
  Book.find(filter)
    .sort(sort)
    .then(books => res.send(books))
    .catch(err => res.status(500).send(err))
})

// get a single book
router.get('/book/:id', (req, res) => {
  Book.findById(req.params.id)
    .then(book => res.send(book))
    .catch(err => res.status(500).send(err))
})

//UPDATE
router.put('/book/:id', (req, res) => {
  // the ":id" part of the endpoint url is dynamic.
  // we can retrieve it using "req.params.id"
  let options = { new: true }
  Book.findByIdAndUpdate(req.params.id, req.body, options)
    .then(book => res.send(book))
    .catch(err => res.status(500).send(err))
})
//DELETE
router.delete('/book/:id', (req, res) => {
  console.log(req.params.id)
  Book.findByIdAndRemove(req.params.id)
    .then(result => res.send(result))
    .catch(err => res.status(500).send(err))
})

module.exports = router;
