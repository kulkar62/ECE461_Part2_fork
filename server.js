const express = require('express');
const path = require('path');

const app = express();

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname) + '/views/index.html');

});

app.listen(3000, () => console.log('server running on port 3000'));