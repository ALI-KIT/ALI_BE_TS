"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebDomain = exports.Domain = void 0;
class Domain {
    constructor(name, currentUrl, displayName = '', baseUrl = '') {
        this.name = name;
        this.url = currentUrl;
        this.displayName = displayName;
        this.baseUrl = baseUrl;
    }
}
exports.Domain = Domain;
class WebDomain extends Domain {
    constructor() {
        super(...arguments);
        this.priority = 5;
    }
}
exports.WebDomain = WebDomain;
