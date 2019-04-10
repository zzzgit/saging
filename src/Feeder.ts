import * as EventEmitter from "events"
import AsyncFunc from "./type/AsyncFunc";


//	如果傳入參數本身是promise，則不用傳asyncFunc
//	任務池最大個數

/**
 * machine
 */
class Feeder {
	private _isShutdown: boolean = false
	private _tasks_arr: Array<AsyncFunc> = []
	private _resolves_arr = []
	private _rejects_arr = []
	private _bus: EventEmitter = null
	constructor(bus: EventEmitter) {
		this._bus = bus
		this._bus.on("starve", (runner) => {
			//this.check(runner)
		})
	}
	feed(): Promise<AsyncFunc> {
		if (this._tasks_arr.length) {
			return Promise.resolve(this._tasks_arr.shift())
		}
		return new Promise((resolve, reject) => {
			this._resolves_arr.push(resolve)
			this._rejects_arr.push(reject)
		})
	}
	push(tasks: AsyncFunc | AsyncFunc[]) {
		if (!Array.isArray(tasks)) {
			tasks = [tasks]
		}
		tasks.forEach(item => {
			this._push1(item)
		})
	}
	_push1(task: AsyncFunc) {
		if (this._resolves_arr.length) {
			return this._resolves_arr.shift()(task)
		}
		this._tasks_arr.push(task)
	}
	shutdown(): void {
		this._isShutdown = true
		this._bus = null
		this._tasks_arr = []
		this._resolves_arr = []
		this._rejects_arr = []
	}
}

export default Feeder
