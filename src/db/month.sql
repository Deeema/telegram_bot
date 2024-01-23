SELECT
  CASE WHEN id + 1 < 1 OR id + 1 > 30 THEN 0 ELSE id + 1 END AS Mon,
  CASE WHEN id + 2 < 1 OR id + 2 > 30 THEN 0 ELSE id + 2 END AS Tue,
  CASE WHEN id + 3 < 1 OR id + 3 > 30 THEN 0 ELSE id + 3 END AS Wed,
  CASE WHEN id + 4 < 1 OR id + 4 > 30 THEN 0 ELSE id + 4 END AS Thu,
  CASE WHEN id + 5 < 1 OR id + 5 > 30 THEN 0 ELSE id + 5 END AS Fri,
  CASE WHEN id + 6 < 1 OR id + 6 > 30 THEN 0 ELSE id + 6 END AS Sat,
  CASE WHEN id + 7 < 1 OR id + 7 > 30 THEN 0 ELSE id + 7 END AS Sun
FROM (
    SELECT 0 - 2 AS id UNION
    SELECT 7 - 2 UNION
    SELECT 14 - 2 UNION
    SELECT 21 - 2 UNION
    SELECT 28 - 2 UNION
    SELECT 35 - 2
) AS weeks
GROUP BY Mon, Tue, Wed, Thu, Fri, Sat, Sun
HAVING NOT (Mon = 0 AND Sun = 0);

