'use strict'

const { validate, validateAll} = use('Validator')
const NL = use('App/Models/NewsLetter')
const NLSettings = use('App/Models/NlSetting')
const Mail = use('Mail')
const RS = require('random-string')
const Email = use('App/Models/Email')

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
          .from('Hyperforms <noreply@hyperforms.com>')
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

  async getList ({response}) {
    const nl_settings = await NLSettings.all()
    return response.status(200).json(nl_settings)
  }

  async newsLetters ({response}) {
    const nl = await NL.all()
    return response.status(200).json(nl)
  }

  async saveNLSettings ({request, response}) {
    let errors = []
    const validation = await validateAll(request.all(), {
      title: 'string|required',
      template: 'required',
      bottom_text: 'string|required',
      unsubscribe: 'string|required'
    })

    if (validation.fails()) {
      return response.status(401).json(errors.concat(validation.messages()))
    } else {
      const data = request.only(['title', 'template', 'bottom_text', 'unsubscribe'])
      if (!data.unsubscribe.includes('[unsub_link]')) {
        errors.push({ message: 'The field needs to contain "[unsub_link]"' })
      }

      if (errors.length > 0) {
        return response.status(401).json(errors)
      } else {
        const nl_setting = await NLSettings.create(data)
        return response.status(201).json(nl_setting)
      }
    }
  }

  async deleteNLSettings ({request, response}) {}

  async createNL ({request, response}) {}

  async publishNL ({request, response}) {}

  async uploadNL ({request, response}) {}
}

module.exports = NewsLetterController
