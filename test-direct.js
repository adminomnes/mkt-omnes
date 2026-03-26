const { Resend } = require('resend');

const resend = new Resend('re_VVnhvJ61_GGNQF5jKuWXmFFrYhBYS6RvW');

async function test() {
  try {
    const result = await resend.emails.send({
      from: 'contacto@omnes.cl',
      to: ['john.laserena@gmail.com'],
      subject: 'Test Directo Resend - OMNES',
      html: '<h1>¡Funciona!</h1><p>Email de prueba directo.</p>'
    });
    console.log('SUCCESS:', result);
  } catch (error) {
    console.log('ERROR:', error.message);
  }
}

test();
