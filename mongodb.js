require('./src/db/mongoose')
const Task = require('./src/models/task')

// Task.findByIdAndDelete('608ad1a9dd5b06297856bdf0').then((task) => {
//     console.log(task)
//     return Task.countDocuments({completed: false})
// }).then((tasks) => {
//     console.log(tasks)
// }).catch(e => {
//     console.log(e)
// })

const deleteTaskandCount = async (id) => {
    await Task.findByIdAndDelete(id)
    const count = await Task.countDocuments({completed: false})
    return count
}

deleteTaskandCount('608bad9522658f0a582eee79').then((count) => {
    console.log(count)
}).catch(e => {
    console.log(e)
})