import { env } from 'process';
import os from 'os'

test('env.TEMP env exist', () => {

    if (process.platform !== "win32") {
        return
    }
    let tmp = env.TEMP

    expect(tmp).not.toBeUndefined()
    expect(tmp).not.toBeNull()

    expect(tmp?.length).toBeGreaterThan(0)
});

test('TEMP == os.tmpdir()', () => {
    if (process.platform !== "win32") {
        return
    }
    expect(env.TEMP).toEqual(os.tmpdir())
});

test('env["TEMP"] env exist part 2', () => {
    if (process.platform !== "win32") {
        return
    }

    let tmp = env['TEMP']

    expect(tmp).not.toBeUndefined()
    expect(tmp).not.toBeNull()

    expect(tmp?.length).toBeGreaterThan(0)
});