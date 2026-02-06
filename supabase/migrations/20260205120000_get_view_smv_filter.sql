CREATE OR REPLACE FUNCTION get_view(
    _limit INT,
    _offset INT,
    _orderby TEXT DEFAULT 'name',
    _orderdir TEXT DEFAULT 'asc',
    _query TEXT DEFAULT NULL,
    _smv TEXT DEFAULT NULL,
    _type TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    todo JSON;
    total INT;
    sql_query TEXT;
BEGIN
    SELECT COUNT(DISTINCT p.name) INTO total
    FROM packages p
    LEFT JOIN reviews r ON p.name = r."objectId"
    WHERE (p.latest_mautic_support = TRUE)
    AND (_query IS NULL OR p.name ILIKE '%' || _query || '%')
    AND (_type IS NULL OR p.type ILIKE '%' || _type || '%')
    AND (
        _smv IS NULL OR EXISTS (
            SELECT 1 FROM versions v
            WHERE v.package_name = p.name
            AND v.smv ILIKE '%' || _smv || '%'
        )
    );

    IF _orderby = 'downloads' THEN
        _orderby := '(p.downloads ->> ''total'')::INT';
    ELSIF _orderby = 'rating' THEN
        _orderby := 'COALESCE(ROUND(AVG(r.rating), 1), 0)';
    ELSE
        _orderby := 'p.name';
    END IF;

    sql_query := format(
        'SELECT JSON_AGG(t)
         FROM (SELECT
                  p.name,
                  p.url,
                  p.repository,
                  p.description,
                  (p.downloads ->> ''total'')::INT as downloads,
                  p.favers,
                  p.type,
                  p.displayname,
                  COALESCE(ROUND(AVG(r.rating), 1), 0) AS average_rating,
                  COALESCE(COUNT(r.review), 0) AS total_review,
                  COALESCE(p.time, p.created_at) AS time
               FROM packages p
               LEFT JOIN reviews r ON p.name = r."objectId"
               WHERE p.latest_mautic_support = TRUE
                 AND (%L IS NULL OR p.name ILIKE ''%%'' || %L || ''%%'')
                 AND (%L IS NULL OR p.type ILIKE ''%%'' || %L || ''%%'')
                 AND (%L IS NULL OR EXISTS (
                        SELECT 1 FROM versions v
                        WHERE v.package_name = p.name
                        AND v.smv ILIKE ''%%'' || %L || ''%%''
                     ))
                 GROUP BY p.name, p.url, p.repository, p.description, p.downloads, p.favers, p.type, p.displayname, p.time, p.created_at
               ORDER BY %s %s, p.name ASC
               LIMIT %L OFFSET %L
         ) t', _query, _query, _type, _type, _smv, _smv, _orderby, _orderdir, _limit, _offset);

    EXECUTE sql_query INTO todo;

    RETURN JSON_BUILD_OBJECT(
        'results', todo,
        'total', total
    );
END;
$$
 LANGUAGE plpgsql STABLE;
