
import { HOME_ResolverPath, resolver } from '../filePathResolver'
import os from 'os'
import path from 'path'
import { testUtils as tu } from './testUtils'
import { FileServerError } from '../common/fileServerCommon'
import { FSErrorCode } from '../common/constants'


describe('FileResolver', () => {
    test('init', () => {

    });

    test('Home Keys', () => {
        let home = resolver.root()
        //console.log(home)
        expect(home.sort()).toEqual(["HOME", 'TEMP', 'Storage'].sort());
    });

    test('test keys valid HOME', () => {
        let home = resolver.resolve("HOME")
        expect(home).not.toBeUndefined()
    });

    test('test keys valid TEMP', () => {
        let tmpDir = resolver.resolve("TEMP")
        expect(tmpDir).not.toBeUndefined()
        expect(tmpDir.server).toEqual(os.tmpdir())
    });


    test('test keys unvalid', () => {
        let donotexist = undefined
        try {
            donotexist = resolver.resolve("Sure it doesn't exist")
        } catch (e) {

        }

        expect(donotexist).toBeUndefined()
    });

    test('resolve a PATH', () => {

        const ext = "some_dir/and other dir"
        let pathTest = "TEMP/" + ext
        let pathResolved = resolver.resolve(pathTest)
        expect(pathResolved?.server).toEqual(path.join(os.tmpdir(), ext))
    });


    test('resolve a PATH fail key', () => {

        const ext = "some_dir/and other dir"
        let key = "TEMP_WTGE"
        let pathTest = key + "/" + ext
        expect(() => {
            resolver.resolve(pathTest)
        }).toThrow(new FileServerError(`Key "${key}" unresoled`, FSErrorCode.KEY_UNRESOLVED))
    });

    test('resolve a PATH - Key only', () => {
        let pathTest = "TEMP"
        let pathResolved = resolver.resolve(pathTest)
        expect(pathResolved?.server).toEqual(path.join(os.tmpdir()))
    });

    test('resolve a PATH - Key only /', () => {
        let pathTest = "TEMP/"
        let pathResolved = resolver.resolve(pathTest)
        expect(pathResolved?.server).toEqual(path.join(os.tmpdir()))
    });

    test('resolve a PATH - Key only \\', () => {
        let pathTest = "TEMP\\"
        expect(() => {
            resolver.resolve(pathTest)
        }).toThrow(new FileServerError(`Key "${pathTest}" unresoled`, FSErrorCode.KEY_UNRESOLVED))

    });


    test('resolve a PATH - .. fail on key', () => {
        const ext = tu.PATH_LEVEL_UP
        let pathTest = "TEMP/" + ext
        let pathResolved = resolver.resolve(pathTest)
        expect(pathResolved).toEqual(HOME_ResolverPath)
    });

    test('resolve a PATH - ..', () => {
        const ext = "test/.."
        let pathTest = tu.TEMP + "/" + ext
        let pathResolved = resolver.resolve(pathTest)
        expect(pathResolved?.server).toEqual(path.join(os.tmpdir()))
    });
})

