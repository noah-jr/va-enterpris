-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: 127.0.0.1    Database: gloxis
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `adonis_schema`
--

DROP TABLE IF EXISTS `adonis_schema`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adonis_schema` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `batch` int NOT NULL,
  `migration_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adonis_schema`
--

LOCK TABLES `adonis_schema` WRITE;
/*!40000 ALTER TABLE `adonis_schema` DISABLE KEYS */;
INSERT INTO `adonis_schema` VALUES (1,'database/migrations/1761885935168_create_users_table',1,'2026-08-14 23:24:55'),(2,'database/migrations/1768620764696_create_access_tokens_table',1,'2026-08-14 23:24:55'),(3,'database/migrations/1786730000000_add_role_to_users',1,'2026-08-14 23:24:55'),(4,'database/migrations/1786739898348_create_audit_logs_table',1,'2026-08-14 23:24:55'),(5,'database/migrations/1786750000000_advanced_security',1,'2026-08-14 23:24:55'),(6,'database/migrations/1786750000001_campanhas',1,'2026-08-14 23:24:55'),(7,'app/Modules/Clientes/Database/Migrations/1786740000010_create_clientes_table',1,'2026-08-14 23:24:55'),(8,'app/Modules/Clientes/Database/Migrations/1786740566292_add_classificacao_to_clientes',1,'2026-08-14 23:24:55'),(9,'app/Modules/Clientes/Database/Migrations/1786742771398_create_lista_negras_table',1,'2026-08-14 23:24:55'),(10,'app/Modules/Clientes/Database/Migrations/1786742816349_create_classificacao_clientes_table',1,'2026-08-14 23:24:55'),(11,'app/Modules/ProdutoFinanceiro/Database/Migrations/1786740000020_create_produto_creditos_table',1,'2026-08-14 23:24:55'),(12,'app/Modules/SolicitacaoCredito/Database/Migrations/1786740000030_create_solicitacao_creditos_table',1,'2026-08-14 23:24:55'),(13,'app/Modules/SolicitacaoCredito/Database/Migrations/1786740000040_create_solicitacao_documentos_table',1,'2026-08-14 23:24:55'),(14,'app/Modules/AnaliseAprovacao/Database/Migrations/1786740000050_create_analises_aprovacao_table',1,'2026-08-14 23:24:55'),(15,'app/Modules/Garantia/Database/Migrations/1786740451220_create_garantias_table',1,'2026-08-14 23:24:56'),(16,'app/Modules/OperacaoFinanceira/Database/Migrations/1786738407022_create_desembolsos_table',1,'2026-08-14 23:24:56'),(17,'app/Modules/OperacaoFinanceira/Database/Migrations/1786738417805_create_pagamentos_table',1,'2026-08-14 23:24:56'),(18,'app/Modules/OperacaoFinanceira/Database/Migrations/1786741569830_add_valor_parcela_to_pagamentos',1,'2026-08-14 23:24:56'),(19,'app/Modules/Renegociacao/Database/Migrations/1786740159262_create_renegociacoes_table',1,'2026-08-14 23:24:56'),(20,'database/migrations/1786751380725_erp_modules',2,'2026-08-14 23:49:47'),(21,'app/Modules/Clientes/Database/Migrations/1786760000000_add_contacts_to_clientes',3,'2026-08-15 00:36:40'),(22,'database/migrations/1786770000000_add_user_id_to_clientes',4,'2026-08-15 00:51:49'),(23,'database/migrations/1786770000001_add_must_change_password',4,'2026-08-15 00:51:49'),(24,'database/migrations/1786780000000_add_images_to_clientes',5,'2026-08-15 00:54:08'),(25,'database/migrations/1786790000000_configuracoes',6,'2026-08-15 01:17:25'),(26,'database/migrations/1786800000000_gestao_documental_inbox',7,'2026-08-15 01:31:46'),(27,'database/migrations/1786785000000_add_details_to_vendas',8,'2026-08-15 02:34:04'),(28,'database/migrations/1786786000000_add_details_to_compras',9,'2026-08-15 19:55:30'),(29,'database/migrations/1786787000000_add_details_to_stock',10,'2026-08-15 19:58:43'),(30,'database/migrations/1786788000000_add_details_to_faturas',11,'2026-08-15 20:05:41'),(31,'database/migrations/1786789000000_add_details_to_pagamentos',12,'2026-08-15 20:08:08'),(32,'database/migrations/1786790000000_add_details_to_contabilidade',13,'2026-08-15 20:10:10'),(33,'database/migrations/1786791000000_add_details_to_rh',14,'2026-08-15 20:12:08'),(34,'database/migrations/1786792000000_add_details_to_contratos',15,'2026-08-15 20:14:03'),(35,'database/migrations/1786793000000_add_details_to_projetos',16,'2026-08-15 20:16:04'),(36,'database/migrations/1786794000000_add_details_to_ativos',17,'2026-08-15 20:18:06');
/*!40000 ALTER TABLE `adonis_schema` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `adonis_schema_versions`
--

DROP TABLE IF EXISTS `adonis_schema_versions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adonis_schema_versions` (
  `version` int unsigned NOT NULL,
  PRIMARY KEY (`version`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adonis_schema_versions`
--

