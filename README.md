EY Fit Pack — API .NET 8 + EF Core + React (Vite)

Monorepo con API .NET 8 (Minimal API + EF Core) y frontend React (Vite).
Incluye CRUD, CORS, Swagger, y workflows de GitHub Actions para CI/CD.

🧱 Stack

Backend: .NET 8, EF Core, Minimal API, Swagger

DB: SQLite para dev / SQL Server para prod (selección automática por cadena de conexión)

Frontend: React + Vite

CI/CD: GitHub Actions (API + Static Web Apps)

📁 Estructura
ey-fit-pack/
├─ Ey.Api/              # API .NET 8 (Minimal API + EF Core)
│  ├─ appsettings*.json
│  └─ Program.cs
├─ ey-client/           # Frontend React (Vite)
├─ .github/workflows/   # Pipelines de CI/CD
├─ .gitignore
└─ global.json

🚀 Ejecución local
Requisitos

.NET 8 SDK

Node 18+ (recomendado 20)

SQL Server (opcional, solo si quieres usarlo en lugar de SQLite)

1) Backend (Ey.Api)

Desde la carpeta raíz:

cd Ey.Api
dotnet restore


Configura conexión (dev):

SQLite (por defecto) → no necesitas nada; si la cadena contiene Data Source= se usa SQLite.

SQL Server (opcional) → crea/edita appsettings.Development.json:

{
  "ConnectionStrings": {
    "Default": "Server=localhost,1433;Database=EyFitPack;User Id=sa;Password=TuPasswordFuerte;TrustServerCertificate=True;"
  },
  "Cors": {
    "AllowedOrigins": [ "http://localhost:5173" ]
  }
}


El código de la API selecciona el proveedor automáticamente:
si la cadena contiene Data Source= ➜ SQLite; en otro caso ➜ SQL Server.

Inicializa DB (opcional si ya existe):

dotnet tool install --global dotnet-ef
dotnet ef database update   # si tienes migraciones


Levanta la API:

dotnet run


Swagger: http://localhost:5073/swagger
 (puerto puede variar; revisa la consola)

Health: /healthz

2) Frontend (ey-client)

En otra terminal:

cd ey-client
npm install


Crea .env (frontend) con la URL de tu API:

VITE_API_BASE_URL=http://localhost:5073


Arranca:

npm run dev


App en: http://localhost:5173

🔗 Consumo desde el frontend

Ejemplo de llamada a la API desde React:

const API = import.meta.env.VITE_API_BASE_URL;

async function listItems() {
  const res = await fetch(`${API}/api/items`);
  if (!res.ok) throw new Error("API error");
  return res.json();
}


Endpoints exactos: revísalos en Swagger de la API.

🧪 Scripts útiles
API
# dentro de Ey.Api
dotnet build
dotnet run
dotnet ef migrations add Init
dotnet ef database update

Frontend
# dentro de ey-client
npm run dev
npm run build
npm run preview

🔒 Variables y configuración
Backend (Ejemplos)

appsettings.Development.json

{
  "ConnectionStrings": { "Default": "Data Source=app.db" },
  "Cors": { "AllowedOrigins": [ "http://localhost:5173" ] }
}

Frontend

.env

VITE_API_BASE_URL=http://localhost:5073


No subas credenciales ni .env al repo.

🤖 CI/CD (GitHub Actions)

En .github/workflows/ vienen los pipelines listos para:

Compilar y testear API y Front.

Desplegar:

API a tu servicio (App Service / contenedor).

Frontend a Azure Static Web Apps (o el hosting que configures).

Edita los secretos del repo (Settings → Secrets and variables → Actions) con tus credenciales (por ejemplo, AZURE_*, SWA_TOKEN, etc.), según los workflows.

🗺️ Roadmap

Autenticación (JWT)

Paginación y filtros en el CRUD

Validaciones/flujos de error unificados

Pruebas unitarias e2e

Infra como código (Bicep/Terraform)

📝 Licencia

MIT (o la que elijas)
