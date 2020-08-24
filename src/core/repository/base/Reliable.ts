export enum Type {
    /**
     * Trả data thành công cùng data
     */
    SUCCESS,

    /**
     * Trả data thất bại cùng exception và message
     */
    FAILED
}

/**
 * Trả về data cùng (hoặc) một vài thông tin về kết quả của hành động vừa thực hiện
 * Usage: Tạo bằng cách gọi Reliable.Success(), Reliable.Failed() hoặc Reliable.Custom()
 */
export class Reliable<T> {
    private _type: Type;
    private _data: T | null = null;
    private _message: string = '';
    private _error: Error | null = null;

    private constructor(type: Type) {
        this._type = type;
    }

    get type(): Type {
        try {

        } catch (e) {
            this._error = e;
        }
        return this._type;
    }

    get data(): T | null {
        return this._data;
    }

    get message(): string {
        return this._message;
    }

    get error(): Error | null {
        return this._error;
    }

    public static Success<V>(data: V | null) : Reliable<V> {
        const reliable = new Reliable<V>(Type.SUCCESS);
        reliable._data = data;
        return reliable;
    }

    public static Failed<V>(message: string, error?: Error , data? : V) : Reliable<V> {
        const reliable = new Reliable<V>(Type.FAILED);

        reliable._message = message;
        reliable._error = error || null;
        reliable._data = data || null;

        return reliable;
    }

    public static Custom<V>(type: Type, message: string, error?: Error , data? : V) : Reliable<V> {
        const reliable = new Reliable<V>(type);

        reliable._message = message;
        reliable._error = error || null;
        reliable._data = data || null;
        
        return reliable;
    }
}