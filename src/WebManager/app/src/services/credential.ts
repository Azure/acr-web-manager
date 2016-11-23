export class BasicCredentials {
    basicAuth: string;
    username: string;
}

export class BearerCredentials {
    refreshToken: string;
}

export class AADCredentials {
    access: string;
    refresh: string;
    scope: string;
    resource: string;
    expiresOn: number;
}

export class CredentialService {
    private storagePrefix: string = "ACRManager/Portal/";

    getBasicCredentials(reg: string): BasicCredentials {
        let v: any = sessionStorage.getItem(this.storagePrefix + "BasicCredential/" + reg);
        return v ? <BasicCredentials>JSON.parse(v) : null;
    }

    setBasicCredentials(reg: string, v: BasicCredentials): void {
        sessionStorage.setItem(this.storagePrefix + "BasicCredential/" + reg, JSON.stringify(v));
    }

    getBearerCredentials(reg: string): BearerCredentials {
        let v: any = sessionStorage.getItem(this.storagePrefix + "BearerCredential/" + reg);
        return v ? <BearerCredentials>JSON.parse(v) : null;
    }

    setBearerCredentials(reg: string, v: BearerCredentials): void {
        sessionStorage.setItem(this.storagePrefix + "BearerCredential/" + reg, JSON.stringify(v));
    }

    getAADCredentials(): AADCredentials {
        let v: any = sessionStorage.getItem(this.storagePrefix + "AADCredential");
        return v ? <AADCredentials>JSON.parse(v) : null;
    }

    setAADCredentials(v: AADCredentials): void {
        sessionStorage.setItem(this.storagePrefix + "AADCredential", JSON.stringify(v));
    }
}