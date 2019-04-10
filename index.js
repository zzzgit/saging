'use strict';

var events = require('events');

//	如果傳入參數本身是promise，則不用傳asyncFunc
//	任務池最大個數
/**
 * machine
 */
class Feeder {
    constructor(bus) {
        this._isShutdown = false;
        this._tasks_arr = [];
        this._resolves_arr = [];
        this._rejects_arr = [];
        this._bus = null;
        this._bus = bus;
        this._bus.on("starve", (runner) => {
            //this.check(runner)
        });
    }
    feed() {
        if (this._tasks_arr.length) {
            return Promise.resolve(this._tasks_arr.shift());
        }
        return new Promise((resolve, reject) => {
            this._resolves_arr.push(resolve);
            this._rejects_arr.push(reject);
        });
    }
    push(tasks) {
        if (!Array.isArray(tasks)) {
            tasks = [tasks];
        }
        tasks.forEach(item => {
            this._push1(item);
        });
    }
    _push1(task) {
        if (this._resolves_arr.length) {
            return this._resolves_arr.shift()(task);
        }
        this._tasks_arr.push(task);
    }
    shutdown() {
        this._isShutdown = true;
        this._bus = null;
        this._tasks_arr = [];
        this._resolves_arr = [];
        this._rejects_arr = [];
    }
}

/**
 * life circle: created (requesting executing done) deprecated shutdown
 */
class Digester {
    constructor(saging, bus) {
        this._saging = null;
        this._bus = null;
        this._isDeprecated = false;
        this._isShutdown = false;
        this._isIdle = true;
        this._saging = saging;
        this.bus = bus;
    }
    get bus() {
        return this._bus;
    }
    set bus(bus) {
        this._bus = bus;
    }
    get isIdle() {
        return this._isIdle;
    }
    run() {
        if (this._isShutdown) {
            return null;
        }
        if (this._isDeprecated) {
            return this.bus.emit("readyToRemove", this);
        }
        this._request().then(task => {
            this._isIdle = false;
            return task().then(() => {
                // 執行完畢 event, 執行失敗也許處理
                this.bus.emit("done", this);
                this._isIdle = true;
                process.nextTick(() => {
                    this.run();
                });
            });
        }).catch(e => {
            //this.bus.emit("starved", this)
        });
    }
    _request() {
        return this._saging.feed();
    }
    deprecate() {
        this._isDeprecated = true;
    }
    shutdown() {
        this._isShutdown = true;
        this._saging = null;
        this._isIdle = true;
        this.bus = null;
    }
}

/**	// apply state machine
 * life circle : changing concurrency
 */
class Saging {
    constructor(n) {
        this._runners_arr = [];
        this._isShutdown = false;
        this._bus = new events.EventEmitter();
        this._bus.on("done", runner => {
        });
        this._bus.on("readyToRemove", runner => {
            this._remove(runner);
        });
        this._bus.on("starved", runner => {
            // this._remove(runner)
        });
        this._init(n);
    }
    get threads() {
        return this._runners_arr.length;
    }
    set threads(number) {
        console.log(`..........---${number}`);
        if (number === this.threads) {
            return;
        }
        if (number < 1) {
            throw new Error("number should not be less than 1");
        }
        if (number > this.threads) {
            this._addRunner(number - this.threads);
            return;
        }
        this._deprecate(this.threads - number);
    }
    push(tasks) {
        if (this._isShutdown) {
            throw new Error("already shutdown");
        }
        if (!tasks) {
            return null;
        }
        this._feeder.push(tasks);
    }
    _deprecate(n) {
        let border = this.threads - n;
        for (let i = this.threads - 1; i >= border; i--) {
            this._runners_arr[i].deprecate();
        }
    }
    _addRunner(n) {
        let temp_arr = [];
        for (let i = 0; i < n; i++) {
            let digester = new Digester(this, this._bus);
            temp_arr.push(digester);
            this._runners_arr.push(digester);
        }
        temp_arr.forEach(runner => {
            runner.run();
        });
    }
    feed() {
        if (this._isShutdown) {
            return Promise.reject("already shut down");
        }
        return this._feeder.feed();
    }
    _remove(runner) {
        let index_n = this._runners_arr.indexOf(runner);
        this._runners_arr.splice(index_n, 1);
        runner.shutdown();
    }
    _init(n) {
        this._feeder = new Feeder(this._bus);
        this._addRunner(n);
    }
    shutdown() {
        this._isShutdown = true;
        this._feeder.shutdown();
        this._runners_arr.forEach(runner => {
            runner.shutdown();
        });
    }
}

module.exports = Saging;
