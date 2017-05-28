// Usage example:
// const sync = new Sync(localDir, remoteDir, remoteHost, remoteUser);
// sync.sync()
//     .then(result => console.log('Success'))
//     .catch(error => console.log(error));

const execFile = require('child_process').execFile;

class Sync {
    constructor(localDir, remoteDir, remoteHost, remoteUser) {
        this.localDir = localDir;
        this.remoteDir = remoteDir;
        this.remoteHost = remoteHost;
        this.remoteUser = remoteUser;

        this.process = null;
        this.syncing = false;
        this.syncAgain = false;
        this.promise = null;
        this.resolve = null;
        this.reject = null;
    }

    sync() {
        if (this.syncing) {
            this.syncAgain = true;
        } else {
            this.syncing = true;
            this.promise = new Promise((resolve, reject) => {
                this.resolve = resolve;
                this.reject = reject;
            });
            this._sync();
        }
        return this.promise;
    }

    _sync() {
        const rsyncPath = '/usr/bin/rsync';
        const args = [
            "--recursive",
            "--exclude",
            ".DS_Store",
            "--delete-during",
            "--force",
            "--rsh='ssh'",
            this.localDir + '/',
            this.remoteUser + "@" + this.remoteHost + ":" + this.remoteDir
        ];

        this.process = execFile(rsyncPath, args, (error, stdout, stderr) => {
            if (this.syncAgain) {
                this.syncAgain = false;
                this._sync();
            } else {
                this.syncing = false;
                if(error || stderr) {
                    if (this.reject) {
                        this.reject(stderr);
                    }
                } else {
                    if (this.resolve) {
                        this.resolve(stdout);
                    }
                }
            }
        });
    }

    abort() {
        this.syncing = false;
        this.syncAgain = false;
        this.promise = null;
        this.resolve = null;
        this.reject = null;
        if (this.process) {
            this.process.kill();
        }
        this.process = null;
    }
}

module.exports = Sync;
