const axios = require('axios');

const API_URL = 'http://localhost:8055';
const EMAIL = 'admin@example.com';
const PASSWORD = 'directus';

async function main() {
  try {
    // Login para obter token
    console.log('Fazendo login...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: EMAIL,
      password: PASSWORD
    });

    const token = loginResponse.data.data.access_token;
    console.log('Login bem-sucedido!');

    // Criar papel público
    console.log('Criando papel público...');
    let publicRoleId;

    try {
      const createRoleResponse = await axios.post(`${API_URL}/roles`, {
        name: 'Public',
        app_access: false,
        admin_access: false,
        icon: 'public'
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      publicRoleId = createRoleResponse.data.data.id;
      console.log(`Papel público criado com ID: ${publicRoleId}`);
    } catch (error) {
      if (error.response && error.response.status === 400 && error.response.data.errors[0].message.includes('already exists')) {
        // O papel já existe, buscar o ID
        const rolesResponse = await axios.get(`${API_URL}/roles`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const publicRole = rolesResponse.data.data.find(role => role.name === 'Public');
        if (publicRole) {
          publicRoleId = publicRole.id;
          console.log(`Papel público já existe com ID: ${publicRoleId}`);
        } else {
          throw new Error('Não foi possível encontrar o papel público');
        }
      } else {
        throw error;
      }
    }

    // Definir permissões para a coleção de notícias
    console.log('Definindo permissões para a coleção de notícias...');

    // Primeiro, verificar se já existem permissões
    const existingPermissionsResponse = await axios.get(`${API_URL}/permissions`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const existingPermission = existingPermissionsResponse.data.data.find(
      p => p.collection === 'noticias' && p.action === 'read' && p.role === publicRoleId
    );

    if (existingPermission) {
      // Atualizar permissão existente
      await axios.patch(`${API_URL}/permissions/${existingPermission.id}`, {
        fields: ['*']
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Permissões atualizadas para a coleção de notícias');
    } else {
      // Criar nova permissão
      await axios.post(`${API_URL}/permissions`, {
        role: publicRoleId,
        collection: 'noticias',
        action: 'read',
        fields: ['*']
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Permissões criadas para a coleção de notícias');
    }

    // Definir permissões para a coleção de categorias
    console.log('Definindo permissões para a coleção de categorias...');
    await axios.post(`${API_URL}/permissions`, {
      role: publicRoleId,
      collection: 'categorias',
      action: 'read',
      fields: ['*']
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).catch(error => {
      if (error.response && error.response.status === 400 && error.response.data.errors[0].message.includes('already exists')) {
        console.log('Permissões já existem para a coleção de categorias');
      } else {
        throw error;
      }
    });

    // Definir permissões para a coleção de autores
    console.log('Definindo permissões para a coleção de autores...');
    await axios.post(`${API_URL}/permissions`, {
      role: publicRoleId,
      collection: 'autores',
      action: 'read',
      fields: ['*']
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).catch(error => {
      if (error.response && error.response.status === 400 && error.response.data.errors[0].message.includes('already exists')) {
        console.log('Permissões já existem para a coleção de autores');
      } else {
        throw error;
      }
    });

    // Definir permissões para arquivos
    console.log('Definindo permissões para arquivos...');
    await axios.post(`${API_URL}/permissions`, {
      role: publicRoleId,
      collection: 'directus_files',
      action: 'read',
      fields: ['*']
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).catch(error => {
      if (error.response && error.response.status === 400 && error.response.data.errors[0].message.includes('already exists')) {
        console.log('Permissões já existem para arquivos');
      } else {
        throw error;
      }
    });

    // Atualizar variável de ambiente para usar o papel público
    console.log('Atualizando configuração do Directus...');
    console.log(`Adicione a seguinte variável de ambiente ao seu arquivo docker-compose.override.yml:`);
    console.log(`PUBLIC_ROLE_ID: '${publicRoleId}'`);

    console.log('Permissões aplicadas com sucesso!');
  } catch (error) {
    console.error('Erro:', error.response ? error.response.data : error.message);
  }
}

main();
