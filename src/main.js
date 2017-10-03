import electron, { app, BrowserWindow } from 'electron';
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import { enableLiveReload } from 'electron-compile';
const path = require('path');

// 保持主窗口，否则会被自动回收
let mainWindow, slaveWindow;
const isDevMode = process.execPath.match(/[\\/]electron/);
if(isDevMode) enableLiveReload({ strategy: 'react-hmr' });
var host = isDevMode ? 'http://localhost:3000' : 'https://10knet.com';

global.aa = 999;

// 打开主窗口，载入桥接脚本
const initMain = async() => {
    const workArea = electron.screen.getPrimaryDisplay().workArea;
    mainWindow = new BrowserWindow({
        title: '10knet-main',
        x: workArea.x + workArea.width - 400,
        y: workArea.y,
        center: false,
        width: 400,
        height: workArea.height,
        alwaysOnTop: true,
        //frame:false,
        webPreferences: {
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload/mainPreload.js'),
        },
    });

    //支持渲染进程ipc调用main process主进程命令
    const ipcMain = require('electron').ipcMain;
    ipcMain.on('run', function(event, cmd) {
        try {
            eval(cmd);
            event.returnValue = true;
        } catch(err) {
            event.returnValue = err.message;
        }
    });

    // 载入页面，测试端口为本地3000
    var home = host + '?pageName=MainHomePage';
    mainWindow.loadURL(home);

    // 打开开发工具
    if(isDevMode) {
        await installExtension(REACT_DEVELOPER_TOOLS);
        mainWindow.webContents.openDevTools();
    };

    // 窗口被关闭时候运行
    mainWindow.on('closed', () => {
        // 如果有多个窗口都应关闭
        mainWindow = null;
    });
};

//从窗口默认不显示，预先载入页面内容；但同样支持ipc命令
const initSlave = async() => {

    const workArea = electron.screen.getPrimaryDisplay().workArea;
    slaveWindow = new BrowserWindow({
        title: '10knet-slave',
        x: 0,
        y: 0,
        center: false,
        width: workArea.width - 400,
        height: workArea.height,
        //frame:false,
        webPreferences: {
            nodeIntegration: true,
            //preload: host + '/cliPreload/slavePreload.js',
            preload: path.join(__dirname, 'preload/slavePreload.js'),
        },
    });
    slaveWindow.hide();

    //支持渲染进程ipc调用main process主进程命令
    const ipcMain = require('electron').ipcMain;
    ipcMain.on('run', function(event, cmd) {
        try {
            eval(cmd);
            event.returnValue = true;
        } catch(err) {
            event.returnValue = err.message;
        }
    });

    //载入页面，测试端口为本地3000
    var home = host + '?pageName=SlaveHomePage';
    slaveWindow.loadURL(home);

    // 打开开发工具
    if(isDevMode) {
        await installExtension(REACT_DEVELOPER_TOOLS);
        slaveWindow.webContents.openDevTools();
    };

    // 窗口被关闭时候运行
    slaveWindow.on('closed', () => {
        // 如果有多个窗口都应关闭
        slaveWindow = null;
    });
};


// 应用就绪后运行
app.on('ready', () => {
    initMain();
    initSlave();
});

// 当所有窗口关闭时退出
app.on('window-all-closed', () => {
    // OS X中Cmd + Q执行的时候
    if(process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // 在OSX中点击docker图标的时候弹出
    if(mainWindow === null) {
        initMain();
    };
    if(slaveWindow === null) {
        initSlave();
    };
});




//
