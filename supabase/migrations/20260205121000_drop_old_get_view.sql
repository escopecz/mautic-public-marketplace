DROP FUNCTION IF EXISTS get_view(
    _limit INT,
    _offset INT,
    _type TEXT,
    _query TEXT,
    _orderby TEXT,
    _orderdir TEXT
) CASCADE;
