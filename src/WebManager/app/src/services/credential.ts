export class RegistryCredentials {
    basicAuth: string;
    username: string;
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
}