# mAuth

Simple autorización de usuarios con MongoDB. Se desarrolla con las siguientes fantasticas tecnologías:

* Node/Express
* MongoDB/Mongoose
* Handlebars
* Tailwind

#### De la caja:

* Autorizacion basada en cookies
* Validación de formularios del lado del cliente y del servidor
* Mensajes flash
* Almacenamiento de contraseña con cifrado (Base64)
* Recuperación de contraseña con correo

#### Como arrancar

<pre><code>
  yarn
  yarn run app
</code></pre>

Es necesario crear el fichero <code>credentials.js</code> con el siguiente contenido:

<pre><code>
  module.exports = {
    cookieSecret: 'frase secreta',
    gmail: {
      user: 'su correo de Gmail',
      password: 'su contraseña de Gmail'
    }
    mongo: {
      development: {
        connectionString: 'mongodb://127.0.0.1/nombre_de_su_base_de_datos'
      },
      production: {
        connectionString: 'mongodb://127.0.0.1/nombre_de_su_base_de_datos'
      }
    }
  }
</code></pre>

#### Licensia:

Eres libre y tienes derecho de hacer todo lo que quieres.

#### Pantallas:

Login ->
![Login](screenshots/login.png "Login")

Mensajes flash ->
![Mensajes Flash](screenshots/login-flash-message.png "Mensajes flash")

Perfil de usuario ->
![Perfil de usuario](screenshots/user-profile.png "Perfil de usuario")