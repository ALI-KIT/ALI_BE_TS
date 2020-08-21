import PQueue from 'p-queue';
import '@mongodb'

const pq = new PQueue()
pq.add(async () => {
    setTimeout(() => {
        console.log("--1--")
    }, 2000); 
});
pq.add(async () => {
    setTimeout(() => {
        console.log("--2--")
    }, 1500); 
});
const end =async () => {
    setTimeout(() => {
        console.log("--3--")
    }, 500); 
};
(async () => await pq.add(end))()

pq.add(async () => {
    setTimeout(() => {
        console.log("--4--")
    }, 100); 
});



console.log("hello world");