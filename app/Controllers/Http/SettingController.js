'use strict'

const Settings = use('App/Models/Setting')
const { validateAll} = use('Validator')
const Helpers = use('Helpers')
const Env = use('Env')
// const Upload = require('./Upload')

class SettingController {
  async show ({response}) {
    const setting = await Settings.first()
    return response.status(200).json(setting)
  }

  async update ({request, response}) {
    let errors = []
    const validation = await validateAll(request.all(), {
      soundcloud: 'string|required',
      youtube: 'string|required',
      spotify: 'string|required',
      songkick: 'string|required',
    })

    if (validation.fails()) {
      errors.concat(validation.messages())
    } else {
      const data = request.only(['soundcloud', 'youtube', 'spotify', 'songkick'])

      // Landing
      const landing = request.file('landing_bg', {
        types: ['image'],
        allowedExtensions: ['jpg', 'png', 'jpeg']
      })

      if (landing) {
        await landing.move(Helpers.publicPath('settings'), {
          overwrite: true,
          name: `landing.${landing.subtype}`
        })
        if (!landing.moved()) {
          errors.concat([landing.message()])
        } else {
          data.landing_bg = `${Env.get('APP_URL')}/settings/landing.${landing.subtype}`
        }
      } else {
        data.landing_bg = ''
      }

      // Biography
      const biography = request.file('bio_bg', {
        types: ['image'],
        allowedExtensions: ['jpg', 'png', 'jpeg']
      })

      if (biography) {
        await biography.move(Helpers.publicPath('settings'), {
          overwrite: true,
          name: `biography.${biography.subtype}`
        })
        if (!biography.moved()) {
          errors.concat([biography.message()])
        } else {
          data.bio_bg = `${Env.get('APP_URL')}/settings/biography.${biography.subtype}`
        }
      } else {
        data.bio_bg = ''
      }

      // Shop
      const shop = request.file('shop_bg', {
        types: ['image'],
        allowedExtensions: ['jpg', 'png', 'jpeg']
      })

      if (shop) {
        await shop.move(Helpers.publicPath('settings'), {
          overwrite: true,
          name: `shop.${shop.subtype}`
        })
        if (!shop.moved()) {
          errors.concat([shop.message()])
        } else {
          data.shop_bg = `${Env.get('APP_URL')}/settings/shop.${shop.subtype}`
        }
      } else {
        data.shop_bg = ''
      }

      // Contact
      const contact = request.file('contact_bg', {
        types: ['image'],
        allowedExtensions: ['jpg', 'png', 'jpeg']
      })

      if (contact) {
        await contact.move(Helpers.publicPath('settings'), {
          overwrite: true,
          name: `contact.${contact.subtype}`
        })
        if (!contact.moved()) {
          errors.concat([contact.message()])
        } else {
          data.contact_bg = `${Env.get('APP_URL')}/settings/contact.${contact.subtype}`
        }
      } else {
        data.contact_bg = ''
      }

      if (errors.length > 0) {
        return response.status(401).json(errors)
      }

      const setting = await Settings.first()

      if (setting) {
        console.log(data)
        let fields = ['soundcloud', 'youtube', 'spotify', 'songkick', 'landing_bg', 'bio_bg', 'shop_bg', 'contact_bg']
        fields.map(field => {
          setting[field] = data[field] || setting[field]
        })

        await setting.save()
        return response.status(200).json(setting)
      } else {
        const setting = await Settings.create(data)
        return response.status(201).json(setting)
      }
    }
  }
}

module.exports = SettingController
