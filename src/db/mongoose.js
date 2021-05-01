const mongoose = require('mongoose')

const connectionUrl = 'mongodb://127.0.0.1:27017/task-manager'

mongoose.connect(connectionUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
})

