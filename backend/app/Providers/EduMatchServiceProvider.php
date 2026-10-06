<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Domain\Student\Repositories\StudentRepositoryInterface;
use App\Infrastructure\Repositories\EloquentStudentRepository;
use App\Domain\SisuCandidate\Repositories\SisuCandidateRepositoryInterface;
use App\Infrastructure\Repositories\EloquentSisuCandidateRepository;
use App\Domain\Matching\Repositories\MatchingResultRepositoryInterface;
use App\Infrastructure\Repositories\EloquentMatchingResultRepository;
use App\Domain\Dataset\Repositories\DatasetVersionRepositoryInterface;
use App\Infrastructure\Repositories\EloquentDatasetVersionRepository;
use App\Application\Services\MlServiceClient;
use App\Infrastructure\Http\MlServiceHttpClient;

class EduMatchServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(StudentRepositoryInterface::class, EloquentStudentRepository::class);
        $this->app->bind(SisuCandidateRepositoryInterface::class, EloquentSisuCandidateRepository::class);
        $this->app->bind(MatchingResultRepositoryInterface::class, EloquentMatchingResultRepository::class);
        $this->app->bind(DatasetVersionRepositoryInterface::class, EloquentDatasetVersionRepository::class);
        $this->app->bind(MlServiceClient::class, MlServiceHttpClient::class);
    }

    public function boot(): void
    {
        //
    }
}
