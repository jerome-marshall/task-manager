const express = require('express')
const sharp = require('sharp')
const router = new express.Router()
const User = require('../models/user')
const auth = require('../middleware/auth')
const upload = require('../middleware/upload')
const { sendWelcomeEmail, sendCancellationEmail } = require('../emails/account')

router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/logout', auth, async (req, res) => {
    const user = req.user

    try {
        console.log(req.token)
        user.tokens = user.tokens.filter( token => token.token !== req.token )
        await user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    const user = req.user

    try{
        user.tokens = []
        await user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/users', async (req, res) => {
    try{
        const users = await User.find({})
        res.send(users)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

router.patch('/users/me', auth, async (req, res) => {
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const updates = Object.keys(req.body)
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))

    if(!isValidOperation)
        return res.status(400).send({error: 'Invalid updates!'})

    try{
        updates.forEach(update => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        sendCancellationEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    req.user.avatar = await sharp(req.file.buffer).resize({height: 250, width: 250}).png().toBuffer()
    try{
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send(e)
    }
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar)
            throw new Error
        res.set('Content-Type', 'image/jpg')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    try {
        await req.user.save()
        res.send(req.user)
    } catch (e) {
        res.status(500).send(e)
    }
})

module.exports = router
