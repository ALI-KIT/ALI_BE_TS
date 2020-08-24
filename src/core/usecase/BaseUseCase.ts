import { injectable } from 'inversify';

/**
 * 1 Use case là một object thực hiện một tính năng cơ bản độc lập
 */
@injectable()
export abstract class BaseUsecase<Param, Result> {
    abstract async invoke(param: Param): Promise<Result>
}

/**
 * 1 Use case là một object thực hiện một tính năng cơ bản độc lập
 * NOTE: Đây là UseCase đặc biệt: Không có tham số
 */
@injectable()
export abstract class BaseUsecaseNoParam<Result> {
    abstract async invoke(): Promise<Result>
}