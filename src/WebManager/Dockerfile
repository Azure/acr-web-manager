FROM mcr.microsoft.com/dotnet/core/aspnet:2.2-stretch-slim AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/core/sdk:2.2-stretch AS build
RUN apt-get update -yq && apt-get upgrade -yq && apt-get install -yq curl git nano
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash - && apt-get install -yq nodejs build-essential
RUN npm install -g npm
WORKDIR /src
COPY ["WebManager/WebManager.csproj", "WebManager/"]
RUN dotnet restore "WebManager/WebManager.csproj"
COPY . .
WORKDIR "/src/WebManager/app"
RUN rm -rf node_modules
RUN npm install
WORKDIR "/src/WebManager"

FROM build AS publish
RUN dotnet publish "WebManager.csproj" -c Release -o /app

FROM base AS final
WORKDIR /app
COPY --from=publish /app .
ENTRYPOINT ["dotnet", "WebManager.dll"]