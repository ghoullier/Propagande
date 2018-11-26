import express from 'express';
import propagandeServer from './index';
/**
 * Propagande Developer Test
 */
const main = async () => {
  try {
    const app = express();
    app.listen(4000);
    const chien = await propagandeServer({
      appName: 'ange',
      admin: {
        name: 'admin',
        password: 'admin'
      },
      app,
      expressPort: 4000
    });

    await chien.createUser({
      name: 'roulio',
      password: 'chien'
    });

    await chien.createGroup('paidUsers');

    await chien.addUsersToGroup(['roulio'], 'paidUsers');

    console.log('READY');
    while (1) {
      console.log('SEND... ' + Date.now());
      await Promise.all([
        chien.callRoute('hello', { chien: 'LE CHIEN HEIN' }),
        chien.callRouteUser('roulio', 'hello', { zouave: 'les zouaves' }),
        chien.callRouteGroup('paidUsers', 'hello', {
          miracle: 'vous avez paye'
        })
      ]);

      await new Promise(resolve => setTimeout(resolve, 3000));
      // break
    }
  } catch (error) {
    console.log('ERROR', error);
  }
};

main();
