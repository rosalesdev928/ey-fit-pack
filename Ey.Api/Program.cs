using Ey.Api.Data;
using Ey.Api.Models;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ----- DB: usa SQLite por defecto (app.db) y SQL Server si la cadena lo indica -----
var cs = builder.Configuration.GetConnectionString("Default") ?? "Data Source=app.db";

builder.Services.AddDbContext<AppDb>(opt =>
{
    // Si la cadena parece de SQL Server (tiene Server= o Initial Catalog=) => SQL Server
    if (cs.Contains("Server=", StringComparison.OrdinalIgnoreCase) ||
        cs.Contains("Initial Catalog=", StringComparison.OrdinalIgnoreCase))
        opt.UseSqlServer(cs);
    else
        opt.UseSqlite(cs); // por defecto SQLite local
});

// ----- CORS (Vite + agrega luego tu dominio de Static Web Apps) -----
builder.Services.AddCors(opt => opt.AddDefaultPolicy(p => p
    .AllowAnyHeader()
    .AllowAnyMethod()
    .WithOrigins(
        "http://localhost:5173",
        "http://127.0.0.1:5173"
        // "https://<TU-SWA>.azurestaticapps.net"
    )));

var app = builder.Build();

// ----- Migrar y sembrar datos demo -----
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDb>();
    db.Database.Migrate();
    if (!db.Incidents.Any())
    {
        db.AddRange(
            new Incident { Title = "Login bug", Severity = "High" },
            new Incident { Title = "Slow report", Severity = "Med" }
        );
        db.SaveChanges();
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();

// ----- Validación sencilla -----
static bool IsValid(Incident x, out string err)
{
    if (string.IsNullOrWhiteSpace(x.Title)) { err = "Title is required."; return false; }
    if (x.Title.Length > 200)              { err = "Title max length is 200."; return false; }
    var sev = new[] { "Low", "Med", "High" };
    if (!sev.Contains(x.Severity))         { err = "Severity must be Low | Med | High."; return false; }
    err = ""; return true;
}

// ----- CRUD completo -----
app.MapGet("/api/incidents", async (AppDb db) =>
    await db.Incidents.OrderByDescending(x => x.Id).ToListAsync());

app.MapGet("/api/incidents/{id:int}", async (AppDb db, int id) =>
{
    var it = await db.Incidents.FindAsync(id);
    return it is null ? Results.NotFound() : Results.Ok(it);
});

app.MapPost("/api/incidents", async (AppDb db, Incident x) =>
{
    if (!IsValid(x, out var err)) return Results.BadRequest(new { error = err });
    db.Add(x);
    await db.SaveChangesAsync();
    return Results.Created($"/api/incidents/{x.Id}", x);
});

app.MapPut("/api/incidents/{id:int}", async (AppDb db, int id, Incident dto) =>
{
    var it = await db.Incidents.FindAsync(id);
    if (it is null) return Results.NotFound();

    it.Title = dto.Title;
    it.Severity = dto.Severity;

    if (!IsValid(it, out var err)) return Results.BadRequest(new { error = err });

    await db.SaveChangesAsync();
    return Results.Ok(it);
});

app.MapDelete("/api/incidents/{id:int}", async (AppDb db, int id) =>
{
    var it = await db.Incidents.FindAsync(id);
    if (it is null) return Results.NotFound();
    db.Remove(it);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.Run();
