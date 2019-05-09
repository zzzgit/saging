import {waterfall} from "kaze"


const add = (n:number):Promise<number>=>{
	return Promise.resolve(n+1)
}

waterfall([add, add], 1).then(data=>console.log(3333, data)).catch(e=>console.log(222, e))
