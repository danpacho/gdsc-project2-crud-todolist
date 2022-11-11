const STORAGE_KEYS: string[] = []

class Storage<T> {
    #key: string
    constructor({ key }: { key: string }) {
        if (this.#isDuplicatedKey(key)) {
            throw new Error(
                `${key} is already used. Please choose another key name`
            )
        }
        this.#key = key
        STORAGE_KEYS.push(this.#key)
    }

    #isDuplicatedKey(key: string) {
        return STORAGE_KEYS.find((k) => k === key) !== undefined
    }

    #isValidAccess(key: string) {
        const isFindError = STORAGE_KEYS.find((k) => k === key) === undefined
        if (isFindError) {
            throw Error(
                `${key} is not initailized. Can't not access ${key} storage.`
            )
        }
        return true
    }

    get(key: string): T | null {
        if (this.#isValidAccess(key)) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return JSON.parse(localStorage.getItem(key)!) as T
        }
        return null
    }

    set(key: string, value: T): void {
        if (this.#isValidAccess(key)) {
            const toStringValues = JSON.stringify(value)
            localStorage.setItem(key, toStringValues)
        }
        return
    }

    remove(key: string): void {
        if (this.#isValidAccess(key)) {
            localStorage.removeItem(key)
        }
        return
    }
}

type StorageAction<T> = [() => T | null, (value: T) => void, () => void]
/**
 * @param key unique key to access web storage
 * @returns storage actions, like `signal` actions
 */
const useStorage = <T>(key: string): StorageAction<T> => {
    const storage = new Storage<T>({ key })
    const getter = () => storage.get(key)
    const setter = (value: T) => {
        storage.set(key, value)
    }
    const resetter = () => {
        storage.remove(key)
    }
    return [getter, setter, resetter]
}

export { useStorage }
