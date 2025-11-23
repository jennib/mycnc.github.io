const { app } = require('electron');
console.log(app);
if (app) {
  app.whenReady().then(() => {
    console.log('App is ready');
    app.quit();
  });
}
