
import { HOME_ResolverPath, Resolver } from '../filePathResolver'
import os from 'os'
import path from 'path'
import { testUtils as tu } from './testUtils'
import { FileServerError } from '../common/fileServerCommon'
import { FSErrorCode } from '../common/constants'


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
        expect(pathResolved?.getPathServer()).toEqual(path.join(os.tmpdir(), ext))
    });


    test('resolve a PATH fail key', () => {

        const ext = "some_dir/and other dir"
        let key = "TEMP_WTGE"
        let pathTest = key + "/" + ext
        expect(() => {
            Resolver.instance.resolve(pathTest)
        }).toThrow(new FileServerError(`Key "${key}" unresoled`, FSErrorCode.KEY_UNRESOLVED))


    });



    test('resolve a PATH - Key only', () => {
        let pathTest = "TEMP"
        let pathResolved = Resolver.instance.resolve(pathTest)
        expect(pathResolved?.getPathServer()).toEqual(path.join(os.tmpdir()))
    });

    test('resolve a PATH - Key only /', () => {
        let pathTest = "TEMP/"
        let pathResolved = Resolver.instance.resolve(pathTest)
        expect(pathResolved?.getPathServer()).toEqual(path.join(os.tmpdir()))
    });

    test('resolve a PATH - Key only \\', () => {
        let pathTest = "TEMP\\"
        let pathResolved = Resolver.instance.resolve(pathTest)
        expect(pathResolved?.getPathServer()).toEqual(path.join(os.tmpdir()))
    });


    test('resolve a PATH - .. fail on key', () => {
        const ext = tu.PATH_LEVEL_UP
        let pathTest = "TEMP/" + ext
        let pathResolved = Resolver.instance.resolve(pathTest)
        expect(pathResolved).toEqual(HOME_ResolverPath)
    });

    test('resolve a PATH - ..', () => {
        const ext = "test/.."
        let pathTest = tu.TEMP + "/" + ext
        let pathResolved = Resolver.instance.resolve(pathTest)
        expect(pathResolved?.getPathServer()).toEqual(path.join(os.tmpdir()))
    });
})

describe('Path to key Path', () => {
    test('replaceWithKey a PATH - TEMP', () => {
        const ext = "test"
        let pathTest = path.join(os.tmpdir(), ext)
        let pathReplaced = Resolver.instance.replaceWithKey(pathTest)
        expect(pathReplaced).toEqual(path.join(tu.TEMP, ext))
    });

    test('replaceWithKey a PATH - TEMP', () => {
        const ext = "/test/"
        let pathTest = path.join(os.tmpdir(), ext)
        let pathReplaced = Resolver.instance.replaceWithKey(pathTest)
        expect(pathReplaced).toEqual(path.join(tu.TEMP, ext))
        console.warn(pathReplaced)
    });

    test('replaceWithKey a PATH - HOME', () => {
        const ext = "/test/"
        let pathTest = path.join(os.homedir(), ext)
        let pathReplaced = Resolver.instance.replaceWithKey(pathTest)
        expect(pathReplaced).toEqual(path.join(tu.HOME, ext))
        console.warn(pathReplaced)
    });
})


describe('Around Home Tests', () => {

    test('resolve a PATH  empty string', () => {
        let pathResolved = Resolver.instance.resolve("")
        expect(pathResolved).toEqual(HOME_ResolverPath)
    });

    test('ROOT', () => {

        let rPath = Resolver.instance.resolve("")

        expect(rPath).toEqual(HOME_ResolverPath)
    });

    test('ROOT 2', () => {

        let rPath = Resolver.instance.resolve("/")

        expect(rPath).toEqual(HOME_ResolverPath)
    });


    test('Resolve TEMP', () => {

        let rPath = Resolver.instance.resolve(tu.HOME_ROOT, tu.TEMP)
        let rPath2 = HOME_ResolverPath.add(tu.TEMP)

        expect(rPath).toEqual(rPath2)
    });

    test('Resolve TEMP 2', () => {

        let rPath = Resolver.instance.resolve(tu.HOME_ROOT, tu.TEMP)
        let rPath2 = Resolver.instance.resolve(tu.TEMP)

        expect(rPath).toEqual(rPath2)
    });

    test('Back to Root', () => {

        let rPath = Resolver.instance.resolve(tu.TEMP, tu.PATH_LEVEL_UP)
        let rPath2 = HOME_ResolverPath

        expect(rPath).toEqual(rPath2)
    });

    test('Back to Root', () => {

        let rPath = Resolver.instance.resolve(tu.TEMP, tu.PATH_LEVEL_UP)
        let rPath2 = HOME_ResolverPath

        expect(rPath).toEqual(rPath2)
    });

    test('Back to Root ../..', () => {

        let rPath = Resolver.instance.resolve(tu.TEMP + "/somthing", tu.PATH_LEVEL_UP + "/" + tu.PATH_LEVEL_UP)
        let rPath2 = HOME_ResolverPath

        expect(rPath).toEqual(rPath2)
    });

    test('Back to Root ../.. 2', () => {

        let rPath = Resolver.instance.resolve(tu.TEMP + "/somthing", tu.PATH_LEVEL_UP, tu.PATH_LEVEL_UP)
        let rPath2 = HOME_ResolverPath

        expect(rPath).toEqual(rPath2)
    });

    test('Back to Root ../../..', () => {

        let rPath = Resolver.instance.resolve(tu.TEMP + "/somthing", tu.PATH_LEVEL_UP + "/" + tu.PATH_LEVEL_UP + "/" + tu.PATH_LEVEL_UP)
        let rPath2 = HOME_ResolverPath

        expect(rPath).toEqual(rPath2)
    });

    test('Back to Root ../../..', () => {

        let rPath = Resolver.instance.resolve(tu.TEMP + "/somthing", tu.PATH_LEVEL_UP, tu.PATH_LEVEL_UP, tu.PATH_LEVEL_UP)
        let rPath2 = HOME_ResolverPath

        expect(rPath).toEqual(rPath2)
    });

})