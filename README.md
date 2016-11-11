# Azure Container Registry Web Manager

How to build:
- Open solution in Visual Studio
- Set build type to "IIS Express" to run natively, "Docker" to run in a container
- Build project
- `cd app`
- `npm install`
- `gulp watch`
- If built to run natively, run in visual studio
- If built for docker, run `docker run -it -p 5050:80 user/acrmanager`
