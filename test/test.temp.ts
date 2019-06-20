import Saging from "../src/Saging"

let i = 0
const task = (): Promise<any> => {
	return new Promise((resolve) => {
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
sag.threads = 1
