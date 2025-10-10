-- Adicionar campos de vídeo à coleção noticias
-- Execute este script no PostgreSQL do Directus

-- Adicionar campo video_url
INSERT INTO directus_fields (
    collection,
    field,
    type,
    meta,
    schema
) VALUES (
    'noticias',
    'video_url',
    'text',
    '{
        "collection": "noticias",
        "conditions": null,
        "display": "raw",
        "display_options": null,
        "field": "video_url",
        "group": null,
        "hidden": false,
        "interface": "input",
        "note": "URL do vídeo (Globoplay, YouTube, etc.)",
        "options": null,
        "readonly": false,
        "required": false,
        "sort": 12,
        "special": null,
        "translations": null,
        "validation": null,
        "validation_message": null,
        "width": "full"
    }',
    '{
        "name": "video_url",
        "table": "noticias",
        "data_type": "text",
        "default_value": null,
        "max_length": null,
        "numeric_precision": null,
        "numeric_scale": null,
        "is_nullable": true,
        "is_unique": false,
        "is_indexed": false,
        "is_primary_key": false,
        "is_generated": false,
        "generation_expression": null,
        "has_auto_increment": false,
        "foreign_key_table": null,
        "foreign_key_column": null
    }'
);

-- Adicionar campo embed_html
INSERT INTO directus_fields (
    collection,
    field,
    type,
    meta,
    schema
) VALUES (
    'noticias',
    'embed_html',
    'text',
    '{
        "collection": "noticias",
        "conditions": null,
        "display": "raw",
        "display_options": null,
        "field": "embed_html",
        "group": null,
        "hidden": false,
        "interface": "input-code",
        "note": "HTML do player embed",
        "options": {
            "language": "html"
        },
        "readonly": false,
        "required": false,
        "sort": 13,
        "special": null,
        "translations": null,
        "validation": null,
        "validation_message": null,
        "width": "full"
    }',
    '{
        "name": "embed_html",
        "table": "noticias",
        "data_type": "text",
        "default_value": null,
        "max_length": null,
        "numeric_precision": null,
        "numeric_scale": null,
        "is_nullable": true,
        "is_unique": false,
        "is_indexed": false,
        "is_primary_key": false,
        "is_generated": false,
        "generation_expression": null,
        "has_auto_increment": false,
        "foreign_key_table": null,
        "foreign_key_column": null
    }'
);

-- Adicionar as colunas na tabela noticias
ALTER TABLE noticias ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE noticias ADD COLUMN IF NOT EXISTS embed_html TEXT;



