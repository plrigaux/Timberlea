
import Resolver from '../filePathResolver'
import os from 'os'
import path from 'path'


describe('FileResolver', () => {
    test('init', () => {
        Resolver.instance
    });

    test('Home Keys', () => {
        let home = Resolver.instance.root()
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
        expect(pathResolved).toEqual(path.join(os.tmpdir(), ext))
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
        expect(pathResolved).toEqual(path.join(os.tmpdir()))
    });

    test('resolve a PATH - Key only /', () => {
        let pathTest = "TEMP/"
        let pathResolved = Resolver.instance.resolve(pathTest)
        expect(pathResolved).toEqual(path.join(os.tmpdir()))
    });

    test('resolve a PATH - Key only \\', () => {
        let pathTest = "TEMP\\"
        let pathResolved = Resolver.instance.resolve(pathTest)
        expect(pathResolved).toEqual(path.join(os.tmpdir()))
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
        expect(pathResolved).toEqual(path.join(os.tmpdir()))
    });


})