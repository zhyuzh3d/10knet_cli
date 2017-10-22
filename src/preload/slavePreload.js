const electron = require('electron');
global.$electron = electron;
global.$winName = 'slave';
console.log('>[cli]slavePreload:electron is ready.')
