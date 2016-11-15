# Azure Container Registry Web Manager

The ACR Web Manager enables you to view metadata about your respositories and tags stored in your Azure Container Registry. You can find out more information about Azure Container Registry [here](https://azure.microsoft.com/services/container-registry).
 

## Running locally in Docker 

```bash
$ docker run -it -p 5000:80 azurecr/web-manager
```

## Build instructions

```bash
$ cd src/ACRManager
$ npm install
$ npm install -g gulp webpack
$ dotnet restore
$ dotnet run
```

## Buiding the Docker image:

- Follow previous instructions up to `dotnet run`

```bash
$ dotnet publish -c Release
$ docker build -t acrmanager bin/Release/netcoreapp1.0/publish
$ docker run -p 5000:80 -it --rm acrmanager
```

![alt Web Manager animation](docs/assets/web-manager.gif)
