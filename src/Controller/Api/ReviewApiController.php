<?php

declare(strict_types=1);

namespace App\Controller\Api;

use App\Marketplace\Exception\MarketplaceApiException;
use App\Marketplace\MarketplaceApiClient;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Contracts\HttpClient\HttpClientInterface;

final class ReviewApiController extends AbstractController
{
    public function __construct(
        private readonly MarketplaceApiClient $apiClient,
        private readonly HttpClientInterface $httpClient,
        private readonly string $auth0Domain,
    ) {
    }

    public function submit(Request $request, string $package): JsonResponse
    {
        $authHeader = $request->headers->get('Authorization', '');
        if (!str_starts_with($authHeader, 'Bearer ')) {
            return $this->json(['error' => 'Missing or invalid Authorization header.'], Response::HTTP_UNAUTHORIZED);
        }

        $token = substr($authHeader, 7);

        $userInfo = $this->validateAuth0Token($token);
        if (null === $userInfo) {
            return $this->json(['error' => 'Invalid or expired token.'], Response::HTTP_UNAUTHORIZED);
        }

        $body = json_decode($request->getContent(), true);
        if (!\is_array($body)) {
            return $this->json(['error' => 'Invalid request body.'], Response::HTTP_BAD_REQUEST);
        }

        $rating = isset($body['rating']) ? (int) $body['rating'] : 0;
        $review = isset($body['review']) ? trim((string) $body['review']) : '';

        if ($rating < 1 || $rating > 5) {
            return $this->json(['error' => 'Rating must be between 1 and 5.'], Response::HTTP_BAD_REQUEST);
        }

        if ('' === $review) {
            return $this->json(['error' => 'Review text is required.'], Response::HTTP_BAD_REQUEST);
        }

        try {
            $this->apiClient->submitReview(
                $package,
                $userInfo['sub'],
                $userInfo['name'] ?? $userInfo['email'] ?? 'Anonymous',
                $userInfo['picture'] ?? null,
                $rating,
                $review,
            );
        } catch (MarketplaceApiException $e) {
            return $this->json(['error' => 'Failed to submit review.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        return $this->json(['success' => true], Response::HTTP_CREATED);
    }

    /**
     * @return array<string, mixed>|null
     */
    private function validateAuth0Token(string $token): ?array
    {
        try {
            $response = $this->httpClient->request('GET', \sprintf('https://%s/userinfo', $this->auth0Domain), [
                'headers' => [
                    'Authorization' => \sprintf('Bearer %s', $token),
                ],
            ]);

            if (200 !== $response->getStatusCode()) {
                return null;
            }

            $data = $response->toArray(false);

            if (!isset($data['sub']) || !\is_string($data['sub'])) {
                return null;
            }

            return $data;
        } catch (\Throwable) {
            return null;
        }
    }
}
