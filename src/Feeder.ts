import * as EventEmitter from "events"
import AsyncFunc from "./type/AsyncFunc"
import Resolve from "./type/Resolve"
import Reject from "./type/Reject"


//	如果傳入參數本身是promise，則不用傳asyncFunc
//	任務池最大個數

/**
 * machine
 */
class Feeder {
	// private _isShutdown: boolean = false
	private _tasks_arr: AsyncFunc[] = []
	private _resolves_arr: Resolve[] = []
	private _rejects_arr: Reject[] = []
	private _bus: EventEmitter
	constructor(bus: EventEmitter) {
		this._bus = bus
		this._bus.on("starve", () => {
			// this.check(runner)
		})
	}
	feed(): Promise<AsyncFunc> {
		if (this._tasks_arr.length) {
			const item = this._tasks_arr.shift()
			if (item) {
				return Promise.resolve(item)
			}
		}
		return new Promise((resolve: Resolve, reject: Reject) => {
			this._resolves_arr.push(resolve)
			this._rejects_arr.push(reject)
		})
	}
	push(tasks: AsyncFunc | AsyncFunc[]): void {
		if (!Array.isArray(tasks)) {
			tasks = [tasks]
		}
		tasks.forEach((item) => {
			this._push1(item)
		})
	}
	_push1(task: AsyncFunc): void {
		if (this._resolves_arr.length) {
			const item = this._resolves_arr.shift()
			return item && item(task)
		}
		this._tasks_arr.push(task)
	}
	shutdown(): void {
		// this._isShutdown = true
		// this._bus = undefined
		this._tasks_arr = []
		this._resolves_arr = []
		this._rejects_arr = []
	}
}

export default Feeder
