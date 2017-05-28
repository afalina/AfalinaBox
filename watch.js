// Usage example:
// const watch = new Watch();
// watch.watch(dir, function() {
//     // ...
// });

const chokidar = require('chokidar');

class Watch {
    constructor() {
        this.path = null;
        this.callback = null;
        this.watcher = null;
        this.callbackTimeout = null;
    }

    watch(path, callback) {
        this.callback = callback;

        if (this.watcher && path === this.path) {
            return;
        }

        this.path = path;
        this.watcher = chokidar.watch(this.path, {
            ignoreInitial: true,
            ignored: [
                /node_modules/,
                /\\.git/,
                /DS_Store/
            ]
        }).on('all', (event, path) => this._requestCallback());
    }

    _requestCallback() {
        if (this.callbackTimeout) {
            clearTimeout(this.callbackTimeout);
        }

        this.callbackTimeout = setTimeout(() => {
            this.callbackTimeout = null;
            this.callback();
        }, 50);
    }

    unwatch() {
        this.watcher.close();
        this.path = null;
        this.callback = null;
        this.watcher = null;
    }
}

module.exports = Watch;
