import { env } from 'process';
import os from 'os'

test('env.TEMP env exist', () => {

    let tmp = env.TEMP

    expect(tmp).not.toBeUndefined()
    expect(tmp).not.toBeNull()

    expect(tmp?.length).toBeGreaterThan(0)
});

test('TEMP == os.tmpdir()', () => {
    expect(env.TEMP).toEqual(os.tmpdir())
});

test('env["TEMP"] env exist part 2', () => {

    let tmp = env['TEMP']

    expect(tmp).not.toBeUndefined()
    expect(tmp).not.toBeNull()

    expect(tmp?.length).toBeGreaterThan(0)
});