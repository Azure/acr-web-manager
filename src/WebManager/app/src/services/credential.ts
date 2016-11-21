export class RegistryCredentials {
    basicAuth: string;
    username: string;
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

    getRegistryCredentials(reg: string): RegistryCredentials {
        let v: any = sessionStorage.getItem(this.storagePrefix + "RegistryCredential/" + reg);
        return v ? <RegistryCredentials>JSON.parse(v) : null;
    }

    setRegistryCredentials(reg: string, v: RegistryCredentials): void {
        sessionStorage.setItem(this.storagePrefix + "RegistryCredential/" + reg, JSON.stringify(v));
    }

    getAADCredentials(): AADCredentials {
        let v: any = sessionStorage.getItem(this.storagePrefix + "AADCredential");
        return v ? <AADCredentials>JSON.parse(v) : null;
    }

    setAADCredentials(v: AADCredentials): void {
        sessionStorage.setItem(this.storagePrefix + "AADCredential", JSON.stringify(v));
    }
}