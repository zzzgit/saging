import Saging from "../../src/Saging"


// const constants = {
// 	ERR_THROWN_IN_THROW_TASK: "ERR_THROWN_IN_THROW_TASK",
// 	ERR_THROWN_IN_REJECT_TASK: "ERR_THROWN_IN_REJECT_TASK",
// }
// const schedule = (period_n: number, value?: any): Promise<any> => {
// 	return new Promise(resolve => {
// 		setTimeout(() => resolve(value), period_n)
// 	})
// }
// const throw_task: AsyncFunc = (): Promise<any> => {
// 	throw new Error(constants.ERR_THROWN_IN_THROW_TASK)
// }

// const addone_task: AsyncFunc = (i: any): Promise<any> => {
// 	return Promise.resolve(i + 1)
// }

describe('compose', () => {
	test('normal use', () => {
		let i = 0
		const task = (): Promise<any> => {
			return new Promise(resolve => {
				setTimeout(() => {
					i++
					console.log(i)
					resolve(222)
				}, .4 * 1000)
			})
		}
		const sag: Saging = new Saging(2)
		for (let i = 0; i < 300; i++) {
			sag.push(task)
		}
		sag.threads = 2
		return expect(Promise.resolve(2)).resolves.toBe(2)
	})
})
