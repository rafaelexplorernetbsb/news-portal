const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuração
const API_URL = 'http://localhost:8055';
const EMAIL = 'admin@example.com';
const PASSWORD = 'directus';

// Definições das coleções
const collections = [
  {
    collection: 'noticias',
    meta: {
      collection: 'noticias',
      icon: 'article',
      note: 'Notícias do portal',
      display_template: '{{titulo}}',
      archive_field: 'status',
      archive_app_filter: true,
      archive_value: 'archived',
      unarchive_value: 'draft',
      sort_field: 'sort'
    },
    schema: {
      name: 'noticias'
    },
    fields: [
      {
        field: 'id',
        type: 'uuid',
        meta: {
          hidden: true,
          readonly: true,
          interface: 'input',
          special: ['uuid']
        },
        schema: {
          is_primary_key: true,
          length: 36
        }
      },
      {
        field: 'status',
        type: 'string',
        meta: {
          width: 'full',
          options: {
            choices: [
              { text: 'Publicado', value: 'published' },
              { text: 'Rascunho', value: 'draft' },
              { text: 'Arquivado', value: 'archived' }
            ]
          },
          interface: 'select-dropdown',
          display: 'labels'
        },
        schema: {
          default_value: 'draft',
          is_nullable: false
        }
      },
      {
        field: 'titulo',
        type: 'string',
        meta: {
          interface: 'input',
          required: true,
          note: 'Título da notícia'
        },
        schema: {
          is_nullable: false
        }
      },
      {
        field: 'resumo',
        type: 'text',
        meta: {
          interface: 'input-multiline',
          required: true,
          note: 'Resumo curto da notícia'
        },
        schema: {
          is_nullable: false
        }
      },
      {
        field: 'conteudo',
        type: 'text',
        meta: {
          interface: 'input-rich-text-html',
          required: true,
          note: 'Conteúdo completo da notícia'
        },
        schema: {
          is_nullable: false
        }
      },
      {
        field: 'imagem',
        type: 'uuid',
        meta: {
          interface: 'file-image',
          required: true,
          note: 'Imagem principal da notícia',
          special: ['file']
        },
        schema: {
          is_nullable: false
        }
      },
      {
        field: 'data_publicacao',
        type: 'timestamp',
        meta: {
          interface: 'datetime',
          required: true,
          note: 'Data de publicação da notícia'
        },
        schema: {
          is_nullable: false
        }
      },
      {
        field: 'destaque',
        type: 'boolean',
        meta: {
          interface: 'boolean',
          options: {
            label: 'Esta notícia está em destaque?'
          },
          note: 'Marque para exibir na seção de destaque'
        },
        schema: {
          default_value: false
        }
      },
      {
        field: 'categoria',
        type: 'string',
        meta: {
          interface: 'select-dropdown',
          options: {
            choices: [
              { text: 'Política', value: 'politica' },
              { text: 'Economia', value: 'economia' },
              { text: 'Esportes', value: 'esportes' },
              { text: 'Tecnologia', value: 'tecnologia' },
              { text: 'Cultura', value: 'cultura' },
              { text: 'Saúde', value: 'saude' },
              { text: 'Educação', value: 'educacao' }
            ]
          },
          required: true,
          note: 'Categoria da notícia'
        },
        schema: {
          is_nullable: false
        }
      },
      {
        field: 'autor',
        type: 'string',
        meta: {
          interface: 'input',
          required: true,
          note: 'Nome do autor da notícia'
        },
        schema: {
          is_nullable: false
        }
      }
    ]
  },
  {
    collection: 'categorias',
    meta: {
      collection: 'categorias',
      icon: 'folder',
      note: 'Categorias de notícias',
      display_template: '{{nome}}'
    },
    schema: {
      name: 'categorias'
    },
    fields: [
      {
        field: 'id',
        type: 'uuid',
        meta: {
          hidden: true,
          readonly: true,
          interface: 'input',
          special: ['uuid']
        },
        schema: {
          is_primary_key: true,
          length: 36
        }
      },
      {
        field: 'nome',
        type: 'string',
        meta: {
          interface: 'input',
          required: true,
          note: 'Nome da categoria'
        },
        schema: {
          is_nullable: false
        }
      },
      {
        field: 'descricao',
        type: 'text',
        meta: {
          interface: 'input-multiline',
          note: 'Descrição da categoria'
        }
      },
      {
        field: 'slug',
        type: 'string',
        meta: {
          interface: 'input',
          options: {
            slug: true
          },
          required: true,
          note: 'Identificador único para URLs'
        },
        schema: {
          is_nullable: false
        }
      },
      {
        field: 'icone',
        type: 'uuid',
        meta: {
          interface: 'file-image',
          note: 'Ícone da categoria',
          special: ['file']
        }
      }
    ]
  },
  {
    collection: 'autores',
    meta: {
      collection: 'autores',
      icon: 'person',
      note: 'Autores das notícias',
      display_template: '{{nome}}'
    },
    schema: {
      name: 'autores'
    },
    fields: [
      {
        field: 'id',
        type: 'uuid',
        meta: {
          hidden: true,
          readonly: true,
          interface: 'input',
          special: ['uuid']
        },
        schema: {
          is_primary_key: true,
          length: 36
        }
      },
      {
        field: 'nome',
        type: 'string',
        meta: {
          interface: 'input',
          required: true,
          note: 'Nome completo do autor'
        },
        schema: {
          is_nullable: false
        }
      },
      {
        field: 'biografia',
        type: 'text',
        meta: {
          interface: 'input-rich-text-html',
          note: 'Biografia do autor'
        }
      },
      {
        field: 'foto',
        type: 'uuid',
        meta: {
          interface: 'file-image',
          note: 'Foto do autor',
          special: ['file']
        }
      },
      {
        field: 'email',
        type: 'string',
        meta: {
          interface: 'input',
          note: 'Email do autor'
        }
      }
    ]
  }
];

// Função para fazer login e obter token
async function login() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: EMAIL,
      password: PASSWORD
    });
    return response.data.data.access_token;
  } catch (error) {
    console.error('Erro ao fazer login:', error.response?.data || error.message);
    throw error;
  }
}

// Função para criar coleções
async function createCollections(token) {
  for (const collection of collections) {
    try {
      console.log(`Criando coleção: ${collection.collection}`);

      // Criar a coleção
      await axios.post(
        `${API_URL}/collections`,
        {
          collection: collection.collection,
          meta: collection.meta,
          schema: collection.schema
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log(`Coleção ${collection.collection} criada com sucesso!`);

      // Criar campos
      for (const field of collection.fields) {
        if (field.field === 'id') continue; // O campo ID já é criado automaticamente

        console.log(`Criando campo: ${field.field} na coleção ${collection.collection}`);

        await axios.post(
          `${API_URL}/fields/${collection.collection}`,
          field,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        console.log(`Campo ${field.field} criado com sucesso!`);
      }
    } catch (error) {
      console.error(`Erro ao criar coleção ${collection.collection}:`, error.response?.data || error.message);
    }
  }
}

// Função principal
async function main() {
  try {
    const token = await login();
    await createCollections(token);
    console.log('Todas as coleções foram criadas com sucesso!');
  } catch (error) {
    console.error('Erro ao executar o script:', error);
  }
}

main();
