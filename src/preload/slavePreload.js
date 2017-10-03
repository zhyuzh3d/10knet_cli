const electron = require('electron');
global.$electron = electron;
//const ipcRenderer = electron.ipcRenderer;
//var a = ipcRenderer.sendSync('run', 'mainWindow.setSize(200,200,true)');
console.log('>[cli]slavePreload:electron is ready.')
