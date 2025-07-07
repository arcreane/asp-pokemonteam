using System.Text.Json;
using Microsoft.AspNetCore.Http;


/// <summary>
/// Provides extension methods to store and retrieve complex objects in session.
/// </summary>
/// <author>
/// Elerig
/// </author>
public static class SessionHelper
{
    public static void SetObject<T>(this ISession session, string key, T value)
    {
        var json = JsonSerializer.Serialize(value);
        session.SetString(key, json);
    }

    public static T? GetObject<T>(this ISession session, string key)
    {
        var json = session.GetString(key);
        return json == null ? default : JsonSerializer.Deserialize<T>(json);
    }
}
