export class SPNCredential {
    basicAuth: string;
    username: string;
}

export class CredentialService {
    private storagePrefix: string = "ACRManager/Portal/";

    getSPNCredential(reg: string): SPNCredential {
        let v: any = sessionStorage.getItem(this.storagePrefix + "SPNCredential/" + reg);
        return v ? <SPNCredential>JSON.parse(v) : null;
    }

    setSPNCredential(reg: string, v: SPNCredential): void {
        sessionStorage.setItem(this.storagePrefix + "SPNCredential/" + reg, JSON.stringify(v));
    }
}