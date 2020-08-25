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
    readonly type: Type;
    readonly data: T | null = null;
    readonly message: string = '';
    readonly error: Error | null = null;

    private constructor(type: Type, data: T | null, message: string, error: Error | null) {
        this.type = type;
        this.data = data;
        this.message = message;
        this.error = error;
    }

    public static Success<V>(data: V | null) : Reliable<V> {
        const reliable = new Reliable<V>(Type.SUCCESS, data, "", null);
        return reliable;
    }

    public static Failed<V>(message: string, error?: Error , data? : V) : Reliable<V> {
        const reliable = new Reliable<V>(Type.FAILED, null, message, error || null);
        return reliable;
    }

    public static Custom<V>(type: Type, message: string, error?: Error, data? : V) : Reliable<V> {
        const reliable = new Reliable<V>(type, data || null, message, error || null);   
        return reliable;
    }
}