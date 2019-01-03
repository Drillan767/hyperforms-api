'use strict'

const { validate, validateAll} = use('Validator')
const Newsletter = use('App/Models/NewsLetter')
const Mail = use('Mail')
const Email = use('App/Models/Email')
const Drive = use('Drive')
const Helpers = use('Helpers')
const Env = use('Env')
const mailgun = require('mailgun-js')({apiKey: Env.get('MAILGUN_KEY'), domain: Env.get('MAILGUN_DOMAIN')})
const RS = require('random-string')
const maked = require('marked')

class NewsLetterController {

  async subscribe ({request, response}) {
    const validation = await validate(request.all(), {
      email: 'email|required'
    })

    if (validation.fails()) {
      return response.status(401).json(validation.messages())
    } else {
      const { email } = request.only(['email'])
      const mail = await Email.create({
        email: email,
        confirm_token: RS({length: 40}),
        confirmed: false
      })

      if (mail.id === 1) {
        mailgun.post('/list', {'address': `newsletter@${Env.get('MAILGUN_DOMAIN')}`, 'description': 'List for Hyperform\'s newsletter'}, (error, body) => {
          if (error) {
            console.log(error)
          }
          if (body) {
            console.log(body)
          }
        })
      }

      const list = mailgun.lists(`newsletter@${Env.get('MAILGUN_DOMAIN')}`)
      list.members().create({subscribed: false, address: mail.email}, (error, data) => {
        console.log(data)
      })

      await Mail.send('newsletters.confirm_newsletter', email.toJSON(), (message) => {
        message
          .to(email.email)
          .from('noreply@hyperforms.com', 'Hyperforms')
          .subject('Hyperforms: Please confirm your subscription')
      })

      return response.status(200).json('ok')
    }
  }

  async confirmSubscription ({params, response}) {
    const email = await Email.findBy('confirmation_token', params.token)
    if (!email) {
      return response.status(401).json('not found')
    } else {
      const list = mailgun.lists(`newsletter@${Env.get('MAILGUN_DOMAIN')}`)
      list.members(email.email).update({'subscribed': true}, (error, data) => {
        console.log(data)
      })
      email.confirmed = true
      email.confirmation_token = ''
      await email.save()

      return response.status(200).json('ok')
    }
  }

  async newsLetters ({response}) {
    const nl = await Newsletter.all()
    return response.status(200).json(nl)
  }

  async subscribers ({response}) {
    const emails = await Email.all()
    return response.status(200).json(emails)
  }

  async upload ({request, response}) {
    const image = request.file('image', {
      types: ['image'],
      size: '2mb'
    })

    await image.move(Helpers.publicPath('newsletter/tmp'), {
      overwrite: true
    })

    if (!image.moved()) {
      return response.status(401).json(image.error())
    } else {
      return response.status(200).json(`${Env.get('APP_URL')}/newsletter/tmp/${image.clientName}`)
    }
  }

  async createNL ({request, response}) {
    const validation = await validateAll(request.all(), {
      title: 'string|required',
      content: 'required',
      status: 'boolean|required'
    })

    if (validation.fails()) {
      return response.status(401).json(validation.messages())
    } else {
      const data = request.all()
      const images = data.images
      delete data.images
      const nl = await Newsletter.create(data)

      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const basename = images[i].split(/[\\/]/).pop()
          if (data.content.includes(basename)) {
            await Drive.move(Helpers.publicPath(`newsletter/tmp/${basename}`),
              Helpers.publicPath(`newsletter/${nl.id}/${basename}`))
          }
        }

        nl.content = nl.content.replace(/\/tmp\//g, `/${nl.id}/`)
        await Drive.delete(Helpers.publicPath('newsletter/tmp'))
        await nl.save()
      }
      return response.status(200).json(nl)
    }
  }

  async publishNL ({params, response}) {
    const nl = await Newsletter.find(params.id)
    if (nl) {
      nl.status = true
      await nl.save()
      nl.content = marked(nl.content, {sanitize: true})
      await Mail.send('newsletters.newsletter', nl.toJSON(), (message) => {
        message
          .to('newsletter@mg.josephlevarato.fr')
          .from('noreply@hyperforms.com', 'Hyperforms')
          .subject(nl.title)
      })
    }
    return response.status(200).json('ok')
  }
}

module.exports = NewsLetterController
