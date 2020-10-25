/* tslint:disable:max-classes-per-file */

import { sendAt } from 'cron';
import { Document, Schema, model } from 'mongoose'

export interface IDomain {
    name: string;
    displayName: string;
    url: string;
}

export class Domain implements IDomain {
    public name: string;
    public displayName: string;
    public baseUrl: string;
    public url: string;


    public constructor(name: string, currentUrl: string, displayName: string = '', baseUrl: string = '') {
        this.name = name;
        this.url = currentUrl;
        this.displayName = displayName;
        this.baseUrl = baseUrl;
    }

}

export class AliAggregatorDomain extends Domain {
    constructor(url: string = 'https://tindiaphuong.org') {
        super('tin-dia-phuong', url, 'Tin địa phương', 'https://tindiaphuong.org')
    }
}

export class BaoMoiAggregatorDomain extends Domain {
    constructor(url: string) {
        super('baomoi.com', url, 'Báo mới', 'https://baomoi.com');
    }
}