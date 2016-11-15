# Azure Container Registry Web Manager

# Running locally
Docker:
- `docker run -it -p 5050:80 azurecr/web-manager`

# Build instructions
- `cd src/ACRManager`
- `npm install`
- `npm install -g gulp webpack`
- `dotnet restore`
- `dotnet run`

# To build a Docker image:
- Follow previous instructions up to `dotnet run`
- `dotnet publish -c Release`
- `docker build -t acrmanager bin/Release/netcoreapp1.0/publish`
- `docker run -p 5000:80 -it --rm acrmanager`

![alt Web Manager animation](docs/assets/web-manager.gif)