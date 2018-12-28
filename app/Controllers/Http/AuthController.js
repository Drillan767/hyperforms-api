'use strict'

const User = use('App/Models/User')
const Token = use('App/Models/Token')
const { validate, validateAll } = use('Validator')
const Encryption = use('Encryption')
const Mail = use('Mail')
const Helpers = use('Helpers')
const Env = use('Env')
const randomString = require('random-string')

class AuthController {
  async register ({ request, response }) {
    const validation = await validateAll(request.all(), {
      email: 'email|required',
      password: 'required'
    })

    if (validation.fails()) {
      return response.status(401).json(validation.messages())
    } else {
      const data = request.all()
      const user = await User.create(data)
      return response.status(201).json(user)
    }
  }

  async login ({request, auth, response}) {
    const validation = await validateAll(request.all(), {
      email: 'email|required',
      password: 'required'
    })

    if (validation.fails()) {
      return response.status(401).json(validation.messages())
    } else {
      try {
        const {email, password} = request.all()
        return await auth.withRefreshToken().attempt(email, password)
      } catch (e) {
        response.status(401).json({message: 'Invalid email or password'})
      }
    }
  }

  async refreshToken ({request, auth, response}) {
    const validation = await validate(request.all(), {
      refreshToken: 'required'
    })

    if (validation.fails()) {
      response.status(401).send(validation.messages())
    } else {
      const { refreshToken } = request.all()
      try {
        return await auth
          .newRefreshToken()
          .generateForRefreshToken(refreshToken)
      } catch (e) {
        response.status(401).json({message: 'Invalid refresh token'})
      }
    }
  }

  async logout ({request, auth, response}) {
    const validation = await validate(request.all(), {
      refreshToken: 'required'
    })

    if (validation.fails()) {
      response.status(401).send(validation.messages())
    } else {
      const {refreshToken} = request.all()
      try {
        const dectypted = Encryption.decrypt(refreshToken)
        const token = await Token.findBy('token', dectypted)
        if (token) {
          await token.delete()
          return response.status(200).json('ok')
        } else {
          response.status(401).json({message: 'Invalid refresh token'})
        }
      } catch (e) {
        response.status(401).json({message: 'Something went REALLY wrong.'})
      }
    }
  }

  async reset ({request, response}) {
    const validation = await validate(request.all(), {
      email: 'email|required'
    })

    if (validation.fails()) {
      return response.status(401).json(validation.messages())
    } else {
      const { email } = request.all()
      const user = await User.findBy('email', email)
      if (user) {
        user.reset_token = randomString({length: 40})
        await user.save()

        await Mail.send('notifications.password_reset', user.toJSON(), (message) => {
          message
            .from('noreply@josephlevarato.me', 'Overlord')
            .to(user.email)
            .subject('Password reset requested')
        })

        return response.status(200).json('ok')
      } else {
        return response.status(401).json([{message: 'No one here has this email address, mate'}])
      }
    }
  }

  async verifyHash ({request, response}) {
    const validation = await validate(request.all(), {
      hash: 'string|required'
    })

    if (validation.fails()) {
      return response.status(401).json('no')
    } else {
      const { hash } = request.all()
      const user = await User.findBy('reset_token', hash)
      if (!user) {
        return response.status(401).json('no')
      }
    }
  }

  async resetPassword ({ request, auth, response }) {
    const validation = await validateAll(request.all(), {
      password: 'string|required',
      hash: 'string|required'
    })
    if (validation.fails()) {
      return response.status(401).json(validation.messages())
    } else {
      const { password, hash } = request.all()
      const user = await User.findBy('reset_token', hash)
      if (!user) {
        return response.status(401).json([{message: 'Unable to find you in the database, please send a message to the admin'}])
      } else {
        user.password = password
        user.reset_token = ''
        await user.save()
        return response.status(200).json(await auth.withRefreshToken().attempt(user.email, password))
      }
    }
  }
}

module.exports = AuthController
