import electron, { app, BrowserWindow } from 'electron';
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';
import { enableLiveReload } from 'electron-compile';
const path = require('path');

// 保持主窗口，否则会被自动回收
let mainWindow;
const isDevMode = process.execPath.match(/[\\/]electron/);
if(isDevMode) enableLiveReload({ strategy: 'react-hmr' });

const createWindow = async() => {
    // 打开主窗口，载入桥接脚本
    const workArea = electron.screen.getPrimaryDisplay().workArea;
    mainWindow = new BrowserWindow({
        x: workArea.x + workArea.width - 400,
        y: workArea.y,
        center: false,
        width: 400,
        height: workArea.height,
        webPreferences: {
            nodeIntegration: false,
            preload: path.join(__dirname, 'preload.js'),
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
    // mainWindow.loadURL(`file://${__dirname}/index.html`);
    var host = `http://localhost:3000`;

    // 打开开发工具
    if(isDevMode) {
        mainWindow.loadURL(host);
        await installExtension(REACT_DEVELOPER_TOOLS);
        mainWindow.webContents.openDevTools();
    } else {
        xmainWindow.loadURL(host);
        await installExtension(REACT_DEVELOPER_TOOLS);
        mainWindow.webContents.openDevTools();
    }

    // 窗口被关闭时候运行
    mainWindow.on('closed', () => {
        // 如果有多个窗口都应关闭
        mainWindow = null;
    });
};

// 应用就绪后运行
app.on('ready', createWindow);

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
        createWindow();
    };
});


//
