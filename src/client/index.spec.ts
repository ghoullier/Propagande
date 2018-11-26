import propagandeClient from './index';

const main = async () => {
  const pro = await propagandeClient({
    appName: 'ange',
    url: 'http://localhost:4000'
  });

  await pro.login({
    name: 'roulio',
    password: 'chien'
  });

  pro.addRoute('hello', (params: any) => {
    console.log(params);
  });
};

main();
