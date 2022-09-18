// Taken from https://github.com/humayun-rashid/first-rest-api-medium

const express = require('express'); // importing Express
const router = express.Router(); // instance of express


// GET request
router.get('/', function (req, res) {
    res.status(200).send('Server is up and running.')
})

// POST request
router.post('/', function (req, res) {
    res.status(200).send('This is a POST request')
})

// PUT Request
router.put('/', function (req, res) {
    res.status(200).send('This is a PUT request')
})

// PATCH Request
router.patch('/', function (req, res) {
    res.status(200).send('This is a PATCH request')
})

// DELETE Request
router.delete('/', function (req, res) {
    res.status(200).send('This is a DELETE request')
})

module.exports = router;
