INSERT INTO packages (
    name,
    description,
    type,
    repository,
    downloads,
    favers,
    url,
    displayname,
    latest_mautic_support,
    created_at
)
VALUES (
    'mautic/example-plugin',
    'Example package for local development.',
    'mautic-plugin',
    'https://github.com/mautic/example-plugin',
    '{"total": 1234}'::jsonb,
    10,
    'https://packagist.org/packages/mautic/example-plugin',
    'Example Plugin',
    true,
    NOW()
)
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    type = EXCLUDED.type,
    repository = EXCLUDED.repository,
    downloads = EXCLUDED.downloads,
    favers = EXCLUDED.favers,
    url = EXCLUDED.url,
    displayname = EXCLUDED.displayname,
    latest_mautic_support = EXCLUDED.latest_mautic_support;

INSERT INTO versions (
    package_name,
    description,
    version,
    version_normalized,
    type,
    smv,
    time
)
VALUES (
    'mautic/example-plugin',
    'Example version for local development.',
    '1.0.0',
    '1.0.0.0',
    'mautic-plugin',
    '^5.0',
    NOW()
)
ON CONFLICT (package_name, version) DO NOTHING;
