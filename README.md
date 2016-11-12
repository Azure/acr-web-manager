# Azure Container Registry Web Manager

# Running locally
Docker:
- `docker run -it -p 5050:80 azurecr/web-manager`

# Build instructions
- `cd src\ACRManager\app`
- `npm install`
- `gulp`

Visual Studio:
- Open src\ACRManager\ACRManager.sln in Visual Studio
- Set build type to "IIS Express" to run natively, "Docker" to run in a container
- Start debugging
- If built using docker, the image can be run manually:
- `docker run -it -p 5050:80 user/acrmanager`

Command-line:
- `cd src\ACRManager`
- `dotnet restore`
- `dotnet run`
