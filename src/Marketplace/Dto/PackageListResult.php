<?php

declare(strict_types=1);

namespace App\Marketplace\Dto;

final class PackageListResult
{
    /**
     * @param PackageSummary[] $items
     */
    public function __construct(
        public readonly array $items,
        public readonly int $limit,
        public readonly int $offset,
        public readonly ?int $total = null,
    ) {
    }
}
