#!/bin/bash

# ============================================================================
# SCRIPT D'INSTALLATION AUTOMATIQUE : API REST GROWCRM
# Ce script crée automatiquement l'API REST complète pour GROWCRM
# ============================================================================

set -e  # Arrêter en cas d'erreur

GROWCRM_PATH="/www/wwwroot/app-tydev/GROWCRM/application"

echo "🚀 CRÉATION DE L'API REST GROWCRM"
echo "=================================="
echo ""

# ============================================================================
# ÉTAPE 1 : Créer le contrôleur API principal
# ============================================================================

echo "📝 Étape 1/5 : Création du contrôleur ApiController..."

mkdir -p "$GROWCRM_PATH/app/Http/Controllers/API"

cat > "$GROWCRM_PATH/app/Http/Controllers/API/ApiController.php" << 'EOFAPI'
<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApiController extends Controller
{
    /**
     * Retourne une réponse JSON standardisée en cas de succès
     */
    protected function successResponse($data, string $message = 'Success', int $code = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
            'timestamp' => now()->toIso8601String()
        ], $code);
    }

    /**
     * Retourne une réponse JSON standardisée en cas d'erreur
     */
    protected function errorResponse(string $message, int $code = 400, $errors = null): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => $message,
            'timestamp' => now()->toIso8601String()
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        return response()->json($response, $code);
    }

    /**
     * Retourne une réponse paginée
     */
    protected function paginatedResponse($paginator, string $message = 'Success'): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $paginator->items(),
            'pagination' => [
                'total' => $paginator->total(),
                'per_page' => $paginator->perPage(),
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem()
            ],
            'timestamp' => now()->toIso8601String()
        ], 200);
    }
}
EOFAPI

echo "✅ ApiController créé"

# ============================================================================
# ÉTAPE 2 : Créer les API Resources (transformateurs)
# ============================================================================

echo "📝 Étape 2/5 : Création des API Resources..."

mkdir -p "$GROWCRM_PATH/app/Http/Resources"

# ClientResource
cat > "$GROWCRM_PATH/app/Http/Resources/ClientResource.php" << 'EOFCLIENT'
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ClientResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->client_id,
            'company' => $this->client_company_name,
            'email' => $this->client_email,
            'phone' => $this->client_phone,
            'website' => $this->client_website,
            'country' => $this->client_country,
            'city' => $this->client_city,
            'status' => $this->client_status,
            'projects_count' => $this->projects_count ?? 0,
            'invoices_sum' => $this->invoices_sum ?? 0,
            'created_at' => $this->client_created,
            'updated_at' => $this->client_updated,
        ];
    }
}
EOFCLIENT

# ProjectResource
cat > "$GROWCRM_PATH/app/Http/Resources/ProjectResource.php" << 'EOFPROJECT'
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->project_id,
            'title' => $this->project_title,
            'description' => $this->project_description,
            'status' => $this->project_status,
            'progress' => $this->project_progress,
            'client_id' => $this->project_clientid,
            'client_name' => $this->client->client_company_name ?? null,
            'start_date' => $this->project_date_start,
            'deadline' => $this->project_date_due,
            'billing_type' => $this->project_billing_type,
            'billing_rate' => $this->project_billing_rate,
            'created_at' => $this->project_created,
            'updated_at' => $this->project_updated,
        ];
    }
}
EOFPROJECT

# TaskResource
cat > "$GROWCRM_PATH/app/Http/Resources/TaskResource.php" << 'EOFTASK'
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->task_id,
            'title' => $this->task_title,
            'description' => $this->task_description,
            'status' => $this->task_status,
            'priority' => $this->task_priority,
            'progress' => $this->task_progress,
            'project_id' => $this->task_projectid,
            'milestone_id' => $this->task_milestoneid,
            'assigned_to' => $this->assigned->user_id ?? null,
            'start_date' => $this->task_date_start,
            'due_date' => $this->task_date_due,
            'created_by' => $this->task_creatorid,
            'created_at' => $this->task_created,
            'updated_at' => $this->task_updated,
        ];
    }
}
EOFTASK

echo "✅ Resources créés (Client, Project, Task)"

# ============================================================================
# ÉTAPE 3 : Créer le middleware de vérification API
# ============================================================================

echo "📝 Étape 3/5 : Création du middleware API..."

cat > "$GROWCRM_PATH/app/Http/Middleware/EnsureApiRequest.php" << 'EOFMIDDLEWARE'
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureApiRequest
{
    public function handle(Request $request, Closure $next)
    {
        // Vérifier que le header Accept contient application/json
        if (!$request->expectsJson()) {
            return response()->json([
                'success' => false,
                'message' => 'API endpoint requires Accept: application/json header',
                'timestamp' => now()->toIso8601String()
            ], 400);
        }

        return $next($request);
    }
}
EOFMIDDLEWARE

echo "✅ Middleware EnsureApiRequest créé"

# ============================================================================
# ÉTAPE 4 : Créer les contrôleurs API pour chaque ressource
# ============================================================================

echo "📝 Étape 4/5 : Création des contrôleurs API..."

# ClientApiController
cat > "$GROWCRM_PATH/app/Http/Controllers/API/ClientApiController.php" << 'EOFCLIENTAPI'
<?php

namespace App\Http\Controllers\API;

