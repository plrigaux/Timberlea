import fs, { Dirent, Stats } from 'fs';
import util from 'util';





//readFilePromise2().then(data => { console.log(data)})

const tOut = (t: number) => {
    return new Promise<string>((resolve, reject) => {
        setTimeout(() => {
            resolve(`Completed in ${t}`)
        }, t)
    })
}

// Resolving a normal promise
tOut(1000).then(result => console.log(result + "<br>"))
// Completed in 1000

// Promise.all
Promise.all([tOut(1000), tOut(2000)]).then(result => console.log("All results", result))


const emails = ['alice@gmail.com', 'bob@gmail.com', 'charlie@gmail.com'];

const send = (email: string) => {
    new Promise(resolve =>
        setTimeout(() => resolve(email), 1000)
    );
}

const sendAllEmails = () => {
    for (let email of emails) {
        const emailInfo = send(email);
        console.log(`Mail sent to ${emailInfo}`);
    }
    console.log('All emails were sent');
};

sendAllEmails();

console.log('\n-----------------------------\n');

const send2 = (email: string) => {
    new Promise(resolve =>
        setTimeout(() => resolve(email), 1000)
    );
}
const sendAllEmails2 = async () => {
    for (let email of emails) {
        const emailInfo = send2(email);
        console.log(`2 - Mail sent to ${emailInfo}`);
    }
    console.log('2 - All emails were sent');
};
sendAllEmails2();

console.log('\n-----------------------------\n');

const delay = (milliseconds: number) => {
    console.log(`Waiting: ${milliseconds / 1000} seconds.`);

    return new Promise<number>((resolve) => {
        setTimeout(() => {
            resolve(milliseconds);
        }, milliseconds);
    });
}

const delays = [1000, 2000, 5000, 3000, 500, 12000];
const startTime = Date.now();

const doNextPromise = (d: number) => {
    delay(delays[d])
        .then((x: number) => {
            console.log(`Waited: ${x / 1000} seconds\n`);
            d++; if (d < delays.length)
                doNextPromise(d)
            else
                console.log(`Total: ${(Date.now() - startTime) / 1000} seconds.`);
        })
}

//doNextPromise(0);

Promise.all(
    delays.map(d => delay(d))
)
    .then(() => console.log('Waited enough!'));