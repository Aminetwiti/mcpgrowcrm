# 🔧 Guide: Créer une vraie API REST pour GROWCRM

Ce guide vous montre comment créer une API REST propre et professionnelle dans GROWCRM pour améliorer le serveur MCP.

## 📋 Table des matières

1. [Pourquoi créer une API REST ?](#pourquoi)
2. [Architecture proposée](#architecture)
3. [Étape 1: Créer les contrôleurs API](#étape-1)
4. [Étape 2: Créer les routes API](#étape-2)
5. [Étape 3: Créer les Ressources API](#étape-3)
6. [Étape 4: Sécuriser l'API](#étape-4)
7. [Étape 5: Mettre à jour le MCP](#étape-5)

---

## 🤔 Pourquoi créer une API REST ?

Actuellement, le serveur MCP utilise les routes web de GROWCRM (`/clients/search`, etc.) qui :
- Retournent du HTML parfois
- Nécessitent l'authentification par session/cookies
- Ne sont pas optimisées pour l'API
- Mélangent logique web et API

Une vraie API REST vous permettra :
- ✅ Réponses JSON propres et cohérentes
- ✅ Authentification par token (Bearer)
- ✅ Versionning (`/api/v1/`)
- ✅ Rate limiting
- ✅ Documentation Swagger/OpenAPI
- ✅ Meilleure sécurité et performance

---

## 🏗️ Architecture proposée

```
application/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── API/
│   │   │       └── V1/
│   │   │           ├── ClientsController.php
│   │   │           ├── ProjectsController.php
│   │   │           ├── TasksController.php
│   │   │           ├── InvoicesController.php
│   │   │           ├── LeadsController.php
│   │   │           └── TicketsController.php
│   │   │
│   │   └── Resources/
│   │       └── V1/
│   │           ├── ClientResource.php
│   │           ├── ClientCollection.php
│   │           ├── ProjectResource.php
│   │           └── ...
│   │
│   └── Repositories/
│       └── (déjà existants)
│
└── routes/
    └── api.php  (à compléter)
```

---

## 📝 Étape 1: Créer les contrôleurs API

### Contrôleur de base pour l'API

Créez `app/Http/Controllers/API/ApiController.php` :

```php
<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class ApiController extends Controller
{
    /**
     * Réponse de succès
     */
    protected function success($data = null, $message = null, $code = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data
        ], $code);
    }

    /**
     * Réponse d'erreur
     */
    protected function error($message, $code = 400, $errors = null): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors
        ], $code);
    }

    /**
     * Réponse paginée
     */
    protected function paginated($paginator, $resourceClass): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $resourceClass::collection($paginator->items()),
            'pagination' => [
                'total' => $paginator->total(),
                'per_page' => $paginator->perPage(),
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem()
            ]
        ]);
    }
}
```

### Contrôleur Clients

Créez `app/Http/Controllers/API/V1/ClientsController.php` :

```php
<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\API\ApiController;
use App\Http\Resources\V1\ClientResource;
use App\Http\Resources\V1\ClientCollection;
use App\Repositories\ClientRepository;
use App\Http\Requests\ClientStoreRequest;
use Illuminate\Http\Request;

class ClientsController extends ApiController
{
    protected $clientrepo;

    public function __construct(ClientRepository $clientrepo)
    {
        $this->clientrepo = $clientrepo;
    }

    /**
     * Liste des clients
     * GET /api/v1/clients
     */
    public function index(Request $request)
    {
        // Paramètres de recherche
        request()->merge([
            'page' => $request->input('page', 1),
            'limit' => $request->input('limit', 25),
            'search' => $request->input('search'),
            'filter_category' => $request->input('category'),
            'source' => 'api'
        ]);

        // Récupérer les clients
        $clients = $this->clientrepo->search();

        return $this->paginated($clients, ClientResource::class);
    }

    /**
     * Détails d'un client
     * GET /api/v1/clients/{id}
     */
    public function show($id)
    {
        $client = $this->clientrepo->search($id);

        if (!$client) {
            return $this->error('Client non trouvé', 404);
        }

        return $this->success(new ClientResource($client));
    }

    /**
     * Créer un client
     * POST /api/v1/clients
     */
    public function store(ClientStoreRequest $request)
    {
        // Validation déjà faite par ClientStoreRequest
        $client = $this->clientrepo->create();

        if (!$client) {
            return $this->error('Erreur lors de la création du client', 500);
        }

        return $this->success(
            new ClientResource($client),
            'Client créé avec succès',
            201
        );
    }

    /**
     * Mettre à jour un client
     * PUT/PATCH /api/v1/clients/{id}
     */
    public function update(ClientStoreRequest $request, $id)
    {
        $client = $this->clientrepo->update($id);

        if (!$client) {
            return $this->error('Client non trouvé', 404);
        }

        return $this->success(
            new ClientResource($client),
            'Client mis à jour avec succès'
        );
    }

    /**
     * Supprimer un client
     * DELETE /api/v1/clients/{id}
     */
    public function destroy($id)
    {
        $result = $this->clientrepo->delete($id);

        if (!$result) {
            return $this->error('Erreur lors de la suppression', 500);
        }

        return $this->success(null, 'Client supprimé avec succès');
    }
}
```

### Répétez pour les autres contrôleurs

Créez de la même manière :
- `ProjectsController.php`
- `TasksController.php`
- `InvoicesController.php`
- `LeadsController.php`
- `TicketsController.php`

---

## 🛣️ Étape 2: Créer les routes API

Éditez `application/routes/api.php` :

```php
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes V1
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->middleware(['auth:sanctum'])->group(function () {
    
    // Informations utilisateur
    Route::get('/user', function (Request $request) {
        return response()->json([
            'success' => true,
            'data' => $request->user()
        ]);
    });

    // Clients
    Route::apiResource('clients', 'API\V1\ClientsController');
    
    // Projets
    Route::apiResource('projects', 'API\V1\ProjectsController');
    Route::get('projects/{id}/tasks', 'API\V1\ProjectsController@tasks');
    
    // Tâches
    Route::apiResource('tasks', 'API\V1\TasksController');
    Route::post('tasks/{id}/assign', 'API\V1\TasksController@assign');
    
    // Factures
    Route::apiResource('invoices', 'API\V1\InvoicesController');
    Route::get('invoices/{id}/pdf', 'API\V1\InvoicesController@downloadPdf');
    
    // Devis
    Route::apiResource('estimates', 'API\V1\EstimatesController');
    
    // Dépenses
    Route::apiResource('expenses', 'API\V1\ExpensesController');
    
    // Leads
    Route::apiResource('leads', 'API\V1\LeadsController');
    Route::post('leads/{id}/convert', 'API\V1\LeadsController@convertToClient');
    
    // Tickets
    Route::apiResource('tickets', 'API\V1\TicketsController');
    Route::post('tickets/{id}/reply', 'API\V1\TicketsController@reply');
    
    // Dashboard & Stats
    Route::get('dashboard/stats', 'API\V1\DashboardController@stats');
    Route::get('dashboard/income-expenses', 'API\V1\DashboardController@incomeExpenses');
    
    // Recherche globale
    Route::get('search', 'API\V1\SearchController@index');
});
```

---

## 📦 Étape 3: Créer les Ressources API

Les ressources transforment vos modèles en JSON propre.

### Resource de base

Créez `app/Http/Resources/V1/ClientResource.php` :

```php
<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Resources\Json\JsonResource;

class ClientResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray($request)
    {
        return [
            'id' => $this->client_id,
            'company_name' => $this->client_company_name,
            'first_name' => $this->client_first_name,
            'last_name' => $this->client_last_name,
            'email' => $this->client_email,
            'phone' => $this->client_phone,
            'website' => $this->client_website,
            'address' => [
                'street' => $this->client_address,
                'city' => $this->client_city,
                'state' => $this->client_state,
                'zip' => $this->client_zip,
                'country' => $this->client_country,
            ],
            'status' => $this->client_status,
            'created_at' => $this->client_created,
            'updated_at' => $this->client_updated,
            
            // Relations (si chargées)
            'category' => $this->whenLoaded('category'),
            'projects_count' => $this->when(isset($this->projects_count), $this->projects_count),
            'invoices_count' => $this->when(isset($this->invoices_count), $this->invoices_count),
        ];
    }
}
```

### Collection

Créez `app/Http/Resources/V1/ClientCollection.php` :

```php
<?php

namespace App\Http\Resources\V1;

use Illuminate\Http\Resources\Json\ResourceCollection;

class ClientCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     */
    public function toArray($request)
    {
        return [
            'data' => $this->collection,
            'meta' => [
                'total' => $this->total(),
                'count' => $this->count(),
                'per_page' => $this->perPage(),
                'current_page' => $this->currentPage(),
                'total_pages' => $this->lastPage()
            ]
        ];
    }
}
```

---

## 🔐 Étape 4: Sécuriser l'API

### Générer des tokens Sanctum

Créez `app/Http/Controllers/API/AuthController.php` :

```php
<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends ApiController
{
    /**
     * Générer un token d'accès
     * POST /api/auth/token
     */
    public function createToken(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'device_name' => 'required'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return $this->error('Identifiants invalides', 401);
        }

        $token = $user->createToken($request->device_name)->plainTextToken;

        return $this->success([
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ], 'Token créé avec succès');
    }

    /**
     * Révoquer le token actuel
     * POST /api/auth/revoke
     */
    public function revokeToken(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return $this->success(null, 'Token révoqué avec succès');
    }

    /**
     * Révoquer tous les tokens
     * POST /api/auth/revoke-all
     */
    public function revokeAllTokens(Request $request)
    {
        $request->user()->tokens()->delete();

        return $this->success(null, 'Tous les tokens ont été révoqués');
    }
}
```

Ajoutez les routes dans `routes/api.php` :

```php
// Routes publiques
Route::prefix('auth')->group(function () {
    Route::post('token', 'API\AuthController@createToken');
});

// Routes protégées
Route::prefix('auth')->middleware('auth:sanctum')->group(function () {
    Route::post('revoke', 'API\AuthController@revokeToken');
    Route::post('revoke-all', 'API\AuthController@revokeAllTokens');
});
```

### Rate Limiting

Éditez `app/Http/Kernel.php`, ajoutez dans `$middlewareGroups` :

```php
'api' => [
    \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
    'throttle:api',
    \Illuminate\Routing\Middleware\SubstituteBindings::class,
],
```

---

## 🔄 Étape 5: Mettre à jour le serveur MCP

Une fois l'API REST créée, mettez à jour `growcrm-mcp-server/index.js` :

```javascript
// Configuration
const API_VERSION = 'v1';
const API_PREFIX = `/api/${API_VERSION}`;

// Authentification par token
async function authenticate() {
    if (AUTH_MODE === 'token') {
        apiClient.defaults.headers.common['Authorization'] = 
            `Bearer ${process.env.GROWCRM_API_TOKEN}`;
        return true;
    } else {
        // Générer un token via l'API
        const response = await apiClient.post('/api/auth/token', {
            email: process.env.GROWCRM_EMAIL,
            password: process.env.GROWCRM_PASSWORD,
            device_name: 'mcp-server'
        });
        
        const token = response.data.data.token;
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        return true;
    }
}

// Mettre à jour les routes
async function handleToolCall(name, args) {
    switch (name) {
        case 'list_clients':
            return await makeApiRequest('GET', `${API_PREFIX}/clients`, args);
            
        case 'get_client':
            return await makeApiRequest('GET', `${API_PREFIX}/clients/${args.client_id}`);
            
        case 'create_client':
            return await makeApiRequest('POST', `${API_PREFIX}/clients`, args);
            
        // etc...
    }
}
```

---

## ✅ Tester l'API

### Avec cURL

```bash
# Générer un token
curl -X POST https://app.ty-dev.fr/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password",
    "device_name": "test"
  }'

# Utiliser le token
curl https://app.ty-dev.fr/api/v1/clients \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Accept: application/json"
```

### Avec Postman

1. Créez une nouvelle collection "GROWCRM API"
2. Ajoutez l'authentification Bearer Token
3. Testez les endpoints

---

## 📚 Documentation API (optionnel)

Installez Swagger/OpenAPI :

```bash
composer require darkaonline/l5-swagger
php artisan vendor:publish --provider "L5Swagger\L5SwaggerServiceProvider"
```

Ajoutez des annotations dans vos contrôleurs :

```php
/**
 * @OA\Get(
 *     path="/api/v1/clients",
 *     summary="Liste des clients",
 *     tags={"Clients"},
 *     security={{"bearerAuth":{}}},
 *     @OA\Response(response=200, description="Liste des clients")
 * )
 */
public function index() { ... }
```

Générez la doc :

```bash
php artisan l5-swagger:generate
```

Accédez à `/api/documentation`

---

## 🎉 Conclusion

Vous avez maintenant une API REST professionnelle pour GROWCRM !

**Avantages :**
- ✅ Réponses JSON cohérentes
- ✅ Authentification par token sécurisée
- ✅ Versionning de l'API
- ✅ Rate limiting
- ✅ Documentation auto-générée
- ✅ Meilleur MCP server

**Prochaines étapes :**
- Ajouter des tests unitaires
- Implémenter le cache Redis
- Ajouter des webhooks
- Créer des endpoints pour les rapports
