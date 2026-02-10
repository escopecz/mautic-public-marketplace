<?php

declare(strict_types=1);

namespace App\Marketplace\Dto;

use App\Marketplace\Exception\ReviewValidationException;

final class ReviewRequest
{
    public function __construct(
        public readonly int $rating,
        public readonly string $review,
    ) {
    }

    /**
     * @param array<string, mixed> $data
     *
     * @throws ReviewValidationException
     */
    public static function fromArray(array $data): self
    {
        $rating = isset($data['rating']) ? (int) $data['rating'] : 0;
        $review = isset($data['review']) ? trim((string) $data['review']) : '';

        if ($rating < 1 || $rating > 5) {
            throw new ReviewValidationException('Rating must be between 1 and 5.');
        }

        if ('' === $review) {
            throw new ReviewValidationException('Review text is required.');
        }

        return new self($rating, $review);
    }
}
