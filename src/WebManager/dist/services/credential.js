"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var RegistryCredentials = (function () {
    function RegistryCredentials() {
    }
    return RegistryCredentials;
}());
exports.RegistryCredentials = RegistryCredentials;
var CredentialService = (function () {
    function CredentialService() {
        this.storagePrefix = "ACRManager/Portal/";
    }
    CredentialService.prototype.getRegistryCredentials = function (reg) {
        var v = sessionStorage.getItem(this.storagePrefix + "RegistryCredential/" + reg);
        return v ? JSON.parse(v) : null;
    };
    CredentialService.prototype.setRegistryCredentials = function (reg, v) {
        sessionStorage.setItem(this.storagePrefix + "RegistryCredential/" + reg, JSON.stringify(v));
    };
    return CredentialService;
}());
exports.CredentialService = CredentialService;
//# sourceMappingURL=credential.js.map