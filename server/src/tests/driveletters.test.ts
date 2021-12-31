import * as wdl from 'windows-drive-letters'

describe('Windows driveLetters', () => {

    test('get driveletter', async () => { 
        const letters = await wdl.used()
        console.log(letters)
    })

    test('get free drive letter', async () => { 
        const letters = await wdl.free()
        console.log(letters)
    })
})