# Azure Container Registry Web Manager

# Running locally
Docker:
- `docker run -it -p 5050:80 azurecr/web-manager`

# Build instructions
- `cd src\ACRManager\`
- `npm install`
- `npm install -g gulp webpack`
- `dotnet restore`
- `dotnet run`
