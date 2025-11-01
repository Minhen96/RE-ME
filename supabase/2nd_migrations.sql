create or replace function match_memories(
query_embedding vector(1536),
match_threshold float,
match_count int,
filter_user_id uuid
)
returns table (
id uuid,
content text,
similarity float
)
language sql stable
as $$
select
    id,
    content,
    1 - (embedding <=> query_embedding) as similarity
from user_memories
where user_id = filter_user_id
    and 1 - (embedding <=> query_embedding) > match_threshold
order by similarity desc
limit match_count;
$$;

--   What this does:
--   - Takes an embedding vector (AI converts your question to numbers)
--   - Finds the 5 most similar memories from your past
--   - Returns them sorted by similarity
--   - The <=> operator is cosine distance (measures similarity between vectors)