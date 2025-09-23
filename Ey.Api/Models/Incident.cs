namespace Ey.Api.Models;

public class Incident
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string Severity { get; set; } = "Low"; // Low/Med/High
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
