import Feeder from "./Feeder"
import Digester from "./Digester"
import AsyncFunc from "./type/AsyncFunc"
import {EventEmitter} from "events"


/**	// apply state machine 
 * life circle : changing concurrency
 */
class Saging {
	private _bus: EventEmitter;
	private _feeder!: Feeder;
	private _runners_arr: Digester[] = []
	private _isShutdown: boolean = false
	public get threads() :number {
		return this._runners_arr.length
	}
	public set threads(number: number) {
		console.log(`..........---${number}`)
		if (number === this.threads) {
			return
		}
		if (number < 1) {
			throw new Error("number should not be less than 1")
		}
		if (number > this.threads) {
			this._addRunner(number - this.threads)
			return
		}
		this._deprecate(this.threads - number)
	}
	constructor(n?: number) {
		this._bus = new EventEmitter()
		this._bus.on("done", () => {
		})
		this._bus.on("readyToRemove", (runner) => {
			this._remove(runner)
		})
		this._bus.on("starved", () => {
			// this._remove(runner)
		})
		n = n || 1
		this._init(n)
	}
	push(tasks: AsyncFunc | AsyncFunc[]):void {
		if (this._isShutdown) {
			throw new Error("already shutdown")
		}
		if (!tasks) {
			return undefined
		}
		this._feeder.push(tasks)
	}
	_deprecate(n: number) :void{
		const border = this.threads - n
		for (let i = this.threads-1; i >= border; i--) {
			this._runners_arr[i].deprecate()
		}
	}
	_addRunner(n: number):void {
		const temp_arr: Digester[] = []
		for (let i = 0; i < n; i++) {
			const digester = new Digester(this, this._bus)
			temp_arr.push(digester)
			this._runners_arr.push(digester)
		}
		temp_arr.forEach((runner) => {
			runner.run()
		})
	}
	feed(): Promise<AsyncFunc> {
		if (this._isShutdown) {
			return Promise.reject(new Error("already shut down"))
		}
		return this._feeder.feed()
	}
	_remove(runner: Digester):void {
		const index_n = this._runners_arr.indexOf(runner)
		this._runners_arr.splice(index_n, 1)
		runner.shutdown()
	}
	_init(n: number): void{
		this._feeder = new Feeder(this._bus)
		this._addRunner(n)
	}
	shutdown(): void {
		this._isShutdown = true
		this._feeder.shutdown()
		this._runners_arr.forEach((runner) => {
			runner.shutdown()
		})
	}
}

export default Saging
