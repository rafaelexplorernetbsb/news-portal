-- Script SQL para criar as coleções diretamente no banco
-- Este script cria as tabelas e configura o Directus

-- Criar tabela de autores
CREATE TABLE IF NOT EXISTS autores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    biografia TEXT,
    foto UUID,
    email VARCHAR(255)
);

-- Criar tabela de categorias
CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    slug VARCHAR(255) NOT NULL,
    icone UUID
);

-- Criar tabela de notícias
CREATE TABLE IF NOT EXISTS noticias (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    resumo TEXT NOT NULL,
    conteudo TEXT NOT NULL,
    imagem UUID,
    data_publicacao TIMESTAMP WITH TIME ZONE NOT NULL,
    destaque BOOLEAN DEFAULT false,
    categoria VARCHAR(255) NOT NULL,
    status VARCHAR(255) DEFAULT 'published',
    sort INTEGER,
    slug VARCHAR(255) UNIQUE,
    data_agendada TIMESTAMP WITHOUT TIME ZONE,
    autor INTEGER REFERENCES autores(id)
);

-- Inserir metadados das coleções no Directus
INSERT INTO directus_collections (collection, icon, note, display_template, hidden, singleton, translations, archive_field, archive_app_filter, archive_value, unarchive_value, sort_field, accountability, color, item_duplication_fields, sort, group, collapse) VALUES
('autores', 'person', 'Autores das notícias', '{{nome}}', false, false, null, null, false, null, null, null, null, null, null, null, null, 'open'),
('categorias', 'folder', 'Categorias de notícias', '{{nome}}', false, false, null, null, false, null, null, null, null, null, null, null, null, 'open'),
('noticias', 'article', 'Notícias do portal', '{{titulo}}', false, false, null, 'status', true, 'archived', 'draft', 'sort', null, null, null, null, null, 'open');

-- Inserir campos da tabela autores
INSERT INTO directus_fields (collection, field, type, meta, schema) VALUES
('autores', 'id', 'integer', '{"interface":"input","readonly":true,"hidden":true,"special":["auto-increment"]}', '{"is_primary_key":true,"has_auto_increment":true}'),
('autores', 'nome', 'string', '{"interface":"input","required":true,"note":"Nome completo do autor"}', '{"is_nullable":false}'),
('autores', 'biografia', 'text', '{"interface":"input-rich-text-html","note":"Biografia do autor"}', '{"is_nullable":true}'),
('autores', 'foto', 'uuid', '{"interface":"file-image","note":"Foto do autor","special":["file"]}', '{"is_nullable":true}'),
('autores', 'email', 'string', '{"interface":"input","note":"Email do autor"}', '{"is_nullable":true}');

-- Inserir campos da tabela categorias
INSERT INTO directus_fields (collection, field, type, meta, schema) VALUES
('categorias', 'id', 'integer', '{"interface":"input","readonly":true,"hidden":true,"special":["auto-increment"]}', '{"is_primary_key":true,"has_auto_increment":true}'),
('categorias', 'nome', 'string', '{"interface":"input","required":true,"note":"Nome da categoria"}', '{"is_nullable":false}'),
('categorias', 'descricao', 'text', '{"interface":"input-multiline","note":"Descrição da categoria"}', '{"is_nullable":true}'),
('categorias', 'slug', 'string', '{"interface":"input","required":true,"note":"Identificador único para URLs","options":{"slug":true}}', '{"is_nullable":false}'),
('categorias', 'icone', 'uuid', '{"interface":"file-image","note":"Ícone da categoria","special":["file"]}', '{"is_nullable":true}');