LOCK TABLES `adonis_schema_versions` WRITE;
/*!40000 ALTER TABLE `adonis_schema_versions` DISABLE KEYS */;
INSERT INTO `adonis_schema_versions` VALUES (2);
/*!40000 ALTER TABLE `adonis_schema_versions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `analises_aprovacao`
--

DROP TABLE IF EXISTS `analises_aprovacao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `analises_aprovacao` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `solicitacao_id` int unsigned DEFAULT NULL,
  `score` int NOT NULL,
  `decision` enum('APROVADO','REJEITADO') NOT NULL,
  `motivo` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `analises_aprovacao_solicitacao_id_foreign` (`solicitacao_id`),
  CONSTRAINT `analises_aprovacao_solicitacao_id_foreign` FOREIGN KEY (`solicitacao_id`) REFERENCES `solicitacao_creditos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `analises_aprovacao`
--

LOCK TABLES `analises_aprovacao` WRITE;
/*!40000 ALTER TABLE `analises_aprovacao` DISABLE KEYS */;
/*!40000 ALTER TABLE `analises_aprovacao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `api_keys`
--

DROP TABLE IF EXISTS `api_keys`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `api_keys` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned DEFAULT NULL,
  `key` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `revoked_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `api_keys_key_unique` (`key`),
  KEY `api_keys_user_id_foreign` (`user_id`),
  CONSTRAINT `api_keys_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `api_keys`
--

LOCK TABLES `api_keys` WRITE;
/*!40000 ALTER TABLE `api_keys` DISABLE KEYS */;
/*!40000 ALTER TABLE `api_keys` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ativos`
--

DROP TABLE IF EXISTS `ativos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ativos` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) DEFAULT NULL,
  `valor` decimal(12,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `categoria` varchar(255) DEFAULT 'Equipamento Informático',
  `localizacao` varchar(255) DEFAULT 'Sede Luanda',
  `responsavel` varchar(255) DEFAULT NULL,
  `estado_conservacao` varchar(255) DEFAULT 'EXCELENTE',
  `taxa_depreciacao_anual` decimal(5,2) DEFAULT '20.00',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ativos`
--

LOCK TABLES `ativos` WRITE;
/*!40000 ALTER TABLE `ativos` DISABLE KEYS */;
/*!40000 ALTER TABLE `ativos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `audit_logs`
--

DROP TABLE IF EXISTS `audit_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `audit_logs` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int unsigned DEFAULT NULL,
  `action` varchar(255) NOT NULL,
  `ip_address` varchar(255) DEFAULT NULL,
  `payload` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `audit_logs_user_id_foreign` (`user_id`),
  CONSTRAINT `audit_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=152 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-14 23:25:45'),(2,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-14 23:25:46'),(3,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-14 23:27:14'),(4,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-14 23:28:25'),(5,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-14 23:28:26'),(6,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-14 23:33:59'),(7,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-14 23:34:01'),(8,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-14 23:34:02'),(9,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-14 23:34:05'),(10,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-14 23:34:26'),(11,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-14 23:35:14'),(12,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-14 23:36:03'),(13,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-15 00:06:03'),(14,NULL,'POST /api/v1/vendas','127.0.0.1','{\"valor\": 266711, \"status\": \"PENDENTE\", \"cliente_id\": 1}','2026-08-15 00:06:09'),(15,NULL,'POST /api/v1/compras','127.0.0.1','{\"valor\": 85924, \"status\": \"PAGO\", \"fornecedor_id\": 107}','2026-08-15 00:06:12'),(16,NULL,'POST /api/v1/stock','127.0.0.1','{\"produto_id\": 146, \"quantidade\": 396}','2026-08-15 00:06:16'),(17,NULL,'POST /api/v1/faturacao','127.0.0.1','{\"valor\": 111963, \"status\": \"PAGA\", \"cliente_id\": 84}','2026-08-15 00:06:19'),(18,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-15 00:21:45'),(19,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-15 00:37:31'),(20,NULL,'POST /api/v1/clientes','127.0.0.1','{\"nif\": \"54324\", \"nome\": \"Noé Magalhães\", \"email\": \"noe.francisco@gmail.com\", \"endereco\": \"Angola, Luanda\", \"telefone\": \"434343\", \"contaBancaria\": \"2343234\"}','2026-08-15 00:38:02'),(21,NULL,'POST /api/v1/clientes','127.0.0.1','{\"nif\": \"33444\", \"nome\": \"Noé Magalhães\", \"email\": \"ola@gmail.com\", \"endereco\": \"Angola, Luanda\", \"telefone\": \"443\", \"contaBancaria\": \"434343\"}','2026-08-15 00:42:03'),(22,NULL,'POST /api/v1/clientes','127.0.0.1','{\"nif\": \"12345\", \"nome\": \"Teste\", \"email\": \"teste@teste.com\"}','2026-08-15 00:43:57'),(23,NULL,'POST /api/v1/clientes','127.0.0.1','{\"nif\": \"12345\", \"nome\": \"Teste\", \"email\": \"teste@teste.com\"}','2026-08-15 00:46:02'),(24,NULL,'POST /api/v1/clientes','127.0.0.1','{\"nif\": \"NIF888\", \"nome\": \"Teste\", \"email\": \"teste@teste.com\", \"endereco\": \"Rua A\", \"telefone\": \"123\", \"contaBancaria\": \"IBAN123\"}','2026-08-15 00:46:21'),(25,NULL,'POST /api/v1/clientes','127.0.0.1','{\"nif\": \"34343\", \"nome\": \"Noé Magalhães\", \"email\": \"ola@gmail.com\", \"endereco\": \"Angola, Luanda\", \"telefone\": \"3443\", \"contaBancaria\": \"23232\"}','2026-08-15 00:48:23'),(26,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-15 00:58:05'),(27,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-15 00:58:10'),(28,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-15 00:59:28'),(29,NULL,'POST /api/v1/clientes','127.0.0.1','{\"nif\": \"243424\", \"nome\": \"Noé Magalhães\", \"email\": \"noe.francisco@gmail.com\", \"endereco\": \"Angola, Luanda\", \"logotipo\": {\"meta\": {}, \"size\": 105262, \"type\": \"image\", \"state\": \"moved\", \"errors\": [], \"extname\": \"png\", \"isValid\": true, \"subtype\": \"png\", \"fileName\": \"aa08ab39-f2fe-4a10-98e0-e3545b268cb5.png\", \"filePath\": \"public/uploads/clientes/logotipos/aa08ab39-f2fe-4a10-98e0-e3545b268cb5.png\", \"fieldName\": \"logotipo\", \"validated\": true, \"clientName\": \"Captura de ecrã de 2026-08-14 10-54-37.png\"}, \"telefone\": \"22323\", \"fotografia\": {\"meta\": {}, \"size\": 17569, \"type\": \"image\", \"state\": \"moved\", \"errors\": [], \"extname\": \"png\", \"isValid\": true, \"subtype\": \"png\", \"fileName\": \"768110c4-5b61-4632-b523-e9e9d5769f40.png\", \"filePath\": \"public/uploads/clientes/fotografias/768110c4-5b61-4632-b523-e9e9d5769f40.png\", \"fieldName\": \"fotografia\", \"validated\": true, \"clientName\": \"Captura de ecrã de 2026-08-14 11-02-12.png\"}, \"contaBancaria\": \"232323\"}','2026-08-15 01:08:00'),(30,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-15 01:15:07'),(31,NULL,'POST /api/v1/administracao/backups','127.0.0.1','{}','2026-08-15 01:23:46'),(32,NULL,'POST /api/v1/administracao/backups/restore','127.0.0.1','{\"filename\": \"gloxis_backup_2026-08-15_01-23-46.sql\"}','2026-08-15 01:23:55'),(33,NULL,'POST /api/v1/administracao/backups','127.0.0.1','{}','2026-08-15 01:25:33'),(34,NULL,'POST /api/v1/administracao/test-smtp','127.0.0.1','{\"host\": \"smtp.mailgun.org\", \"port\": \"587\"}','2026-08-15 01:29:27'),(35,NULL,'DELETE /api/v1/administracao/backups','127.0.0.1','{\"filename\": \"backup_gloxis_2026-08-15_01-25-32.sql\"}','2026-08-15 01:29:41'),(36,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-15 01:34:12'),(37,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-15 01:34:18'),(38,NULL,'POST /api/v1/documentos','127.0.0.1','{\"notas\": null, \"titulo\": \"Vector 51.png\", \"arquivo\": {\"meta\": {}, \"size\": 37861, \"type\": \"image\", \"state\": \"moved\", \"errors\": [], \"extname\": \"png\", \"isValid\": true, \"subtype\": \"png\", \"fileName\": \"1786757676656_Vector_51.png\", \"filePath\": \"/home/mr-nobody/Documentos/_/VA/gloxis/backend/public/uploads/documentos/1786757676656_Vector_51.png\", \"fieldName\": \"arquivo\", \"validated\": true, \"clientName\": \"Vector 51.png\"}, \"categoria\": \"KYC\", \"cliente_nome\": null, \"departamento\": \"GERAL\", \"cliente_email\": null}','2026-08-15 01:34:36'),(39,NULL,'POST /api/v1/documentos/1/tramitar','127.0.0.1','{\"destino\": \"RISCO\", \"usuario\": \"Administrador\", \"despacho\": \"kkjj\", \"status_novo\": \"REJEITADO\"}','2026-08-15 01:34:50'),(40,NULL,'POST /api/v1/inbox','127.0.0.1','{\"assunto\": \"888\", \"conteudo\": \"8888\", \"documento_id\": 1, \"destinatario_nome\": \"887\", \"destinatario_tipo\": \"CLIENTE\"}','2026-08-15 01:35:06'),(41,NULL,'PUT /api/v1/inbox/1/lida','127.0.0.1','{}','2026-08-15 01:35:12'),(42,NULL,'POST /api/v1/inbox','127.0.0.1','{\"assunto\": \"Resposta Direta para 887\", \"conteudo\": \"Documento anexado à conversa.\", \"documento_id\": 1, \"remetente_nome\": \"Administrador\", \"remetente_tipo\": \"ADMIN\", \"destinatario_nome\": \"887\", \"destinatario_tipo\": \"CLIENTE\"}','2026-08-15 01:39:05'),(43,NULL,'POST /api/v1/inbox','127.0.0.1','{\"assunto\": \"Resposta Direta para 887\", \"conteudo\": \"oaksk\", \"documento_id\": null, \"remetente_nome\": \"Administrador\", \"remetente_tipo\": \"ADMIN\", \"destinatario_nome\": \"887\", \"destinatario_tipo\": \"CLIENTE\"}','2026-08-15 01:42:01'),(44,NULL,'POST /api/v1/inbox','127.0.0.1','{\"assunto\": \"Resposta Direta para 887\", \"conteudo\": \"sols\", \"documento_id\": null, \"remetente_nome\": \"Administrador\", \"remetente_tipo\": \"ADMIN\", \"destinatario_nome\": \"887\", \"destinatario_tipo\": \"CLIENTE\"}','2026-08-15 01:42:03'),(45,NULL,'POST /api/v1/documentos','127.0.0.1','{\"notas\": \"Gerado via Pacote Office Criador de Documentos Gloxis ERP\", \"titulo\": \"Novo Contrato de Crédito\", \"arquivo\": {\"meta\": {}, \"size\": 2085, \"type\": \"text\", \"state\": \"consumed\", \"errors\": [{\"type\": \"extname\", \"message\": \"Invalid file extension html. Only pdf, png, jpg, jpeg, docx, xlsx, txt, csv are allowed\", \"fieldName\": \"arquivo\", \"clientName\": \"Novo_Contrato_de_Crédito.html\"}], \"extname\": \"html\", \"isValid\": false, \"subtype\": \"html\", \"fieldName\": \"arquivo\", \"validated\": true, \"clientName\": \"Novo_Contrato_de_Crédito.html\"}, \"categoria\": \"CONTRATO\", \"cliente_nome\": null, \"departamento\": \"FINANCEIRO\", \"cliente_email\": null}','2026-08-15 01:44:16'),(46,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-15 01:52:24'),(47,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-15 01:52:34'),(48,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-15 02:16:00'),(49,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-15 02:28:21'),(50,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-15 02:31:36'),(51,NULL,'POST /api/v1/vendas','127.0.0.1','{\"itens\": [{\"qtd\": 1, \"descricao\": \"Licença Gloxis Enterprise ERP (Anual)\", \"precoUnit\": 450000}, {\"qtd\": 2, \"descricao\": \"Suporte Técnico & Consultoria\", \"precoUnit\": 25000}], \"notas\": null, \"valor\": 570000, \"status\": \"PAGO\", \"desconto\": 0, \"vendedor\": \"Operador de Vendas Gloxis ERP\", \"cliente_id\": null, \"imposto_iva\": 14, \"cliente_nome\": \"Consumidor Final\", \"cliente_email\": null, \"forma_pagamento\": \"MULTICAIXA\"}','2026-08-15 02:40:16'),(52,NULL,'POST /api/v1/vendas','127.0.0.1','{\"itens\": [{\"qtd\": 1, \"descricao\": \"Licença Gloxis Enterprise ERP (Anual)\", \"precoUnit\": 450000}, {\"qtd\": 2, \"descricao\": \"Suporte Técnico & Consultoria\", \"precoUnit\": 25000}], \"notas\": null, \"valor\": 570000, \"status\": \"PENDENTE\", \"desconto\": 0, \"vendedor\": \"Operador de Vendas Gloxis ERP\", \"cliente_id\": null, \"imposto_iva\": 14, \"cliente_nome\": \"Consumidor Final\", \"cliente_email\": null, \"forma_pagamento\": \"MULTICAIXA\"}','2026-08-15 02:40:46'),(53,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-15 19:50:13'),(54,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-15 19:54:28'),(55,NULL,'POST /api/v1/compras','127.0.0.1','{\"itens\": [{\"qtd\": 1, \"descricao\": \"Servidores Dell PowerEdge R750\", \"precoUnit\": 1250000}, {\"qtd\": 1, \"descricao\": \"Manutenção de Infraestrutura\", \"precoUnit\": 150000}], \"notas\": null, \"valor\": 1400000, \"status\": \"PENDENTE\", \"categoria\": \"LICENCAS\", \"comprador\": \"Diretor de Operações Gloxis\", \"fornecedor_nif\": \"ssd\", \"forma_pagamento\": \"CHEQUE\", \"fornecedor_nome\": \"DD\"}','2026-08-15 20:04:26'),(56,NULL,'POST /api/v1/stock','127.0.0.1','{\"nome\": \"333\", \"categoria\": \"ESCRITORIO\", \"codigo_sku\": \"333\", \"quantidade\": 50, \"localizacao\": \"Armazém Central - Luanda\", \"minimo_alerta\": 10, \"preco_unitario\": 25000}','2026-08-15 20:04:46'),(57,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-15 20:07:39'),(58,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-15 20:23:36'),(59,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-15 20:46:55'),(60,NULL,'PUT /api/v1/stock/1','127.0.0.1','{\"quantidade\": 10}','2026-08-15 20:47:39'),(61,NULL,'PUT /api/v1/stock/1','127.0.0.1','{\"localizacao\": \"Armazém Filial - Benguela\"}','2026-08-15 20:48:19'),(62,NULL,'PUT /api/v1/vendas/2','127.0.0.1','{\"valor\": 0, \"desconto\": 50000}','2026-08-15 20:50:07'),(63,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-15 21:20:05'),(64,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": 2500000, \"parcelas\": 12, \"clienteId\": 10, \"finalidade\": \"Financiamento de Equipamento / Capital de Giro\"}','2026-08-15 21:20:17'),(65,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": 2500000, \"parcelas\": 12, \"clienteId\": 10, \"finalidade\": \"Financiamento de Equipamento / Capital de Giro\"}','2026-08-15 21:20:21'),(66,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-15 21:38:07'),(67,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": 5000000, \"parcelas\": 12, \"clienteId\": 1, \"finalidade\": \"Expansão de Capital de Giro\"}','2026-08-15 21:39:41'),(68,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": 2500000, \"parcelas\": 12, \"clienteId\": 10, \"finalidade\": \"Financiamento de Equipamento / Capital de Giro\"}','2026-08-15 21:40:55'),(69,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-15 21:53:10'),(70,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-15 22:10:29'),(71,NULL,'POST /api/v1/administracao/users','127.0.0.1','{\"role\": \"ANALISTA_CREDITO\", \"email\": \"ana@gloxis.com\", \"fullName\": \"Ana Operadora\"}','2026-08-15 22:16:44'),(72,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-15 22:27:10'),(73,NULL,'POST /api/v1/lista-negra','127.0.0.1','{\"motivo\": \"[INADIMPLENCIA_PROLONGADA]\", \"clienteId\": 1}','2026-08-15 22:36:42'),(74,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-15 22:40:20'),(75,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-15 23:27:53'),(76,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"cliente@exemplo.com\"}','2026-08-19 19:01:54'),(77,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"cliente@exemplo.com\"}','2026-08-19 19:02:01'),(78,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"cliente@exemplo.com\"}','2026-08-19 19:04:05'),(79,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"cliente@exemplo.com\"}','2026-08-19 19:04:14'),(80,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"cliente@exemplo.com\"}','2026-08-19 19:04:15'),(81,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"cliente@exemplo.com\"}','2026-08-19 19:04:29'),(82,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-19 19:05:23'),(83,NULL,'PUT /api/v1/clientes/10','127.0.0.1','{\"nif\": \"243424\", \"nome\": \"Noé Magalhães\", \"email\": \"noe.francisco@gmail.com\", \"endereco\": \"Angola, Luanda\", \"telefone\": \"22323\", \"fotografia\": {\"meta\": {}, \"size\": 68731, \"type\": \"image\", \"state\": \"moved\", \"errors\": [], \"extname\": \"png\", \"isValid\": true, \"subtype\": \"png\", \"fileName\": \"9844940d-f379-4c47-90a1-e85390bd373c.png\", \"filePath\": \"public/uploads/clientes/fotografias/9844940d-f379-4c47-90a1-e85390bd373c.png\", \"fieldName\": \"fotografia\", \"validated\": true, \"clientName\": \"Captura de ecrã de 2026-08-19 11-47-20.png\"}, \"contaBancaria\": \"232323\"}','2026-08-19 19:06:38'),(84,NULL,'POST /api/v1/projetos','127.0.0.1','{\"nome\": \"Noah Magalhases\", \"status\": \"EM_ANDAMENTO\", \"orcamento\": 3500000, \"data_inicio\": \"2026-08-19\", \"cliente_nome\": \"Cliente Interno / Corporativo\", \"gerente_projeto\": \"Eng. Manuel San2323tos\", \"data_prevista_fim\": \"2027-02-15\", \"progresso_percentual\": 15}','2026-08-19 19:07:33'),(85,NULL,'PUT /api/v1/projetos/1','127.0.0.1','{\"status\": \"CONCLUIDO\", \"progresso_percentual\": 0}','2026-08-19 19:07:40'),(86,NULL,'PUT /api/v1/projetos/1','127.0.0.1','{\"status\": \"CONCLUIDO\", \"progresso_percentual\": 0}','2026-08-19 19:07:48'),(87,NULL,'POST /api/v1/lista-negra','127.0.0.1','{\"motivo\": \"[INADIMPLENCIA_PROLONGADA] vamos testa\", \"clienteId\": 1}','2026-08-19 19:08:25'),(88,NULL,'POST /api/v1/faturacao','127.0.0.1','{\"clienteId\": 1, \"descricao\": \"Prestação de Serviços de Consultoria de Crédito\", \"valorTotal\": 500000}','2026-08-19 19:08:44'),(89,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"cliente@exemplo.com\"}','2026-08-19 19:09:35'),(90,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"ana.ferreira@exemplo.com\"}','2026-08-19 19:13:52'),(91,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"ana.ferreira@exemplo.com\"}','2026-08-19 19:13:56'),(92,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"maria.silva@exemplo.com\"}','2026-08-19 19:15:33'),(93,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"ana.ferreira@exemplo.com\"}','2026-08-19 19:16:20'),(94,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"ana.ferreira@exemplo.com\"}','2026-08-19 19:16:26'),(95,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"ana.ferreira@exemplo.com\"}','2026-08-19 19:17:52'),(96,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 1.2323454334543224e23, \"parcelas\": 232, \"produtoId\": 4}','2026-08-19 19:18:07'),(97,NULL,'POST /api/v1/inbox','127.0.0.1','{\"assunto\": \"[Consultoria] Agendamento de Chamada (VIDEO)\", \"conteudo\": \"O cliente solicitou uma consultoria financeira.\\n\\nDetalhes:\\nData: 2026-09-02\\nHora: 10:00\\nTipo: Videochamada\", \"documento_id\": null, \"remetente_nome\": \"Ana Ferreira\", \"remetente_tipo\": \"CLIENTE\", \"destinatario_nome\": \"Administração\", \"destinatario_tipo\": \"ADMIN\"}','2026-08-19 19:18:29'),(98,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 5000, \"parcelas\": 12, \"produtoId\": 3}','2026-08-19 19:28:57'),(99,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 5000, \"parcelas\": 2, \"produtoId\": 3}','2026-08-19 19:29:05'),(100,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 50000, \"parcelas\": 2, \"produtoId\": 3}','2026-08-19 19:29:08'),(101,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 50001, \"parcelas\": 4, \"produtoId\": 9}','2026-08-19 19:29:38'),(102,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": 50001, \"parcelas\": 4, \"clienteId\": 12, \"produtoId\": 9}','2026-08-19 19:30:05'),(103,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"ana.ferreira@exemplo.com\"}','2026-08-19 19:36:08'),(104,NULL,'POST /api/v1/simulador','127.0.0.1','{\"produtoId\": 1, \"numeroParcelas\": 3, \"valorSolicitado\": 100000}','2026-08-19 19:42:59'),(105,NULL,'POST /api/v1/documentos','127.0.0.1','{\"notas\": null, \"status\": \"PENDENTE\", \"titulo\": \"BI_ANC\", \"arquivo\": {\"meta\": {}, \"size\": 166548, \"type\": \"application\", \"state\": \"moved\", \"errors\": [], \"extname\": \"pdf\", \"isValid\": true, \"subtype\": \"pdf\", \"fileName\": \"1787168606822_BI_ANC.pdf\", \"filePath\": \"/home/mr-nobody/Documentos/_/VA/gloxis/backend/public/uploads/documentos/1787168606822_BI_ANC.pdf\", \"fieldName\": \"arquivo\", \"validated\": true, \"clientName\": \"BI_ANC.pdf\"}, \"categoria\": \"CONTRATO\", \"cliente_nome\": \"Ana Ferreira\", \"departamento\": \"ARQUIVO_CLIENTE\", \"cliente_email\": \"ana.ferreira@exemplo.com\"}','2026-08-19 19:43:26'),(106,NULL,'POST /api/v1/documentos','127.0.0.1','{\"notas\": null, \"status\": \"PENDENTE\", \"titulo\": \"Laur_\", \"arquivo\": {\"meta\": {}, \"size\": 342052, \"type\": \"application\", \"state\": \"moved\", \"errors\": [], \"extname\": \"pdf\", \"isValid\": true, \"subtype\": \"pdf\", \"fileName\": \"1787168630788_Laur_.pdf\", \"filePath\": \"/home/mr-nobody/Documentos/_/VA/gloxis/backend/public/uploads/documentos/1787168630788_Laur_.pdf\", \"fieldName\": \"arquivo\", \"validated\": true, \"clientName\": \"Laur_.pdf\"}, \"categoria\": \"COMPROVATIVO\", \"cliente_nome\": \"Ana Ferreira\", \"departamento\": \"ARQUIVO_CLIENTE\", \"cliente_email\": \"ana.ferreira@exemplo.com\"}','2026-08-19 19:43:50'),(107,NULL,'POST /api/v1/inbox','127.0.0.1','{\"arquivo\": {\"meta\": {}, \"size\": 342052, \"type\": \"application\", \"state\": \"consumed\", \"errors\": [], \"extname\": \"pdf\", \"isValid\": true, \"subtype\": \"pdf\", \"fieldName\": \"arquivo\", \"validated\": false, \"clientName\": \"Laur_.pdf\"}, \"assunto\": \"s22\", \"conteudo\": \"323\", \"remetenteNome\": \"Ana Ferreira\", \"remetenteTipo\": \"CLIENTE\", \"destinatarioNome\": \"Administração Gloxis\", \"destinatarioTipo\": \"ADMIN\"}','2026-08-19 19:44:05'),(108,NULL,'POST /api/v1/inbox','127.0.0.1','{\"assunto\": \"s22\", \"conteudo\": \"323\", \"remetenteNome\": \"Ana Ferreira\", \"remetenteTipo\": \"CLIENTE\", \"destinatarioNome\": \"Administração Gloxis\", \"destinatarioTipo\": \"ADMIN\"}','2026-08-19 19:44:09'),(109,NULL,'POST /api/v1/inbox','127.0.0.1','{\"assunto\": \"s22\", \"conteudo\": \"323\", \"remetenteNome\": \"Ana Ferreira\", \"remetenteTipo\": \"CLIENTE\", \"destinatarioNome\": \"Administração Gloxis\", \"destinatarioTipo\": \"ADMIN\"}','2026-08-19 19:44:10'),(110,NULL,'POST /api/v1/inbox','127.0.0.1','{\"assunto\": \"s22\", \"conteudo\": \"3233232\", \"remetenteNome\": \"Ana Ferreira\", \"remetenteTipo\": \"CLIENTE\", \"destinatarioNome\": \"Administração Gloxis\", \"destinatarioTipo\": \"ADMIN\"}','2026-08-19 19:44:12'),(111,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 1000, \"parcelas\": 53, \"produtoId\": 1}','2026-08-19 19:46:49'),(112,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 1000, \"parcelas\": 5, \"produtoId\": 1}','2026-08-19 19:46:53'),(113,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 210000, \"parcelas\": 5, \"produtoId\": 1}','2026-08-19 19:47:02'),(114,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": 210000, \"parcelas\": 5, \"clienteId\": 12, \"produtoId\": 1}','2026-08-19 19:47:13'),(115,NULL,'POST /api/v1/inbox','127.0.0.1','{\"assunto\": \"Anexo de Arquivo - Solicitação #12\", \"conteudo\": \"O cliente vinculou o documento do seu arquivo (ID: 2) à solicitação de crédito #12.\", \"remetenteNome\": \"Ana Ferreira\", \"remetenteTipo\": \"CLIENTE\", \"destinatarioNome\": \"Departamento de Crédito\", \"destinatarioTipo\": \"ADMIN\"}','2026-08-19 19:47:13'),(116,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-19 19:51:51'),(117,NULL,'PATCH /api/v1/solicitacoes/12/status','127.0.0.1','{\"status\": \"APROVADO\"}','2026-08-19 19:52:18'),(118,NULL,'PATCH /api/v1/solicitacoes/12/status','127.0.0.1','{\"status\": \"APROVADO\"}','2026-08-19 19:52:23'),(119,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"ana.ferreira@exemplo.com\"}','2026-08-19 20:01:50'),(120,NULL,'POST /api/v1/simulador','127.0.0.1','{\"produtoId\": 1, \"numeroParcelas\": 3, \"valorSolicitado\": 100000}','2026-08-19 20:01:54'),(121,NULL,'POST /api/v1/inbox','127.0.0.1','{\"assunto\": \"33\", \"conteudo\": \"3434\", \"remetenteNome\": \"Ana Ferreira\", \"remetenteTipo\": \"CLIENTE\", \"destinatarioNome\": \"Administração Gloxis\", \"destinatarioTipo\": \"ADMIN\"}','2026-08-19 20:03:20'),(122,NULL,'POST /api/v1/inbox','127.0.0.1','{\"assunto\": \"naasjsj\", \"conteudo\": \"3434\", \"remetenteNome\": \"Ana Ferreira\", \"remetenteTipo\": \"CLIENTE\", \"destinatarioNome\": \"Administração Gloxis\", \"destinatarioTipo\": \"ADMIN\"}','2026-08-19 20:03:27'),(123,NULL,'POST /api/v1/inbox','127.0.0.1','{\"assunto\": \"[CONSULTORIA] Renegociação de Contrato\", \"conteudo\": \"Tipo: VIDEOCHAMADA\\nAssunto: Renegociação de Contrato\\nData Preferida: 2026-09-05 15:48\\n\\nDescrição:\\nj\", \"remetenteNome\": \"Ana Ferreira\", \"remetenteTipo\": \"CLIENTE\", \"destinatarioNome\": \"Administração Gloxis\", \"destinatarioTipo\": \"ADMIN\"}','2026-08-19 20:04:27'),(124,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 500000, \"parcelas\": 12, \"produtoId\": 1}','2026-08-19 20:04:30'),(125,NULL,'PUT /api/v1/clientes/me','127.0.0.1','{\"endereco\": \"Rua da Paz, 12\", \"telefone\": \"923000003\", \"contaBancaria\": \"Banco: Banco Z | Agência: 0033 | Conta: 11223-5\"}','2026-08-19 20:04:33'),(126,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-19 20:07:15'),(127,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 100000, \"parcelas\": 3, \"produtoId\": 1}','2026-08-19 20:08:37'),(128,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 100000, \"parcelas\": 6, \"produtoId\": 1}','2026-08-19 20:08:50'),(129,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 100000, \"parcelas\": 6, \"produtoId\": 1}','2026-08-19 20:08:53'),(130,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 100000, \"parcelas\": 1, \"produtoId\": 1}','2026-08-19 20:08:56'),(131,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 100000, \"parcelas\": 1, \"produtoId\": 1}','2026-08-19 20:09:00'),(132,NULL,'PATCH /api/v1/solicitacoes/12/status','127.0.0.1','{\"status\": \"APROVADO\"}','2026-08-19 20:09:34'),(133,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 4000000, \"parcelas\": 4, \"produtoId\": 2}','2026-08-19 20:10:10'),(134,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 40000, \"parcelas\": 4, \"produtoId\": 2}','2026-08-19 20:10:17'),(135,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 400000, \"parcelas\": 4, \"produtoId\": 2}','2026-08-19 20:10:27'),(136,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 400000, \"parcelas\": 7, \"produtoId\": 2}','2026-08-19 20:10:50'),(137,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": 400000, \"parcelas\": 7, \"clienteId\": 12, \"produtoId\": 2}','2026-08-19 20:10:56'),(138,NULL,'POST /api/v1/inbox','127.0.0.1','{\"assunto\": \"Anexo de Arquivo - Solicitação #13\", \"conteudo\": \"O cliente vinculou o documento do seu arquivo (ID: 3) à solicitação de crédito #13.\", \"remetenteNome\": \"Ana Ferreira\", \"remetenteTipo\": \"CLIENTE\", \"destinatarioNome\": \"Departamento de Crédito\", \"destinatarioTipo\": \"ADMIN\"}','2026-08-19 20:10:56'),(139,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": 400000, \"parcelas\": 7, \"clienteId\": 12, \"produtoId\": 2}','2026-08-19 20:14:24'),(140,NULL,'POST /api/v1/inbox','127.0.0.1','{\"assunto\": \"Anexo de Arquivo - Solicitação #14\", \"conteudo\": \"O cliente vinculou o documento do seu arquivo (ID: 3) à solicitação de crédito #14.\", \"remetente_nome\": \"Ana Ferreira\", \"remetente_tipo\": \"CLIENTE\", \"destinatario_nome\": \"Departamento de Crédito\", \"destinatario_tipo\": \"ADMIN\"}','2026-08-19 20:14:24'),(141,NULL,'PATCH /api/v1/solicitacoes/14/status','127.0.0.1','{\"status\": \"APROVADO\"}','2026-08-19 20:14:40'),(142,NULL,'PATCH /api/v1/solicitacoes/9/status','127.0.0.1','{\"status\": \"REPROVADO\"}','2026-08-19 20:17:52'),(143,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": 3000000, \"parcelas\": 6, \"clienteId\": 12, \"finalidade\": \"Expansão Comercial / Equipamento\"}','2026-08-19 20:21:35'),(144,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-19 20:23:37'),(145,NULL,'PATCH /api/v1/solicitacoes/13/status','127.0.0.1','{\"status\": \"REPROVADO\"}','2026-08-19 20:23:46'),(146,NULL,'PATCH /api/v1/solicitacoes/13/status','127.0.0.1','{\"status\": \"REJEITADO\"}','2026-08-19 20:25:06'),(147,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"ana.ferreira@exemplo.com\"}','2026-08-19 20:25:31'),(148,NULL,'POST /api/v1/solicitacoes/12/documentos','127.0.0.1','{\"documento\": {\"meta\": {}, \"size\": 166548, \"type\": \"application\", \"state\": \"consumed\", \"errors\": [], \"extname\": \"pdf\", \"isValid\": true, \"subtype\": \"pdf\", \"fieldName\": \"documento\", \"validated\": false, \"clientName\": \"BI_ANC.pdf\"}, \"tipoDocumento\": \"COMPROVATIVO\"}','2026-08-19 20:25:50'),(149,NULL,'POST /api/v1/inbox','127.0.0.1','{\"assunto\": \"223\", \"conteudo\": \"323\", \"remetenteNome\": \"Ana Ferreira\", \"remetenteTipo\": \"CLIENTE\", \"destinatarioNome\": \"Administração Gloxis\", \"destinatarioTipo\": \"ADMIN\"}','2026-08-19 20:28:46'),(150,NULL,'POST /api/v1/inbox','127.0.0.1','{\"assunto\": \"vamos\", \"conteudo\": \"22\", \"remetente_nome\": \"Ana Ferreira\", \"remetente_tipo\": \"CLIENTE\", \"destinatario_nome\": \"Administração Gloxis\", \"destinatario_tipo\": \"ADMIN\"}','2026-08-19 20:40:06'),(151,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-19 20:40:24');
/*!40000 ALTER TABLE `audit_logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_access_tokens`
--

DROP TABLE IF EXISTS `auth_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `auth_access_tokens` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_id` int unsigned NOT NULL,
  `type` varchar(255) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `hash` varchar(255) NOT NULL,
  `abilities` text NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `auth_access_tokens_tokenable_id_foreign` (`tokenable_id`),
  CONSTRAINT `auth_access_tokens_tokenable_id_foreign` FOREIGN KEY (`tokenable_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_access_tokens`
--

LOCK TABLES `auth_access_tokens` WRITE;
/*!40000 ALTER TABLE `auth_access_tokens` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_access_tokens` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `campanhas`
--

DROP TABLE IF EXISTS `campanhas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `campanhas` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `descricao` varchar(255) DEFAULT NULL,
  `desconto_taxa_juros` decimal(5,2) DEFAULT '0.00',
  `percentual_cashback` decimal(5,2) DEFAULT '0.00',
  `data_inicio` datetime NOT NULL,
  `data_fim` datetime NOT NULL,
  `ativo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `campanhas`
--

LOCK TABLES `campanhas` WRITE;
/*!40000 ALTER TABLE `campanhas` DISABLE KEYS */;
/*!40000 ALTER TABLE `campanhas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `classificacao_clientes`
--

DROP TABLE IF EXISTS `classificacao_clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `classificacao_clientes` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `cliente_id` int unsigned DEFAULT NULL,
  `nivel` enum('BRONZE','PRATA','OURO','PLATINUM','PREMIUM') DEFAULT 'BRONZE',
  `pontos_fidelidade` int DEFAULT '0',
  `creditos_pagos_sucesso` int DEFAULT '0',
  `valor_total_pago` decimal(12,2) DEFAULT '0.00',
  `dias_medios_atraso` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `classificacao_clientes_cliente_id_unique` (`cliente_id`),
  CONSTRAINT `classificacao_clientes_cliente_id_foreign` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `classificacao_clientes`
--

LOCK TABLES `classificacao_clientes` WRITE;
/*!40000 ALTER TABLE `classificacao_clientes` DISABLE KEYS */;
/*!40000 ALTER TABLE `classificacao_clientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clientes`
--

DROP TABLE IF EXISTS `clientes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clientes` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `nif` varchar(255) NOT NULL,
  `documentos` text,
  `endereco` text,
  `conta_bancaria` text,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `is_lista_negra` tinyint(1) DEFAULT '0',
  `classificacao` enum('NOVO','BRONZE','PRATA','OURO') DEFAULT 'NOVO',
  `email` varchar(255) DEFAULT NULL,
  `telefone` varchar(255) DEFAULT NULL,
  `user_id` int unsigned DEFAULT NULL,
  `fotografia` varchar(255) DEFAULT NULL,
  `logotipo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `clientes_nif_unique` (`nif`),
  KEY `clientes_user_id_foreign` (`user_id`),
  CONSTRAINT `clientes_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes`
--

LOCK TABLES `clientes` WRITE;
/*!40000 ALTER TABLE `clientes` DISABLE KEYS */;
INSERT INTO `clientes` VALUES (1,'Maria Silva','123456789','[]','{\"rua\":\"Av. Central\",\"numero\":100}','{\"banco\":\"Banco X\",\"agencia\":\"0001\",\"conta\":\"12345-6\"}','2026-04-07 00:29:18','2026-08-19 19:12:36',0,'NOVO','maria.silva@exemplo.com','923000001',8,NULL,NULL),(2,'João Santos','987654321','[]','{\"rua\":\"Rua das Flores\",\"numero\":45}','{\"banco\":\"Banco Y\",\"agencia\":\"0022\",\"conta\":\"98765-4\"}','2026-03-18 00:29:18','2026-08-19 19:12:36',0,'NOVO','joao.santos@exemplo.com','923000002',9,NULL,NULL),(5,'Noé Magalhães','54324',NULL,NULL,NULL,'2026-08-15 00:38:02','2026-08-15 00:38:02',0,'NOVO',NULL,NULL,NULL,NULL,NULL),(6,'Noé Magalhães','33444',NULL,'Angola, Luanda','434343','2026-08-15 00:42:03','2026-08-15 00:42:03',0,'NOVO','ola@gmail.com','443',NULL,NULL,NULL),(7,'Teste','12345',NULL,NULL,NULL,'2026-08-15 00:46:02','2026-08-15 00:46:02',0,'NOVO','teste@teste.com',NULL,NULL,NULL,NULL),(8,'Teste','NIF888',NULL,'Rua A','IBAN123','2026-08-15 00:46:21','2026-08-15 00:46:21',0,'NOVO','teste@teste.com','123',NULL,NULL,NULL),(9,'Noé Magalhães','34343',NULL,'Angola, Luanda','23232','2026-08-15 00:48:23','2026-08-15 00:48:23',0,'NOVO','ola@gmail.com','3443',NULL,NULL,NULL),(10,'Noé Magalhães','243424',NULL,'Angola, Luanda','232323','2026-08-15 01:08:00','2026-08-19 19:06:38',0,'NOVO','noe.francisco@gmail.com','22323',6,'/uploads/clientes/fotografias/9844940d-f379-4c47-90a1-e85390bd373c.png','/uploads/clientes/logotipos/aa08ab39-f2fe-4a10-98e0-e3545b268cb5.png'),(12,'Ana Ferreira','456789123','[]','Rua da Paz, 12','Banco: Banco Z | Agência: 0033 | Conta: 11223-5','2026-08-19 19:12:36','2026-08-19 20:04:33',0,'NOVO','ana.ferreira@exemplo.com','923000003',10,NULL,NULL);
/*!40000 ALTER TABLE `clientes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `compras`
--

DROP TABLE IF EXISTS `compras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `compras` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `fornecedor_id` int unsigned DEFAULT NULL,
  `valor` decimal(12,2) DEFAULT NULL,
  `status` varchar(255) DEFAULT 'PENDENTE',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `fornecedor_nome` varchar(255) DEFAULT NULL,
  `fornecedor_nif` varchar(255) DEFAULT NULL,
  `categoria` varchar(255) DEFAULT 'GERAL',
  `forma_pagamento` varchar(255) DEFAULT 'TRANSFERENCIA',
  `itens_json` text,
  `notas` text,
  `comprador` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `compras`
--

LOCK TABLES `compras` WRITE;
/*!40000 ALTER TABLE `compras` DISABLE KEYS */;
INSERT INTO `compras` VALUES (1,NULL,1400000.00,'PENDENTE','2026-08-15 20:04:26','2026-08-15 20:04:26','DD','ssd','LICENCAS','CHEQUE','[{\"descricao\":\"Servidores Dell PowerEdge R750\",\"qtd\":1,\"precoUnit\":1250000},{\"descricao\":\"Manutenção de Infraestrutura\",\"qtd\":1,\"precoUnit\":150000}]',NULL,'Diretor de Operações Gloxis');
/*!40000 ALTER TABLE `compras` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `configuracoes`
--

DROP TABLE IF EXISTS `configuracoes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `configuracoes` (
  `chave` varchar(255) NOT NULL,
  `valor` text,
  `created_at` timestamp NOT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`chave`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `configuracoes`
--

LOCK TABLES `configuracoes` WRITE;
/*!40000 ALTER TABLE `configuracoes` DISABLE KEYS */;
/*!40000 ALTER TABLE `configuracoes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contratos`
--

DROP TABLE IF EXISTS `contratos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contratos` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT 'ATIVO',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `tipo` varchar(255) DEFAULT 'PRESTACAO_SERVICOS',
  `parte_contratante` varchar(255) DEFAULT NULL,
  `valor_contrato` decimal(12,2) DEFAULT '0.00',
  `data_inicio` date DEFAULT NULL,
  `data_fim` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contratos`
--

LOCK TABLES `contratos` WRITE;
/*!40000 ALTER TABLE `contratos` DISABLE KEYS */;
/*!40000 ALTER TABLE `contratos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `desembolsos`
--

DROP TABLE IF EXISTS `desembolsos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `desembolsos` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `solicitacao_id` int unsigned DEFAULT NULL,
  `valor_desembolsado` decimal(15,2) NOT NULL,
  `metodo` enum('TRANSFERENCIA','DINHEIRO','CHEQUE') NOT NULL,
  `comprovante_path` varchar(255) DEFAULT NULL,
  `status` enum('PENDENTE','REALIZADO','FALHADO') DEFAULT 'PENDENTE',
  `data_desembolso` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `desembolsos_solicitacao_id_foreign` (`solicitacao_id`),
  CONSTRAINT `desembolsos_solicitacao_id_foreign` FOREIGN KEY (`solicitacao_id`) REFERENCES `solicitacao_creditos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `desembolsos`
--

LOCK TABLES `desembolsos` WRITE;
/*!40000 ALTER TABLE `desembolsos` DISABLE KEYS */;
/*!40000 ALTER TABLE `desembolsos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `documentos`
--

DROP TABLE IF EXISTS `documentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `documentos` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) DEFAULT NULL,
  `caminho` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `categoria` varchar(255) DEFAULT 'OUTRO',
  `departamento` varchar(255) DEFAULT 'GERAL',
  `status` varchar(255) DEFAULT 'PENDENTE',
  `cliente_nome` varchar(255) DEFAULT NULL,
  `cliente_email` varchar(255) DEFAULT NULL,
  `notas` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `documentos`
--

LOCK TABLES `documentos` WRITE;
/*!40000 ALTER TABLE `documentos` DISABLE KEYS */;
INSERT INTO `documentos` VALUES (1,'Vector 51.png','/uploads/documentos/1786757676656_Vector_51.png','2026-08-15 01:34:36','2026-08-15 01:34:50','KYC','RISCO','REJEITADO',NULL,NULL,NULL),(2,'BI_ANC','/uploads/documentos/1787168606822_BI_ANC.pdf','2026-08-19 19:43:26','2026-08-19 19:43:26','CONTRATO','ARQUIVO_CLIENTE','PENDENTE','Ana Ferreira','ana.ferreira@exemplo.com',NULL),(3,'Laur_','/uploads/documentos/1787168630788_Laur_.pdf','2026-08-19 19:43:50','2026-08-19 19:43:50','COMPROVATIVO','ARQUIVO_CLIENTE','PENDENTE','Ana Ferreira','ana.ferreira@exemplo.com',NULL);
/*!40000 ALTER TABLE `documentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `faturas`
--

DROP TABLE IF EXISTS `faturas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faturas` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `cliente_id` int unsigned DEFAULT NULL,
  `valor` decimal(12,2) DEFAULT NULL,
  `status` varchar(255) DEFAULT 'EMITIDA',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `cliente_nome` varchar(255) DEFAULT NULL,
  `cliente_nif` varchar(255) DEFAULT NULL,
  `tipo_documento` varchar(255) DEFAULT 'FT',
  `valor_imposto` decimal(12,2) DEFAULT '0.00',
  `valor_retencao` decimal(12,2) DEFAULT '0.00',
  `hash_agt` varchar(255) DEFAULT NULL,
  `itens_json` text,
  `data_vencimento` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `faturas`
--

LOCK TABLES `faturas` WRITE;
/*!40000 ALTER TABLE `faturas` DISABLE KEYS */;
INSERT INTO `faturas` VALUES (1,1,0.00,'EMITIDA','2026-08-19 19:08:44','2026-08-19 19:08:44','Cliente Consumidor Final','5418009900','FT',0.00,0.00,'BB5AAE5CA794BFFE','[]','2026-09-18');
/*!40000 ALTER TABLE `faturas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `funcionarios`
--

DROP TABLE IF EXISTS `funcionarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `funcionarios` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) DEFAULT NULL,
  `cargo` varchar(255) DEFAULT NULL,
  `salario` decimal(12,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `departamento` varchar(255) DEFAULT 'TI & ENGENHARIA',
  `nif` varchar(255) DEFAULT NULL,
  `iban` varchar(255) DEFAULT NULL,
  `status` varchar(255) DEFAULT 'ATIVO',
  `subsidio_alimentacao` decimal(12,2) DEFAULT '30000.00',
  `subsidio_transporte` decimal(12,2) DEFAULT '25000.00',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `funcionarios`
--

LOCK TABLES `funcionarios` WRITE;
/*!40000 ALTER TABLE `funcionarios` DISABLE KEYS */;
/*!40000 ALTER TABLE `funcionarios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `garantias`
--

DROP TABLE IF EXISTS `garantias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `garantias` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `solicitacao_id` int unsigned DEFAULT NULL,
  `tipo` enum('FIADOR','IMOVEL','VEICULO','OUTROS') NOT NULL,
  `valor_estimado` decimal(12,2) NOT NULL,
  `descricao` text NOT NULL,
  `detalhes` json DEFAULT NULL,
  `status_avaliacao` enum('PENDENTE','AVALIADO','REJEITADO') DEFAULT 'PENDENTE',
  `valor_avaliado` decimal(12,2) DEFAULT NULL,
  `avaliado_por` int unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `garantias_solicitacao_id_foreign` (`solicitacao_id`),
  KEY `garantias_avaliado_por_foreign` (`avaliado_por`),
  CONSTRAINT `garantias_avaliado_por_foreign` FOREIGN KEY (`avaliado_por`) REFERENCES `users` (`id`),
  CONSTRAINT `garantias_solicitacao_id_foreign` FOREIGN KEY (`solicitacao_id`) REFERENCES `solicitacao_creditos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `garantias`
--

LOCK TABLES `garantias` WRITE;
/*!40000 ALTER TABLE `garantias` DISABLE KEYS */;
/*!40000 ALTER TABLE `garantias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lancamentos_contabeis`
--

DROP TABLE IF EXISTS `lancamentos_contabeis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lancamentos_contabeis` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `conta` varchar(255) DEFAULT NULL,
  `valor` decimal(12,2) DEFAULT NULL,
  `tipo` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `codigo_conta` varchar(255) DEFAULT '11.1',
  `descricao` varchar(255) DEFAULT NULL,
  `diario` varchar(255) DEFAULT 'Diário Geral',
  `exercicio_fiscal` varchar(255) DEFAULT '2026',
  `criado_por` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lancamentos_contabeis`
--

LOCK TABLES `lancamentos_contabeis` WRITE;
/*!40000 ALTER TABLE `lancamentos_contabeis` DISABLE KEYS */;
/*!40000 ALTER TABLE `lancamentos_contabeis` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lista_negras`
--

DROP TABLE IF EXISTS `lista_negras`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lista_negras` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `cliente_id` int unsigned DEFAULT NULL,
  `motivo` varchar(255) NOT NULL,
  `data_inclusao` timestamp NOT NULL,
  `ativo` tinyint(1) DEFAULT '1',
  `removido_por` int unsigned DEFAULT NULL,
  `data_remocao` timestamp NULL DEFAULT NULL,
  `justificativa_remocao` text,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `lista_negras_cliente_id_foreign` (`cliente_id`),
  KEY `lista_negras_removido_por_foreign` (`removido_por`),
  CONSTRAINT `lista_negras_cliente_id_foreign` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `lista_negras_removido_por_foreign` FOREIGN KEY (`removido_por`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lista_negras`
--

LOCK TABLES `lista_negras` WRITE;
/*!40000 ALTER TABLE `lista_negras` DISABLE KEYS */;
INSERT INTO `lista_negras` VALUES (1,1,'[INADIMPLENCIA_PROLONGADA]','2026-08-15 22:36:42',1,NULL,NULL,NULL,'2026-08-15 22:36:42','2026-08-15 22:36:42');
/*!40000 ALTER TABLE `lista_negras` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mensagens_inbox`
--

DROP TABLE IF EXISTS `mensagens_inbox`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mensagens_inbox` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `remetente_id` int unsigned DEFAULT NULL,
  `remetente_nome` varchar(255) NOT NULL,
  `remetente_tipo` varchar(255) DEFAULT 'ADMIN',
  `destinatario_id` int unsigned DEFAULT NULL,
  `destinatario_nome` varchar(255) NOT NULL,
  `destinatario_tipo` varchar(255) DEFAULT 'CLIENTE',
  `assunto` varchar(255) NOT NULL,
  `conteudo` text NOT NULL,
  `documento_id` int unsigned DEFAULT NULL,
  `lida` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mensagens_inbox`
--

LOCK TABLES `mensagens_inbox` WRITE;
/*!40000 ALTER TABLE `mensagens_inbox` DISABLE KEYS */;
INSERT INTO `mensagens_inbox` VALUES (1,NULL,'Administrador','ADMIN',NULL,'887','CLIENTE','888','8888',1,1,'2026-08-15 01:35:06','2026-08-15 01:35:12'),(2,NULL,'Administrador','ADMIN',NULL,'887','CLIENTE','Resposta Direta para 887','Documento anexado à conversa.',1,0,'2026-08-15 01:39:05','2026-08-15 01:39:05'),(3,NULL,'Administrador','ADMIN',NULL,'887','CLIENTE','Resposta Direta para 887','oaksk',NULL,0,'2026-08-15 01:42:01','2026-08-15 01:42:01'),(4,NULL,'Administrador','ADMIN',NULL,'887','CLIENTE','Resposta Direta para 887','sols',NULL,0,'2026-08-15 01:42:03','2026-08-15 01:42:03'),(5,NULL,'Ana Ferreira','CLIENTE',NULL,'Administração','ADMIN','[Consultoria] Agendamento de Chamada (VIDEO)','O cliente solicitou uma consultoria financeira.\n\nDetalhes:\nData: 2026-09-02\nHora: 10:00\nTipo: Videochamada',NULL,0,'2026-08-19 19:18:29','2026-08-19 19:18:29'),(6,NULL,'Ana Ferreira','CLIENTE',NULL,'Departamento de Crédito','ADMIN','Anexo de Arquivo - Solicitação #14','O cliente vinculou o documento do seu arquivo (ID: 3) à solicitação de crédito #14.',NULL,0,'2026-08-19 20:14:24','2026-08-19 20:14:24'),(7,NULL,'Ana Ferreira','CLIENTE',NULL,'Administração Gloxis','ADMIN','vamos','22',NULL,0,'2026-08-19 20:40:06','2026-08-19 20:40:06');
/*!40000 ALTER TABLE `mensagens_inbox` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pagamentos`
--

DROP TABLE IF EXISTS `pagamentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pagamentos` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `solicitacao_id` int unsigned DEFAULT NULL,
  `numero_parcela` int unsigned NOT NULL,
  `valor_pago` decimal(15,2) NOT NULL,
  `valor_juros_mora` decimal(15,2) DEFAULT '0.00',
  `valor_multa` decimal(15,2) DEFAULT '0.00',
  `metodo` enum('TRANSFERENCIA','MULTICAIXA','DINHEIRO') NOT NULL,
  `recibo_path` varchar(255) DEFAULT NULL,
  `status` enum('PENDENTE','PROCESSADO','REJEITADO','ATRASADO') DEFAULT 'PENDENTE',
  `data_vencimento` timestamp NOT NULL,
  `data_pagamento` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `valor_parcela` decimal(15,2) NOT NULL DEFAULT '0.00',
  `descricao` varchar(255) DEFAULT NULL,
  `tipo` varchar(255) DEFAULT 'RECEITA',
  `categoria` varchar(255) DEFAULT 'OPERACIONAL',
  `entidade_nome` varchar(255) DEFAULT NULL,
  `conta_bancaria` varchar(255) DEFAULT 'BFA - Conta Corrente Principal',
  PRIMARY KEY (`id`),
  KEY `pagamentos_solicitacao_id_foreign` (`solicitacao_id`),
  CONSTRAINT `pagamentos_solicitacao_id_foreign` FOREIGN KEY (`solicitacao_id`) REFERENCES `solicitacao_creditos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pagamentos`
--

LOCK TABLES `pagamentos` WRITE;
/*!40000 ALTER TABLE `pagamentos` DISABLE KEYS */;
/*!40000 ALTER TABLE `pagamentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `produto_creditos`
--

DROP TABLE IF EXISTS `produto_creditos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `produto_creditos` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `descricao` text,
  `taxa_juros_mensal` decimal(5,4) NOT NULL,
  `prazo_minimo_meses` int NOT NULL,
  `prazo_maximo_meses` int NOT NULL,
  `valor_minimo` decimal(12,2) NOT NULL,
  `valor_maximo` decimal(12,2) NOT NULL,
  `ativo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL,
  `updated_at` timestamp NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `produto_creditos`
--

LOCK TABLES `produto_creditos` WRITE;
/*!40000 ALTER TABLE `produto_creditos` DISABLE KEYS */;
INSERT INTO `produto_creditos` VALUES (1,'Microcrédito Empreendedor (Popular)','Crédito voltado para pequenos negócios informais.',0.0500,3,12,50000.00,1000000.00,1,'2026-08-14 23:25:06','2026-08-14 23:25:06'),(2,'Crédito Pessoal (Funcionário Público)','Crédito com taxas reduzidas para servidores.',0.0350,6,60,100000.00,5000000.00,1,'2026-08-14 23:25:06','2026-08-14 23:25:06'),(3,'Microcrédito Empreendedor (Popular)','Crédito voltado para pequenos negócios informais.',0.0500,3,12,50000.00,1000000.00,1,'2026-08-14 23:25:28','2026-08-14 23:25:28'),(4,'Crédito Pessoal (Funcionário Público)','Crédito com taxas reduzidas para servidores.',0.0350,6,60,100000.00,5000000.00,1,'2026-08-14 23:25:28','2026-08-14 23:25:28'),(5,'Microcrédito Empreendedor (Popular)','Crédito voltado para pequenos negócios informais.',0.0500,3,12,50000.00,1000000.00,1,'2026-08-14 23:27:06','2026-08-14 23:27:06'),(6,'Crédito Pessoal (Funcionário Público)','Crédito com taxas reduzidas para servidores.',0.0350,6,60,100000.00,5000000.00,1,'2026-08-14 23:27:06','2026-08-14 23:27:06'),(7,'Microcrédito Empreendedor (Popular)','Crédito voltado para pequenos negócios informais.',0.0500,3,12,50000.00,1000000.00,1,'2026-08-14 23:32:52','2026-08-14 23:32:52'),(8,'Crédito Pessoal (Funcionário Público)','Crédito com taxas reduzidas para servidores.',0.0350,6,60,100000.00,5000000.00,1,'2026-08-14 23:32:52','2026-08-14 23:32:52'),(9,'Microcrédito Empreendedor (Popular)','Crédito voltado para pequenos negócios informais.',0.0500,3,12,50000.00,1000000.00,1,'2026-08-19 19:02:48','2026-08-19 19:02:48'),(10,'Crédito Pessoal (Funcionário Público)','Crédito com taxas reduzidas para servidores.',0.0350,6,60,100000.00,5000000.00,1,'2026-08-19 19:02:48','2026-08-19 19:02:48'),(11,'Microcrédito Empreendedor (Popular)','Crédito voltado para pequenos negócios informais.',0.0500,3,12,50000.00,1000000.00,1,'2026-08-19 19:12:36','2026-08-19 19:12:36'),(12,'Crédito Pessoal (Funcionário Público)','Crédito com taxas reduzidas para servidores.',0.0350,6,60,100000.00,5000000.00,1,'2026-08-19 19:12:36','2026-08-19 19:12:36');
/*!40000 ALTER TABLE `produto_creditos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `projetos`
--

DROP TABLE IF EXISTS `projetos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `projetos` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) DEFAULT NULL,
  `orcamento` decimal(12,2) DEFAULT NULL,
  `status` varchar(255) DEFAULT 'EM_ANDAMENTO',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `gerente_projeto` varchar(255) DEFAULT NULL,
  `cliente_nome` varchar(255) DEFAULT NULL,
  `progresso_percentual` int DEFAULT '0',
  `data_inicio` date DEFAULT NULL,
  `data_prevista_fim` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `projetos`
--

LOCK TABLES `projetos` WRITE;
/*!40000 ALTER TABLE `projetos` DISABLE KEYS */;
INSERT INTO `projetos` VALUES (1,'Noah Magalhases',3500000.00,'CONCLUIDO','2026-08-19 19:07:33','2026-08-19 19:07:40','Eng. Manuel San2323tos','Cliente Interno / Corporativo',0,'2026-08-19','2027-02-15');
/*!40000 ALTER TABLE `projetos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `renegociacoes`
--

DROP TABLE IF EXISTS `renegociacoes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `renegociacoes` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `solicitacao_id` int unsigned DEFAULT NULL,
  `cliente_id` int unsigned DEFAULT NULL,
  `saldo_devedor_original` decimal(12,2) NOT NULL,
  `juros_mora_perdoados` decimal(12,2) DEFAULT '0.00',
  `multas_perdoadas` decimal(12,2) DEFAULT '0.00',
  `novo_saldo_devedor` decimal(12,2) NOT NULL,
  `novas_parcelas` int NOT NULL,
  `nova_taxa_juros` decimal(5,2) NOT NULL,
  `status` enum('PENDENTE_APROVACAO','APROVADO','REJEITADO') DEFAULT 'PENDENTE_APROVACAO',
  `aprovado_por` int unsigned DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `renegociacoes_solicitacao_id_foreign` (`solicitacao_id`),
  KEY `renegociacoes_cliente_id_foreign` (`cliente_id`),
  KEY `renegociacoes_aprovado_por_foreign` (`aprovado_por`),
  CONSTRAINT `renegociacoes_aprovado_por_foreign` FOREIGN KEY (`aprovado_por`) REFERENCES `users` (`id`),
  CONSTRAINT `renegociacoes_cliente_id_foreign` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE CASCADE,
  CONSTRAINT `renegociacoes_solicitacao_id_foreign` FOREIGN KEY (`solicitacao_id`) REFERENCES `solicitacao_creditos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `renegociacoes`
--

LOCK TABLES `renegociacoes` WRITE;
/*!40000 ALTER TABLE `renegociacoes` DISABLE KEYS */;
/*!40000 ALTER TABLE `renegociacoes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `solicitacao_creditos`
--

DROP TABLE IF EXISTS `solicitacao_creditos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `solicitacao_creditos` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `cliente_id` int unsigned DEFAULT NULL,
  `valor` decimal(15,2) NOT NULL,
  `parcelas` int unsigned NOT NULL,
  `status` enum('PENDENTE','APROVADO','REJEITADO') DEFAULT 'PENDENTE',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `solicitacao_creditos_cliente_id_foreign` (`cliente_id`),
  CONSTRAINT `solicitacao_creditos_cliente_id_foreign` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `solicitacao_creditos`
--

LOCK TABLES `solicitacao_creditos` WRITE;
/*!40000 ALTER TABLE `solicitacao_creditos` DISABLE KEYS */;
INSERT INTO `solicitacao_creditos` VALUES (1,1,5000.00,12,'PENDENTE','2026-04-25 00:29:18','2026-04-25 00:29:18'),(2,2,12000.50,24,'APROVADO','2026-05-12 00:29:18','2026-05-12 00:29:18'),(3,1,5000.00,12,'PENDENTE','2026-05-26 00:29:18','2026-05-26 00:29:18'),(4,2,12000.50,24,'APROVADO','2026-08-11 00:29:18','2026-08-11 00:29:18'),(5,1,5000.00,12,'PENDENTE','2026-06-04 00:29:18','2026-06-04 00:29:18'),(6,2,12000.50,24,'APROVADO','2026-08-06 00:29:18','2026-08-06 00:29:18'),(7,1,5000.00,12,'PENDENTE','2026-08-19 19:02:48','2026-08-19 19:02:48'),(8,2,12000.50,24,'APROVADO','2026-08-19 19:02:48','2026-08-19 19:02:48'),(9,1,5000.00,12,'PENDENTE','2026-08-19 19:12:36','2026-08-19 19:12:36'),(10,2,12000.50,24,'APROVADO','2026-08-19 19:12:36','2026-08-19 19:12:36'),(11,12,50001.00,4,'PENDENTE','2026-08-19 19:30:05','2026-08-19 19:30:05'),(12,12,210000.00,5,'APROVADO','2026-08-19 19:47:13','2026-08-19 20:09:34'),(13,12,400000.00,7,'REJEITADO','2026-08-19 20:10:56','2026-08-19 20:25:06'),(14,12,400000.00,7,'APROVADO','2026-08-19 20:14:24','2026-08-19 20:14:40');
/*!40000 ALTER TABLE `solicitacao_creditos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `solicitacao_documentos`
--

DROP TABLE IF EXISTS `solicitacao_documentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `solicitacao_documentos` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `solicitacao_id` int unsigned DEFAULT NULL,
  `tipo_documento` varchar(255) NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `content_type` varchar(255) NOT NULL,
  `size` int NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `solicitacao_documentos_solicitacao_id_foreign` (`solicitacao_id`),
  CONSTRAINT `solicitacao_documentos_solicitacao_id_foreign` FOREIGN KEY (`solicitacao_id`) REFERENCES `solicitacao_creditos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `solicitacao_documentos`
--

LOCK TABLES `solicitacao_documentos` WRITE;
/*!40000 ALTER TABLE `solicitacao_documentos` DISABLE KEYS */;
/*!40000 ALTER TABLE `solicitacao_documentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock_items`
--

DROP TABLE IF EXISTS `stock_items`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock_items` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `produto_id` int unsigned DEFAULT NULL,
  `quantidade` int DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `nome` varchar(255) DEFAULT NULL,
  `codigo_sku` varchar(255) DEFAULT NULL,
  `categoria` varchar(255) DEFAULT 'GERAL',
  `preco_unitario` decimal(12,2) DEFAULT '0.00',
  `localizacao` varchar(255) DEFAULT 'Armazém Central - Luanda',
  `minimo_alerta` int DEFAULT '10',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock_items`
--

LOCK TABLES `stock_items` WRITE;
/*!40000 ALTER TABLE `stock_items` DISABLE KEYS */;
INSERT INTO `stock_items` VALUES (1,5576,10,'2026-08-15 20:04:46','2026-08-15 20:48:19','333','333','ESCRITORIO',25000.00,'Armazém Filial - Benguela',10);
/*!40000 ALTER TABLE `stock_items` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tramitacoes_documento`
--

DROP TABLE IF EXISTS `tramitacoes_documento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tramitacoes_documento` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `documento_id` int unsigned NOT NULL,
  `origem` varchar(255) NOT NULL,
  `destino` varchar(255) NOT NULL,
  `despacho` text,
  `usuario` varchar(255) DEFAULT 'Sistema',
  `status_anterior` varchar(255) DEFAULT 'PENDENTE',
  `status_novo` varchar(255) DEFAULT 'EM_ANALISE',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tramitacoes_documento`
--

LOCK TABLES `tramitacoes_documento` WRITE;
/*!40000 ALTER TABLE `tramitacoes_documento` DISABLE KEYS */;
INSERT INTO `tramitacoes_documento` VALUES (1,1,'Recepção / Upload','GERAL','Documento submetido para a infraestrutura de arquivo.','Sistema','NOVO','PENDENTE','2026-08-15 01:34:36','2026-08-15 01:34:36'),(2,1,'GERAL','RISCO','kkjj','Administrador','PENDENTE','REJEITADO','2026-08-15 01:34:50','2026-08-15 01:34:50'),(3,2,'Recepção / Upload','ARQUIVO_CLIENTE','Documento submetido para a infraestrutura de arquivo.','Sistema','NOVO','PENDENTE','2026-08-19 19:43:26','2026-08-19 19:43:26'),(4,3,'Recepção / Upload','ARQUIVO_CLIENTE','Documento submetido para a infraestrutura de arquivo.','Sistema','NOVO','PENDENTE','2026-08-19 19:43:50','2026-08-19 19:43:50');
/*!40000 ALTER TABLE `tramitacoes_documento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `full_name` varchar(255) DEFAULT NULL,
  `email` varchar(254) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `role` varchar(255) NOT NULL DEFAULT 'CLIENTE',
  `two_factor_secret` varchar(255) DEFAULT NULL,
  `two_factor_enabled` tinyint(1) DEFAULT '0',
  `reset_password_token` varchar(255) DEFAULT NULL,
  `reset_password_expires` timestamp NULL DEFAULT NULL,
  `must_change_password` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Administrador Supremo','admin@gloxis.com','$scrypt$n=16384,r=8,p=1$oreeumCKKZ2YcMpz25H4WA$eA+okD4F/Pmi/dZvjSj5wtVPZoa3RLP5c4U/nA4rP+m8n0cMn7eBoHxS6jTjAkmjA91F4lFdvBvEBvpP5xRsWQ','2026-08-14 23:25:06','2026-08-19 19:15:13','ADMIN',NULL,0,NULL,NULL,0),(2,'Gestor de Crédito','gestor@gloxis.com','$scrypt$n=16384,r=8,p=1$pJW2atYp9GF2UMR231XhAA$tXQtbyMxWPX/yXtHZRijK+G4RiZX/ZUMmp3v26S9s/BdI6lLQWDLceB79tYekcS+tPIwlYUfggmU+O6gD+WEEA','2026-08-14 23:25:06','2026-08-19 19:15:13','GESTOR',NULL,0,NULL,NULL,0),(3,'Diretor Financeiro','diretor@gloxis.com','$scrypt$n=16384,r=8,p=1$jqCbsXsgWo8pJNcq/tCaCg$u1OqHX/123kG5wl3+CyEndeAFbg1c830ExNffy2CpD8uCkaC8lOvqNvHuClOSo7hwYmdOhKf3nP6xUa+dksLCA','2026-08-14 23:25:06','2026-08-19 19:15:13','DIRETOR',NULL,0,NULL,NULL,0),(4,'João Cliente','cliente@exemplo.com','$scrypt$n=16384,r=8,p=1$YVh4i9mrSxIkInpsSxQvIg$SVNZUECFTuGYBmH09TfICNuXYPF4pg3emmDbW7QxRxYI3i2gd6ZnhNB/FRzFR7DAODz/JUOuP08wj0Vp3X71iA','2026-08-14 23:25:07','2026-08-19 19:15:15','CLIENTE',NULL,0,NULL,NULL,1),(5,'Test','test@gloxis.com','$scrypt$n=16384,r=8,p=1$gIXeVHzXwq4d+KplfpOP/A$NB1Ywv6a2aMdtn7Stxx3d0Uz4TmoaRbhXHLs+9AaYODaf51vfwwiJMtup7YFsZZ6LZmyN/eBfIlXbEEtLEkbIg','2026-08-14 23:31:19','2026-08-19 19:15:15','CLIENTE',NULL,0,NULL,NULL,0),(6,'Noé Magalhães','noe.francisco@gmail.com','$scrypt$n=16384,r=8,p=1$KaVua1UCYUIz03JUPSMJkQ$E8GMlH+REpmsZNh81CjQ01rgzw/3n1NOiaWGVmK8Fx7+eb/UEJIhqaNjYikcodOrt3KneztapEw6unMQmhF+WA','2026-08-15 01:08:00','2026-08-19 19:15:15','CLIENTE',NULL,0,NULL,NULL,0),(7,'Ana Operadora','ana@gloxis.com','$scrypt$n=16384,r=8,p=1$UZEFxxUUHqNaVyd24ozIMg$MRT+SOWmnjDmpZRqLbKDXW/GZMBwHn8JK3NBjYFT+N5yu2wtBmntW3GjhU1PyxcACklFAKNiVHKH3kxTuz99Dg','2026-08-15 22:16:44','2026-08-15 22:16:44','ANALISTA_CREDITO',NULL,0,NULL,NULL,0),(8,'Maria Silva','maria.silva@exemplo.com','$scrypt$n=16384,r=8,p=1$AY8CYoPQ4dg52lHqV60cUg$kENJHKAY0FdpEIoV2YYAgR99CTznG4nLfrBGFhDcLLYXUYftwU/gTnL/lZ8tEaWUfSo0teNPcV2XxD5VmhaKwg','2026-08-19 19:12:36','2026-08-19 19:15:15','CLIENTE',NULL,0,NULL,NULL,0),(9,'João Santos','joao.santos@exemplo.com','$scrypt$n=16384,r=8,p=1$3xzOAsd15tJEx+4MQ7JgXQ$QqLcYAMoerVXtk3uGR/aRVwP5uHD8cOjPLHh1WA+z8fN8WOJGOx1DZddwMI03hJmTgf1URor+Yt6iBv+qgVVHw','2026-08-19 19:12:36','2026-08-19 19:15:15','CLIENTE',NULL,0,NULL,NULL,0),(10,'Ana Ferreira','ana.ferreira@exemplo.com','$scrypt$n=16384,r=8,p=1$rGsRtch6R/nizktwSogBJg$bL1CigCG2XfdZUpyjrDjiuRsjY9mcAGibbUEDps/EdcacfLe7F0S/gkoh+pDTsjP1tVhftKYimCqljI9I3jXmQ','2026-08-19 19:12:36','2026-08-19 19:15:16','CLIENTE',NULL,0,NULL,NULL,0);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vendas`
--

DROP TABLE IF EXISTS `vendas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendas` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `cliente_id` int unsigned DEFAULT NULL,
  `valor` decimal(12,2) DEFAULT NULL,
  `status` varchar(255) DEFAULT 'PENDENTE',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `cliente_nome` varchar(255) DEFAULT NULL,
  `cliente_email` varchar(255) DEFAULT NULL,
  `forma_pagamento` varchar(255) DEFAULT 'MULTICAIXA',
  `itens_json` text,
  `desconto` decimal(12,2) DEFAULT '0.00',
  `imposto_iva` decimal(12,2) DEFAULT '14.00',
  `notas` text,
  `vendedor` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendas`
--

LOCK TABLES `vendas` WRITE;
/*!40000 ALTER TABLE `vendas` DISABLE KEYS */;
INSERT INTO `vendas` VALUES (1,NULL,570000.00,'PAGO','2026-08-15 02:40:16','2026-08-15 02:40:16','Consumidor Final',NULL,'MULTICAIXA','[{\"descricao\":\"Licença Gloxis Enterprise ERP (Anual)\",\"qtd\":1,\"precoUnit\":450000},{\"descricao\":\"Suporte Técnico & Consultoria\",\"qtd\":2,\"precoUnit\":25000}]',0.00,14.00,NULL,'Operador de Vendas Gloxis ERP'),(2,NULL,0.00,'PENDENTE','2026-08-15 02:40:46','2026-08-15 20:50:06','Consumidor Final',NULL,'MULTICAIXA','[{\"descricao\":\"Licença Gloxis Enterprise ERP (Anual)\",\"qtd\":1,\"precoUnit\":450000},{\"descricao\":\"Suporte Técnico & Consultoria\",\"qtd\":2,\"precoUnit\":25000}]',50000.00,14.00,NULL,'Operador de Vendas Gloxis ERP');
/*!40000 ALTER TABLE `vendas` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-19 20:41:53
