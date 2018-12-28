'use strict'
const User = use('App/Models/User')
const { validateAll} = use('Validator')
const Helpers = use('Helpers')
const Env = use('Env')


class UserController {
  async show ({response}) {
    const user = await User.first()
    if (!user) {
      return response.status(404).json('not found')
    } else {
      return response.status(200).json(user)
    }
  }

  async update ({request, response}) {
    let errors = []
    const user = await User.first()
    if (!user) {
      return response.status(500).json('No user found, wtf.')
    } else {
      const validation = await validateAll(request.all(), {
        email: 'email|required',
        password: 'string',
        biography: 'min:30|required',
        facebook: 'string|required',
        twitter: 'string|required',
        instagram: 'string|required'
      })

      if (validation.fails()) {
        return response.status(401).json(errors.concat(validation.messages()))
      } else {
        const data = request.all()
        const picture = request.file('picture', {
          types: ['image'],
          allowedExtensions: ['jpg', 'png', 'jpeg']
        })

        if (!picture && user.picture.length === 0) {
          errors.concat([{message: 'A picture is required'}])
        } else {
          await picture.move(Helpers.publicPath('user'), {
            overwrite: true
          })
          if (!picture.moved()) {
            errors.concat([picture.message()])
          } else {
            data.picture = `${Env.get('APP_URL')}/user/${picture.clientName}`
          }
        }

        console.log(data)

        if (errors.length > 0) {
          return response.status(401).json(errors)
        } else {
          user.email = data.email || user.email
          user.password = data.password || user.password
          user.picture = data.picture || user.picture
          user.biography = data.biography || user.biography
          user.facebook = data.facebook || user.facebook
          user.twitter = data.twitter || user.twitter
          user.instagram = data.instagram || user.instagram

          await user.save()
          return response.status(200).json(user)
        }
      }
    }
  }
}

module.exports = UserController
