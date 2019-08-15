FROM mcr.microsoft.com/dotnet/core/aspnet:2.2-stretch-slim AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/core/sdk:2.2-stretch AS build
WORKDIR /src
COPY ["WebManager/WebManager.csproj", "WebManager/"]
RUN dotnet restore "WebManager/WebManager.csproj"
COPY . .
WORKDIR "/src/WebManager"
RUN dotnet build "WebManager.csproj" -c Release -o /app

FROM build AS publish
RUN dotnet publish "WebManager.csproj" -c Release -o /app

FROM base AS final
WORKDIR /app
COPY --from=publish /app .
ENTRYPOINT ["dotnet", "WebManager.dll"]