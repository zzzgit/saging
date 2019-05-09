import {repeat, compose} from "kaze"
import AsyncFunc from "kaze/built/t/type/AsyncFunc"


// const constants = {
// 	ERR_THROWN_IN_THROW_TASK: "ERR_THROWN_IN_THROW_TASK",
// 	ERR_THROWN_IN_REJECT_TASK: "ERR_THROWN_IN_REJECT_TASK",
// }
// const schedule = (period_n: number, value?: any): Promise<any> => {
// 	return new Promise(resolve => {
// 		setTimeout(() => resolve(value), period_n)
// 	})
// }

const addone_task: AsyncFunc = (i: any): Promise<any> => {
	return Promise.resolve(i + 1)
}
// const throw_task: AsyncFunc = (): Promise<any> => {
// 	throw new Error(constants.ERR_THROWN_IN_THROW_TASK)
// }
// const invalidAyncFunc = (): number => 3333


describe('compose', () => {
	test('normal use', () => {
		return expect(compose([addone_task, addone_task])(1)).resolves.toBe(3)
	})
	test('with empty task array', () => {
		return expect(compose([])(3)).resolves.toBe(3)
	})
})
describe('repeat', () => {
	test('normal use', () => {
		let i = 0
		const add = (): Promise<number> => {
			return Promise.resolve(i++)
		}
		return expect(repeat(add, 3).then(() => (i == 3))).resolves.toBe(true)
	})
	test('normal use, noop', () => {
		let i = 0
		const add = (): Promise<number> => {
			return Promise.resolve(i++)
		}
		return expect(repeat(add, -1).then(() => (i == 0))).resolves.toBe(true)
	})
})
