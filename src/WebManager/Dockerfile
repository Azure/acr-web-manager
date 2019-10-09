FROM mcr.microsoft.com/dotnet/core/aspnet:3.0.0-buster-slim AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/core/sdk:3.0.100-buster AS build
RUN apt-get update -yq && apt-get upgrade -yq && apt-get install -yq curl git nano nuget
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash - && apt-get install -yq nodejs build-essential
RUN npm install -g npm
WORKDIR /src
COPY . .
WORKDIR "/src/WebManager/app"
RUN rm -rf node_modules
RUN npm install
WORKDIR "/src/WebManager"
RUN dotnet restore
RUN dotnet build -c Release -o /app --no-restore

FROM build AS publish
RUN dotnet publish "WebManager.csproj" -c Release -o /app --no-restore

FROM base AS final
WORKDIR /app
COPY --from=publish /app .
ENTRYPOINT ["dotnet", "WebManager.dll"]
