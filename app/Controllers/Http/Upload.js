const Helpers = use('Helpers')

module.exports = {
  async image (file, publicPath) {
    const picture = request.file('picture', {
      types: ['image'],
      allowedExtensions: ['jpg', 'png', 'jpeg']
    })

    if (!picture) {
      errors.concat([{message: 'A picture is required'}])
    } else {
      await picture.move(Helpers.publicPath(publicPath), {
        overwrite: true
      })
      if (!picture.moved()) {
        errors.concat([picture.message()])
      } else {
        return `${Env.get('APP_URL')}/${publicPath}/${picture.clientName}`
      }
    }
  }
}
