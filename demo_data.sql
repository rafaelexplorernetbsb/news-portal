-- Dados de demonstração para o News Portal
-- Este arquivo contém dados de exemplo para testar a aplicação

-- Inserir categorias de exemplo
INSERT INTO categorias (id, nome, descricao, slug, icone) VALUES
(1, 'Política', 'Notícias sobre política nacional e internacional', 'politica', NULL),
(2, 'Economia', 'Notícias sobre economia, mercado financeiro e negócios', 'economia', NULL),
(3, 'Tecnologia', 'Notícias sobre tecnologia, inovação e startups', 'tecnologia', NULL),
(4, 'Esportes', 'Notícias sobre futebol, vôlei e outros esportes', 'esportes', NULL),
(5, 'Cultura', 'Notícias sobre cultura, arte e entretenimento', 'cultura', NULL);

-- Inserir autores de exemplo
INSERT INTO autores (id, nome, biografia, foto, email) VALUES
(1, 'Ana Silva', 'Jornalista com 10 anos de experiência em política e economia', NULL, 'ana.silva@exemplo.com'),
(2, 'Carlos Oliveira', 'Repórter especializado em tecnologia e inovação', NULL, 'carlos.oliveira@exemplo.com'),
(3, 'Mariana Costa', 'Jornalista esportiva e correspondente internacional', NULL, 'mariana.costa@exemplo.com'),
(4, 'Pedro Santos', 'Editor de cultura e entretenimento', NULL, 'pedro.santos@exemplo.com');

-- Inserir notícias de exemplo
INSERT INTO noticias (id, titulo, resumo, conteudo, imagem, data_publicacao, destaque, categoria, status, slug, autor) VALUES
(1, 'Governo anuncia novo pacote de medidas econômicas', 'Novas medidas visam estimular a economia e reduzir a inflação', 'O governo federal anunciou hoje um novo pacote de medidas econômicas que inclui redução de impostos para setores estratégicos e aumento do investimento em infraestrutura. As medidas devem entrar em vigor no próximo mês e são esperados resultados positivos para a economia brasileira.', NULL, '2025-09-30 10:00:00+00', true, 'politica', 'published', 'governo-anuncia-novo-pacote-medidas-economicas', 1),
(2, 'Nova inteligência artificial revoluciona diagnósticos médicos', 'IA desenvolvida no Brasil consegue detectar doenças com 95% de precisão', 'Pesquisadores brasileiros desenvolveram uma inteligência artificial capaz de diagnosticar diversas doenças com 95% de precisão, superando até mesmo médicos especialistas em alguns casos. A tecnologia está sendo testada em hospitais de São Paulo e deve ser expandida para todo o país.', NULL, '2025-09-29 14:30:00+00', true, 'tecnologia', 'published', 'nova-inteligencia-artificial-revoluciona-diagnosticos-medicos', 2),
(3, 'Brasil conquista medalha de ouro no vôlei feminino', 'Seleção brasileira vence final contra Estados Unidos por 3 sets a 1', 'A seleção brasileira de vôlei feminino conquistou mais uma medalha de ouro em competição internacional, vencendo os Estados Unidos por 3 sets a 1. A partida foi emocionante e contou com grande público no ginásio.', NULL, '2025-09-28 18:15:00+00', true, 'esportes', 'published', 'brasil-conquista-medalha-ouro-volei-feminino', 3),
(4, 'Bolsa de valores atinge novo recorde histórico', 'Índice Bovespa fecha em alta de 2,5% nesta sexta-feira', 'A Bolsa de Valores de São Paulo atingiu novo recorde histórico nesta sexta-feira, com o índice Bovespa fechando em alta de 2,5%. Analistas atribuem o crescimento ao otimismo do mercado com as novas medidas econômicas anunciadas pelo governo.', NULL, '2025-09-27 16:45:00+00', false, 'economia', 'published', 'bolsa-valores-atinge-novo-recorde-historico', 1),
(5, 'Filme brasileiro é premiado em festival internacional', 'Produção nacional conquista prêmio de melhor direção em Cannes', 'O filme brasileiro "A Cidade Perdida" conquistou o prêmio de melhor direção no Festival de Cannes, marcando um marco importante para o cinema nacional. O diretor, João Silva, dedicou o prêmio aos cineastas brasileiros que lutam por reconhecimento internacional.', NULL, '2025-09-26 09:20:00+00', false, 'cultura', 'published', 'filme-brasileiro-premiado-festival-internacional', 4),
(6, 'Inteligência Artificial no Brasil cresce 150%', 'Setor de IA movimenta R$ 2 bilhões no primeiro semestre', 'O setor de inteligência artificial no Brasil registrou crescimento de 150% no primeiro semestre de 2025, movimentando mais de R$ 2 bilhões. Startups brasileiras estão na vanguarda da inovação, desenvolvendo soluções para diversos setores da economia.', NULL, '2025-09-29 10:00:00+00', true, 'tecnologia', 'published', 'inteligencia-artificial-brasil-cresce-150', 2),
(7, 'Seleção brasileira vence amistoso internacional', 'Brasil derrota Argentina por 2 a 1 em partida emocionante', 'A seleção brasileira de futebol venceu a Argentina por 2 a 1 em amistoso internacional realizado no Maracanã. A partida foi marcada por muito equilíbrio e emoção, com gols de Neymar e Vinicius Jr. para o Brasil.', NULL, '2025-09-28 14:00:00+00', false, 'esportes', 'published', 'selecao-brasileira-vence-amistoso-internacional', 3),
(8, 'Congresso aprova nova lei de incentivo à cultura', 'Lei prevê investimento de R$ 500 milhões em projetos culturais', 'O Congresso Nacional aprovou nova lei que prevê investimento de R$ 500 milhões em projetos culturais em todo o país. A lei beneficiará artistas, produtores culturais e organizações que desenvolvem atividades artísticas.', NULL, '2025-09-27 09:00:00+00', false, 'politica', 'published', 'congresso-aprova-nova-lei-incentivo-cultura', 1),
(9, 'Startup brasileira desenvolve app para economia de energia', 'Aplicativo ajuda usuários a reduzir consumo elétrico em até 30%', 'Uma startup brasileira desenvolveu um aplicativo que ajuda usuários a reduzir o consumo de energia elétrica em até 30%. O app utiliza inteligência artificial para analisar padrões de consumo e sugerir otimizações.', NULL, '2025-09-25 11:30:00+00', false, 'tecnologia', 'published', 'startup-brasileira-desenvolve-app-economia-energia', 2),
(10, 'Festival de música atrai 50 mil pessoas ao Rio de Janeiro', 'Evento contou com artistas nacionais e internacionais', 'O Festival de Música do Rio de Janeiro reuniu mais de 50 mil pessoas durante três dias de evento. O festival contou com apresentações de artistas nacionais e internacionais, promovendo a cultura musical brasileira.', NULL, '2025-09-24 19:45:00+00', false, 'cultura', 'published', 'festival-musica-atrai-50-mil-pessoas-rio-janeiro', 4);

-- Atualizar sequências para evitar conflitos
SELECT setval('categorias_id_seq', (SELECT MAX(id) FROM categorias));
SELECT setval('autores_id_seq', (SELECT MAX(id) FROM autores));
SELECT setval('noticias_id_seq', (SELECT MAX(id) FROM noticias));