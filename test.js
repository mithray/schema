const merge = require('deepmerge')

a = {a:'a',c:'b'}
b = {d:'2',f:'9'}


c = merge(a,b)

console.log(c)
console.log(a)
console.log(b)
