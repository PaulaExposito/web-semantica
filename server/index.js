const morgan = require('morgan');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// Settings
app.set('port', process.env.PORT || 3000);

// Middlewares
app.use(cors())
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: true}))

// Routes
app.use('/api', require('./src/routes'));

// Server is listening
app.listen(app.get('port'), () => {
    console.log('Server on port', app.get('port'));
});