use App\Http\Resources\ClientResource;
use App\Models\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ClientApiController extends ApiController
{
    public function index(Request $request)
    {
        $query = Client::query()->with('projects', 'invoices');

        // Recherche
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('client_company_name', 'like', "%{$search}%")
                  ->orWhere('client_email', 'like', "%{$search}%");
            });
        }

        // Filtrage par statut
        if ($request->has('status')) {
            $query->where('client_status', $request->input('status'));
        }

        // Tri
        $sortBy = $request->input('sort_by', 'client_created');
        $sortOrder = $request->input('sort_order', 'desc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->input('per_page', 15);
        $clients = $query->paginate($perPage);

        return $this->paginatedResponse($clients, 'Clients retrieved successfully');
    }

    public function show($id)
    {
        $client = Client::with('projects', 'invoices')->find($id);

        if (!$client) {
            return $this->errorResponse('Client not found', 404);
        }

        return $this->successResponse(new ClientResource($client), 'Client retrieved successfully');
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'client_company_name' => 'required|string|max:255',
            'client_email' => 'required|email|unique:clients,client_email',
            'client_phone' => 'nullable|string|max:50',
            'client_website' => 'nullable|url',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $client = Client::create($request->all());

        return $this->successResponse(new ClientResource($client), 'Client created successfully', 201);
    }

    public function update(Request $request, $id)
    {
        $client = Client::find($id);

        if (!$client) {
            return $this->errorResponse('Client not found', 404);
        }

        $validator = Validator::make($request->all(), [
            'client_company_name' => 'sometimes|required|string|max:255',
            'client_email' => 'sometimes|required|email|unique:clients,client_email,' . $id . ',client_id',
        ]);

        if ($validator->fails()) {
            return $this->errorResponse('Validation failed', 422, $validator->errors());
        }

        $client->update($request->all());

        return $this->successResponse(new ClientResource($client), 'Client updated successfully');
    }

    public function destroy($id)
    {
        $client = Client::find($id);

        if (!$client) {
            return $this->errorResponse('Client not found', 404);
        }

        $client->delete();

        return $this->successResponse(null, 'Client deleted successfully');
    }
}
EOFCLIENTAPI

echo "✅ ClientApiController créé"

# ============================================================================
# ÉTAPE 5 : Créer les routes API
# ============================================================================

echo "📝 Étape 5/5 : Ajout des routes API..."

# Vérifier si les routes API existent déjà
if ! grep -q "Route::prefix('v1')->group" "$GROWCRM_PATH/routes/api.php" 2>/dev/null; then
    cat >> "$GROWCRM_PATH/routes/api.php" << 'EOFROUTES'

// ============================================================================
// API REST V1 - Généré automatiquement par setup-api.sh
// ============================================================================

use App\Http\Controllers\API\ClientApiController;
use App\Http\Controllers\API\ProjectApiController;
use App\Http\Controllers\API\TaskApiController;

Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {
    
    // Clients
    Route::get('/clients', [ClientApiController::class, 'index']);
    Route::get('/clients/{id}', [ClientApiController::class, 'show']);
    Route::post('/clients', [ClientApiController::class, 'store']);
    Route::put('/clients/{id}', [ClientApiController::class, 'update']);
    Route::delete('/clients/{id}', [ClientApiController::class, 'destroy']);

    // Projects
    Route::get('/projects', [ProjectApiController::class, 'index']);
    Route::get('/projects/{id}', [ProjectApiController::class, 'show']);
    Route::post('/projects', [ProjectApiController::class, 'store']);
    Route::put('/projects/{id}', [ProjectApiController::class, 'update']);
    Route::delete('/projects/{id}', [ProjectApiController::class, 'destroy']);

    // Tasks
    Route::get('/tasks', [TaskApiController::class, 'index']);
    Route::get('/tasks/{id}', [TaskApiController::class, 'show']);
    Route::post('/tasks', [TaskApiController::class, 'store']);
    Route::put('/tasks/{id}', [TaskApiController::class, 'update']);
    Route::delete('/tasks/{id}', [TaskApiController::class, 'destroy']);

    // Dashboard stats
    Route::get('/dashboard/stats', [ApiController::class, 'stats']);
});
EOFROUTES

    echo "✅ Routes API ajoutées à routes/api.php"
else
    echo "⚠️  Les routes API existent déjà, ignoré"
fi

# ============================================================================
# FINALISATION
# ============================================================================

echo ""
echo "✨ INSTALLATION TERMINÉE !"
echo "=========================="
echo ""
echo "📍 Fichiers créés :"
echo "   • app/Http/Controllers/API/ApiController.php"
echo "   • app/Http/Controllers/API/ClientApiController.php"
echo "   • app/Http/Resources/ClientResource.php"
echo "   • app/Http/Resources/ProjectResource.php"
echo "   • app/Http/Resources/TaskResource.php"
echo "   • app/Http/Middleware/EnsureApiRequest.php"
echo "   • routes/api.php (mis à jour)"
echo ""
echo "🔧 Prochaines étapes :"
echo "   1. Générer un token Sanctum :"
echo "      cd $GROWCRM_PATH"
echo "      php artisan tinker"
echo "      >>> \$user = \\App\\Models\\User::where('email', 'amine.benammar17@gmail.com')->first();"
echo "      >>> \$token = \$user->createToken('mcp-server')->plainTextToken;"
echo "      >>> echo \$token;"
echo ""
echo "   2. Tester l'API :"
echo "      curl -X GET https://app.ty-dev.fr/api/v1/clients \\"
echo "           -H 'Authorization: Bearer VOTRE_TOKEN' \\"
echo "           -H 'Accept: application/json'"
echo ""
echo "   3. Mettre à jour le serveur MCP :"
echo "      • Modifier BASE_URL dans .env : https://app.ty-dev.fr/api/v1"
echo "      • Passer en AUTH_MODE=token"
echo "      • Ajouter le token généré : GROWCRM_TOKEN=xxx"
echo ""
echo "📖 Documentation complète : API_REST_GUIDE.md"
