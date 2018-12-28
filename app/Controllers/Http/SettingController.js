'use strict'

const Settings = use('App/Models/Setting')
const { validateAll} = use('Validator')
const Helpers = use('Helpers')
const Env = use('Env')
// const Upload = require('./Upload')

class SettingController {
  async show ({response}) {
    const setting = await Setting.first()
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
      const setting = await Setting.first()

      // Landing
      const landing = request.file('landing', {
        types: ['image'],
        allowedExtensions: ['jpg', 'png', 'jpeg']
      })

      if (!landing) {
        errors.concat([{message: 'The landing field is required'}])
      } else {
        await landing.move(Helpers.publicPath('settings'), {
          overwrite: true,
          name: `landing.${landing.subtype}`
        })
        if (!landing.moved()) {
          errors.concat([landing.message()])
        } else {
          data.landing_bg = `${Env.get('APP_URL')}/settings/landing.${landing.subtype}`
        }
      }

      // Biography
      const biography = request.file('biography', {
        types: ['image'],
        allowedExtensions: ['jpg', 'png', 'jpeg']
      })

      if (!biography) {
        errors.concat([{message: 'The biography field is required'}])
      } else {
        await biography.move(Helpers.publicPath('settings'), {
          overwrite: true,
          name: `biography.${biography.subtype}`
        })
        if (!biography.moved()) {
          errors.concat([biography.message()])
        } else {
          data.bio_bg = `${Env.get('APP_URL')}/settings/biography.${biography.subtype}`
        }
      }

      // Shop
      const shop = request.file('shop', {
        types: ['image'],
        allowedExtensions: ['jpg', 'png', 'jpeg']
      })

      if (!shop) {
        errors.concat([{message: 'The shop field is required'}])
      } else {
        await shop.move(Helpers.publicPath('settings'), {
          overwrite: true,
          name: `shop.${shop.subtype}`
        })
        if (!shop.moved()) {
          errors.concat([shop.message()])
        } else {
          data.shop_bg = `${Env.get('APP_URL')}/settings/shop.${shop.subtype}`
        }
      }

      // Contact
      const contact = request.file('contact', {
        types: ['image'],
        allowedExtensions: ['jpg', 'png', 'jpeg']
      })

      if (!contact) {
        errors.concat([{message: 'The contact field is required'}])
      } else {
        await contact.move(Helpers.publicPath('settings'), {
          overwrite: true,
          name: `contact.${contact.subtype}`
        })
        if (!contact.moved()) {
          errors.concat([contact.message()])
        } else {
          data.contact_bg = `${Env.get('APP_URL')}/settings/contact.${contact.subtype}`
        }
      }

      if (errors.length > 0) {
        return response.status(401).json(errors)
      } else {
        setting.soundcloud = data.soundcloud || setting.soundcloud
        setting.youtube = data.youtube || setting.youtube
        setting.spotify = data.spotify || setting.spotify
        setting.songkick = data.songkick || setting.songkick
        setting.landing_bg = data.landing_bg || setting.landing_bg
        setting.bio_bg = data.bio_bg || setting.bio_bg
        setting.shop_bg = data.shop_bg || setting.shop_bg
        setting.contact_bg = data.contact_bg || setting.contact_bg

        await setting.save()
      }
    }
  }
}

module.exports = SettingController
