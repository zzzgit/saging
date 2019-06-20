import * as EventEmitter from "events"
import Saging from "./Saging"
import AsyncFunc from "./type/AsyncFunc"


/**
 * life circle: created (requesting executing done) deprecated shutdown
 */
class Digester {
	private _saging: Saging
	private _bus!: EventEmitter
	private _isDeprecated: boolean=false
	public get bus(): EventEmitter {
		return this._bus
	}
	public set bus(bus: EventEmitter) {
		this._bus = bus
	}
	private _isShutdown: boolean = false
	private _isIdle: boolean = true
	public get isIdle(): boolean {
		return this._isIdle
	}
	constructor(saging: Saging, bus: EventEmitter) {
		this._saging = saging
		this.bus = bus
	}
	run(): void {
		if (this._isShutdown) {
			return undefined
		}
		if (this._isDeprecated) {
			this.bus.emit("readyToRemove", this)
			return undefined
		}
		this._request().then((task) => {
			this._isIdle = false
			return task()
		})
			.then(() => {
			// 執行完畢 event, 執行失敗也許處理
				this.bus.emit("done", this)
				this._isIdle = true
				process.nextTick(() => {
					this.run()
				})
				return undefined
			})
			.catch(() => {
			// this.bus.emit("starved", this)
			})
	}
	_request(): Promise<AsyncFunc> {
		return this._saging.feed()
	}
	deprecate():void {
		this._isDeprecated = true
	}
	shutdown(): void {
		this._isShutdown = true
		// this._saging = null
		this._isIdle = true
		// this.bus = null
	}
}

export default Digester
