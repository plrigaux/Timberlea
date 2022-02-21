
import { Resolver } from '../filePathResolver'
import os from 'os'
import path from 'path'

const TEMP = "TEMP"
const HOME = "HOME"

describe('FileResolver', () => {
    test('init', () => {
        Resolver.instance
    });

    test('Home Keys', () => {
        let home = Resolver.instance.root()
        //console.log(home)
        expect(home.sort()).toEqual(["HOME", 'TEMP', 'Storage'].sort());
    });

    test('test keys valid HOME', () => {
        let home = Resolver.instance.getPath("HOME")
        expect(home).not.toBeUndefined()
    });

    test('test keys valid TEMP', () => {
        let tmpDir = Resolver.instance.getPath("TEMP")
        expect(tmpDir).not.toBeUndefined()
        expect(tmpDir).toEqual(os.tmpdir())
    });


    test('test keys unvalid', () => {
        let donotexist = Resolver.instance.getPath("Sure it doesn't exist")
        expect(donotexist).toBeUndefined()
    });

    test('resolve a PATH', () => {

        const ext = "some_dir/and other dir"
        let pathTest = "TEMP/" + ext
        let pathResolved = Resolver.instance.resolve(pathTest)
        expect(pathResolved?.getFullPath()).toEqual(path.join(os.tmpdir(), ext))
    });


    test('resolve a PATH fail key', () => {

        const ext = "some_dir/and other dir"
        let pathTest = "TEMP_WTGE/" + ext
        let pathResolved = Resolver.instance.resolve(pathTest)
        expect(pathResolved).toBeNull()
    });

    test('resolve a PATH  empty string', () => {
        let pathResolved = Resolver.instance.resolve("")
        expect(pathResolved).toBeNull()
    });

    test('resolve a PATH - Key only', () => {
        let pathTest = "TEMP"
        let pathResolved = Resolver.instance.resolve(pathTest)
        expect(pathResolved?.getFullPath()).toEqual(path.join(os.tmpdir()))
    });

    test('resolve a PATH - Key only /', () => {
        let pathTest = "TEMP/"
        let pathResolved = Resolver.instance.resolve(pathTest)
        expect(pathResolved?.getFullPath()).toEqual(path.join(os.tmpdir()))
    });

    test('resolve a PATH - Key only \\', () => {
        let pathTest = "TEMP\\"
        let pathResolved = Resolver.instance.resolve(pathTest)
        expect(pathResolved?.getFullPath()).toEqual(path.join(os.tmpdir()))
    });


    test('resolve a PATH - .. fail on key', () => {
        const ext = ".."
        let pathTest = "TEMP/" + ext
        let pathResolved = Resolver.instance.resolve(pathTest)
        expect(pathResolved).toBeNull()
    });


    test('resolve a PATH - ..', () => {
        const ext = "test/.."
        let pathTest = "TEMP/" + ext
        let pathResolved = Resolver.instance.resolve(pathTest)
        expect(pathResolved?.getFullPath()).toEqual(path.join(os.tmpdir()))
    });

})

describe('Path to key Path', () => {
    test('replaceWithKey a PATH - TEMP', () => {
        const ext = "test"
        let pathTest = path.join(os.tmpdir() , ext)
        let pathReplaced = Resolver.instance.replaceWithKey(pathTest)
        expect(pathReplaced).toEqual(path.join(TEMP, ext))
    });

    test('replaceWithKey a PATH - TEMP', () => {
        const ext = "/test/"
        let pathTest = path.join(os.tmpdir() , ext)
        let pathReplaced = Resolver.instance.replaceWithKey(pathTest)
        expect(pathReplaced).toEqual(path.join(TEMP, ext))
        console.warn(pathReplaced)
    });

    test('replaceWithKey a PATH - HOME', () => {
        const ext = "/test/"
        let pathTest = path.join(os.homedir() , ext)
        let pathReplaced = Resolver.instance.replaceWithKey(pathTest)
        expect(pathReplaced).toEqual(path.join(HOME, ext))
        console.warn(pathReplaced)
    });
})