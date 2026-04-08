using YourOrg.Observability;

var builder = WebApplication.CreateBuilder(args);

// Add observability middleware
builder.Services.AddObservability();

var app = builder.Build();

// Configure middleware
app.UseObservabilityLogging();
app.MapObservabilityHealth("example-service", () => Task.FromResult(true));

// Example endpoints
app.MapGet("/api/users", () =>
{
    var logger = ObservabilityLogger.Default;
    logger.Info("Fetching users list", new { route = "/api/users" });
    
    return new[] 
    { 
        new { id = 1, name = "Alice" },
        new { id = 2, name = "Bob" },
    };
});

app.MapGet("/api/users/{id}", (int id) =>
{
    var logger = ObservabilityLogger.Default;
    logger.Info($"Fetching user {id}", new { user_id = id.ToString(), route = $"/api/users/{id}" });
    
    return new { id, name = $"User {id}" };
});

app.MapPost("/api/users", (UserCreateRequest request) =>
{
    var logger = ObservabilityLogger.Default;
    
    if (string.IsNullOrEmpty(request.Name))
    {
        logger.Warn("User creation failed - missing name", new { route = "/api/users", status_code = 400 });
        return Results.BadRequest(new { error = "Name required" });
    }
    
    logger.Info("User created successfully", new { route = "/api/users", status_code = 201 });
    return Results.Created("/api/users/3", new { id = 3, name = request.Name });
});

app.MapGet("/api/error", () =>
{
    throw new InvalidOperationException("Intentional test error");
});

app.Run();

record UserCreateRequest(string Name);
