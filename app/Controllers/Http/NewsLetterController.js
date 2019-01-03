'use strict'

const { validate, validateAll} = use('Validator')
const Newsletter = use('App/Models/NewsLetter')
const Mail = use('Mail')
const Email = use('App/Models/Email')
const Drive = use('Drive')
const Helpers = use('Helpers')
const Env = use('Env')
const RS = require('random-string')

class NewsLetterController {

  async subscribe ({request, response}) {
    const validation = await validate(request.all(), {
      email: 'email|required'
    })

    if (validation.fails()) {
      return response.status(401).json(validation.messages())
    } else {
      const { email } = request.only(['email'])
      await Email.create({
        email: email,
        confirm_token: RS({length: 40}),
        confirmed: false
      })

      await Mail.send('newsletters.confirm_newsletter', email.toJSON(), (message) => {
        message
          .to(email.email)
          .from('noreply@hyperforms.com', 'Hyperforms')
          .subject('Hyperforms: Please confirm subscription')
      })

      return response.status(200).json('ok')
    }
  }

  async confirmSubscription ({params, response}) {
    const email = await Email.findBy('confirmation_token', params.token)
    if (!email) {
      return response.status(401).json('not found')
    } else {
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
        console.log(images[1])
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

  async publishNL ({request, response}) {}

  async uploadNL ({request, response}) {}
}

module.exports = NewsLetterController
