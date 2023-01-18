const mongoose = require('mongoose')

// Below is the schema for books. 

const schema = new mongoose.Schema({
  isbn: { type: 'String' },
  title: { type: 'String' },
  author: { type: 'String' },
  description: { type: 'String' },
  quotation: { type: 'String' },
  page: { type: 'Number' },
  fileName: { type: 'String' },
  completedDate: { type: 'Date' },
  completed: { type: 'Boolean' }
})

module.exports = mongoose.model('Book', schema);
