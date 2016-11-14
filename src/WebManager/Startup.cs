using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using WebManager.Services;

namespace WebManager
{
    public class Startup
    {
        public Startup(IHostingEnvironment env)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true);

            if (env.IsEnvironment("Development"))
            {
                // This will push telemetry data through Application Insights pipeline faster, allowing you to view results immediately.
                builder.AddApplicationInsightsSettings(developerMode: true);
            }

            builder.AddEnvironmentVariables();
            Configuration = builder.Build();
        }

        public IConfigurationRoot Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container
        public void ConfigureServices(IServiceCollection services)
        {
            // Add framework services.
            services.AddApplicationInsightsTelemetry(Configuration);

            services.AddMvc().AddWebApiConventions();

            services.AddSingleton(typeof(DockerApiService));

            services.AddOptions();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            loggerFactory.AddConsole(Configuration.GetSection("Logging"));
            loggerFactory.AddDebug();

            app.UseApplicationInsightsRequestTelemetry();

            app.UseApplicationInsightsExceptionTelemetry();

            app.UseStaticFiles();

            app.UseMvc(routes =>
            {
                routes.MapRoute("ACRManager.API.Catalog",
                    "api/v2/_catalog",
                    new { controller = "Api", action = "Catalog" }
                );
                routes.MapRoute("ACRManager.API.Manifest",
                    "api/v2/{repo}/manifests/{tag}",
                    new { controller = "Api", action = "Manifest" }
                );
                routes.MapRoute("ACRManager.API.ListTags",
                    "api/v2/{name}/tags/list",
                    new { controller = "Api", action = "ListTags" }
                );
                routes.MapRoute("ACRManager.API.VerifyCredential",
                    "api/v2",
                    new { controller = "Api", action = "VerifyCredential" }
                );

                routes.MapRoute("default0",
                    "",
                    new { controller = "App", action = "Index" }
                );
                routes.MapRoute("default1",
                    "{a}",
                    new { controller = "App", action = "Index" }
                );
                routes.MapRoute("default2",
                    "{a}/{b}",
                    new { controller = "App", action = "Index" }
                );
            });
        }
    }
}