-- Inserir campos da tabela noticias
INSERT INTO directus_fields (collection, field, type, meta, schema) VALUES
('noticias', 'id', 'integer', '{"interface":"input","readonly":true,"hidden":true,"special":["auto-increment"]}', '{"is_primary_key":true,"has_auto_increment":true}'),
('noticias', 'titulo', 'string', '{"interface":"input","required":true,"note":"Título da notícia"}', '{"is_nullable":false}'),
('noticias', 'resumo', 'text', '{"interface":"input-multiline","required":true,"note":"Resumo curto da notícia"}', '{"is_nullable":false}'),
('noticias', 'conteudo', 'text', '{"interface":"input-rich-text-html","required":true,"note":"Conteúdo completo da notícia"}', '{"is_nullable":false}'),
('noticias', 'imagem', 'uuid', '{"interface":"file-image","note":"Imagem principal da notícia","special":["file"]}', '{"is_nullable":true}'),
('noticias', 'data_publicacao', 'timestamp', '{"interface":"datetime","required":true,"note":"Data de publicação da notícia"}', '{"is_nullable":false}'),
('noticias', 'destaque', 'boolean', '{"interface":"boolean","note":"Marque para exibir na seção de destaque","options":{"label":"Esta notícia está em destaque?"}}', '{"default_value":false}'),
('noticias', 'categoria', 'string', '{"interface":"select-dropdown","required":true,"note":"Categoria da notícia","options":{"choices":[{"text":"Política","value":"politica"},{"text":"Economia","value":"economia"},{"text":"Esportes","value":"esportes"},{"text":"Tecnologia","value":"tecnologia"},{"text":"Cultura","value":"cultura"},{"text":"Saúde","value":"saude"},{"text":"Educação","value":"educacao"}]}}', '{"is_nullable":false}'),
('noticias', 'status', 'string', '{"interface":"select-dropdown","display":"labels","options":{"choices":[{"text":"Publicado","value":"published"},{"text":"Rascunho","value":"draft"},{"text":"Arquivado","value":"archived"}]}}', '{"default_value":"published","is_nullable":true}'),
('noticias', 'sort', 'integer', '{"interface":"input","note":"Ordem de exibição"}', '{"is_nullable":true}'),
('noticias', 'slug', 'string', '{"interface":"input","note":"Identificador único para URLs","options":{"slug":true}}', '{"is_nullable":true}'),
('noticias', 'data_agendada', 'timestamp', '{"interface":"datetime","note":"Data para publicação agendada"}', '{"is_nullable":true}'),
('noticias', 'autor', 'integer', '{"interface":"select-dropdown-m2o","note":"Autor da notícia","special":["m2o"]}', '{"is_nullable":true}');

-- Criar relacionamento entre noticias e autores
INSERT INTO directus_relations (many_collection, many_field, one_collection, one_field, one_collection_field, one_allowed_collections, one_deselect_action, junction_field, sort_field, one_deselect_action_one_field) VALUES
('noticias', 'autor', 'autores', null, null, null, 'nullify', null, null, null);

-- Aplicar permissões básicas
INSERT INTO directus_permissions (role, collection, action, permissions, validation, presets, fields) VALUES
('3eeb5670-a01f-4180-9ce1-8abf6d4c9b50', 'noticias', 'read', '{}', '{}', '{}', '*'),
('3eeb5670-a01f-4180-9ce1-8abf6d4c9b50', 'autores', 'read', '{}', '{}', '{}', '*'),
('3eeb5670-a01f-4180-9ce1-8abf6d4c9b50', 'categorias', 'read', '{}', '{}', '{}', '*'),
('71f1c22f-c8c2-4cb7-8c35-c4050683e0ba', 'noticias', 'create', '{}', '{}', '{}', '*'),
('71f1c22f-c8c2-4cb7-8c35-c4050683e0ba', 'noticias', 'read', '{}', '{}', '{}', '*'),
('71f1c22f-c8c2-4cb7-8c35-c4050683e0ba', 'noticias', 'update', '{}', '{}', '{}', '*'),
('71f1c22f-c8c2-4cb7-8c35-c4050683e0ba', 'noticias', 'delete', '{}', '{}', '{}', '*'),
('71f1c22f-c8c2-4cb7-8c35-c4050683e0ba', 'autores', 'create', '{}', '{}', '{}', '*'),
('71f1c22f-c8c2-4cb7-8c35-c4050683e0ba', 'autores', 'read', '{}', '{}', '{}', '*'),
('71f1c22f-c8c2-4cb7-8c35-c4050683e0ba', 'autores', 'update', '{}', '{}', '{}', '*'),
('71f1c22f-c8c2-4cb7-8c35-c4050683e0ba', 'autores', 'delete', '{}', '{}', '{}', '*'),
('71f1c22f-c8c2-4cb7-8c35-c4050683e0ba', 'categorias', 'create', '{}', '{}', '{}', '*'),
('71f1c22f-c8c2-4cb7-8c35-c4050683e0ba', 'categorias', 'read', '{}', '{}', '{}', '*'),
('71f1c22f-c8c2-4cb7-8c35-c4050683e0ba', 'categorias', 'update', '{}', '{}', '{}', '*'),
('71f1c22f-c8c2-4cb7-8c35-c4050683e0ba', 'categorias', 'delete', '{}', '{}', '{}', '*');

-- Atualizar sequências
SELECT setval('autores_id_seq', 1, false);
SELECT setval('categorias_id_seq', 1, false);
SELECT setval('noticias_id_seq', 1, false);