describe('Around Home Tests', () => {

    test('resolve a PATH  empty string', () => {
        let pathResolved = resolver.resolve("")
        expect(pathResolved).toEqual(HOME_ResolverPath)
    });

    test('ROOT', () => {

        let rPath = resolver.resolve("")

        expect(rPath).toEqual(HOME_ResolverPath)
    });

    test('ROOT 2', () => {

        let rPath = resolver.resolve("/")

        expect(rPath).toEqual(HOME_ResolverPath)
    });

    test('Resolve TEMP', () => {

        let rPath = resolver.resolve(tu.HOME_ROOT, tu.TEMP)
        let rPath2 = HOME_ResolverPath.add(tu.TEMP)

        expect(rPath).toEqual(rPath2)
    });

    test('Resolve TEMP 2', () => {

        let rPath = resolver.resolve(tu.HOME_ROOT, tu.TEMP)
        let rPath2 = resolver.resolve(tu.TEMP)

        expect(rPath).toEqual(rPath2)
    });

    test('Back to Root', () => {

        let rPath = resolver.resolve(tu.TEMP, tu.PATH_LEVEL_UP)
        let rPath2 = HOME_ResolverPath

        expect(rPath).toEqual(rPath2)
    });

    test('Back to Root', () => {

        let rPath = resolver.resolve(tu.TEMP, tu.PATH_LEVEL_UP)
        let rPath2 = HOME_ResolverPath

        expect(rPath).toEqual(rPath2)
    });

    test('Back to Root ../..', () => {

        let rPath = resolver.resolve(tu.TEMP + "/somthing", tu.PATH_LEVEL_UP + "/" + tu.PATH_LEVEL_UP)
        let rPath2 = HOME_ResolverPath

        expect(rPath).toEqual(rPath2)
    });

    test('Back to Root ../.. 2', () => {

        let rPath = resolver.resolve(tu.TEMP + "/somthing", tu.PATH_LEVEL_UP, tu.PATH_LEVEL_UP)
        let rPath2 = HOME_ResolverPath

        expect(rPath).toEqual(rPath2)
    });

    test('Back to Root ../../..', () => {

        let rPath = resolver.resolve(tu.TEMP + "/somthing", tu.PATH_LEVEL_UP + "/" + tu.PATH_LEVEL_UP + "/" + tu.PATH_LEVEL_UP)
        let rPath2 = HOME_ResolverPath

        expect(rPath).toEqual(rPath2)
    });

    test('Back to Root ../../..', () => {

        let rPath = resolver.resolve(tu.TEMP + "/somthing", tu.PATH_LEVEL_UP, tu.PATH_LEVEL_UP, tu.PATH_LEVEL_UP)
        let rPath2 = HOME_ResolverPath

        expect(rPath).toEqual(rPath2)
    });


})

describe('Modifications', () => {
    test('Add a file', () => {
        const ext = "some_dir/and other dir"
        let key = "TEMP"
        let pathTest = key + "/" + ext

        let rPath = resolver.resolve(pathTest)

        let add = "newFile.txt"
        let rPath2 = rPath.add(add)

        expect(rPath2.basename).toEqual("newFile.txt")
        expect(rPath2.ext).toEqual("txt")
        expect(rPath2.basenameNoExt).toEqual("newFile")
        expect(rPath2.network).toEqual(pathTest + "/" + add)
    });

    test('Add file in dir', () => {
        const ext = "some_dir/and other dir"
        let key = "TEMP"
        let pathTest = key + "/" + ext

        let rPath = resolver.resolve(pathTest)

        let add = "dir/newFile.txt"
        let rPath2 = rPath.add(add)


        expect(rPath2.basename).toEqual("newFile.txt")
        expect(rPath2.ext).toEqual("txt")
        expect(rPath2.basenameNoExt).toEqual("newFile")
        expect(rPath2.network).toEqual(pathTest + "/" + add)
    });

    test('Add file in dir in a dir', () => {
        const ext = "some_dir/and other dir"
        let key = "TEMP"
        let pathTest = key + "/" + ext

        let rPath = resolver.resolve(pathTest)

        let add = "dir/dir/dir/newFile.txt"
        let rPath2 = rPath.add(add)

        expect(rPath2.basename).toEqual("newFile.txt")
        expect(rPath2.ext).toEqual("txt")
        expect(rPath2.basenameNoExt).toEqual("newFile")
        expect(rPath2.network).toEqual(pathTest + "/" + add)
    });

    test('Add file in dir in a dir with slash', () => {
        const ext = "some_dir/and other dir"
        let key = "TEMP"
        let pathTest = key + "/" + ext

        let rPath = resolver.resolve(pathTest)

        let add = "/dir/dir/dir/newFile.txt"
        let rPath2 = rPath.add(add)

        expect(rPath2.basename).toEqual("newFile.txt")
        expect(rPath2.ext).toEqual("txt")
        expect(rPath2.basenameNoExt).toEqual("newFile")
        expect(rPath2.network).toEqual(pathTest + add)
    });

    test('File withou ext', () => {
        const ext = "some_dir/newFile"
        let key = "TEMP"
        let pathTest = key + "/" + ext

        let rPath = resolver.resolve(pathTest)

        expect(rPath.basename).toEqual("newFile")
        expect(rPath.ext).toEqual("")
        expect(rPath.basenameNoExt).toEqual("newFile")
    });
})