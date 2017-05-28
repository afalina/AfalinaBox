const {app, nativeImage, Menu, BrowserWindow, Tray} = require('electron')
const path = require('path')
const url = require('url')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
let tray;
const defaultIcon = nativeImage.createFromPath(
  path.join(__dirname, 'icons/dolphin-black@2x.png')
);
const progressIcon = nativeImage.createFromPath(
  path.join(__dirname, 'icons/dolphin-sync@2x.png')
);
const errorIcon = nativeImage.createFromPath(
  path.join(__dirname, 'icons/dolphin-red@2x.png')
);
defaultIcon.setTemplateImage(true);
progressIcon.setTemplateImage(true);

const menu = [
  {
    label: app.getName(),
    submenu: [
      {role: 'about'},
      {type: 'separator'},
      {role: 'services', submenu: []},
      {type: 'separator'},
      {role: 'hide'},
      {role: 'hideothers'},
      {role: 'unhide'},
      {type: 'separator'},
      {role: 'quit'}
    ]
  },
  {
    label: 'Edit',
    submenu: [
      {role: 'undo'},
      {role: 'redo'},
      {type: 'separator'},
      {role: 'cut'},
      {role: 'copy'},
      {role: 'paste'},
      {role: 'pasteandmatchstyle'},
      {role: 'delete'},
      {role: 'selectall'}
    ]
  },
  {
    label: 'View',
    submenu: [
      {role: 'toggledevtools'}
    ]
  },
  {
    role: 'window',
    submenu: [
      {role: 'close'},
      {role: 'minimize'},
      {role: 'zoom'},
      {type: 'separator'},
      {role: 'front'}
    ]
  }
];

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    title: 'AfalinaBox',
    width: 800,
    height: 600,
    useContentSize: true,
    resizable: false
  });

  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

global.setStatusIcon = function(type) {
  if (type === 'initial' || type === 'success') {
    tray.setImage(defaultIcon);
    tray.setToolTip('AfalinaBox');
  } else if (type === 'progress') {
    tray.setImage(progressIcon);
    tray.setToolTip('AfalinaBox: syncing...');
  } else if (type === 'error') {
    tray.setImage(errorIcon);
    tray.setToolTip('AfalinaBox: error');
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  tray = new Tray(defaultIcon);
  tray.setToolTip('AfalinaBox');
  Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
  createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.