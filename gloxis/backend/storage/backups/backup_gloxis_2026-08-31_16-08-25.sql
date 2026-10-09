-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: 127.0.0.1    Database: gloxis
-- ------------------------------------------------------
-- Server version	8.0.46

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
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adonis_schema`
--

LOCK TABLES `adonis_schema` WRITE;
/*!40000 ALTER TABLE `adonis_schema` DISABLE KEYS */;
INSERT INTO `adonis_schema` VALUES (1,'database/migrations/1761885935168_create_users_table',1,'2026-08-14 23:24:55'),(2,'database/migrations/1768620764696_create_access_tokens_table',1,'2026-08-14 23:24:55'),(3,'database/migrations/1786730000000_add_role_to_users',1,'2026-08-14 23:24:55'),(4,'database/migrations/1786739898348_create_audit_logs_table',1,'2026-08-14 23:24:55'),(5,'database/migrations/1786750000000_advanced_security',1,'2026-08-14 23:24:55'),(6,'database/migrations/1786750000001_campanhas',1,'2026-08-14 23:24:55'),(7,'app/Modules/Clientes/Database/Migrations/1786740000010_create_clientes_table',1,'2026-08-14 23:24:55'),(8,'app/Modules/Clientes/Database/Migrations/1786740566292_add_classificacao_to_clientes',1,'2026-08-14 23:24:55'),(9,'app/Modules/Clientes/Database/Migrations/1786742771398_create_lista_negras_table',1,'2026-08-14 23:24:55'),(10,'app/Modules/Clientes/Database/Migrations/1786742816349_create_classificacao_clientes_table',1,'2026-08-14 23:24:55'),(11,'app/Modules/ProdutoFinanceiro/Database/Migrations/1786740000020_create_produto_creditos_table',1,'2026-08-14 23:24:55'),(12,'app/Modules/SolicitacaoCredito/Database/Migrations/1786740000030_create_solicitacao_creditos_table',1,'2026-08-14 23:24:55'),(13,'app/Modules/SolicitacaoCredito/Database/Migrations/1786740000040_create_solicitacao_documentos_table',1,'2026-08-14 23:24:55'),(14,'app/Modules/AnaliseAprovacao/Database/Migrations/1786740000050_create_analises_aprovacao_table',1,'2026-08-14 23:24:55'),(15,'app/Modules/Garantia/Database/Migrations/1786740451220_create_garantias_table',1,'2026-08-14 23:24:56'),(16,'app/Modules/OperacaoFinanceira/Database/Migrations/1786738407022_create_desembolsos_table',1,'2026-08-14 23:24:56'),(17,'app/Modules/OperacaoFinanceira/Database/Migrations/1786738417805_create_pagamentos_table',1,'2026-08-14 23:24:56'),(18,'app/Modules/OperacaoFinanceira/Database/Migrations/1786741569830_add_valor_parcela_to_pagamentos',1,'2026-08-14 23:24:56'),(19,'app/Modules/Renegociacao/Database/Migrations/1786740159262_create_renegociacoes_table',1,'2026-08-14 23:24:56'),(20,'database/migrations/1786751380725_erp_modules',2,'2026-08-14 23:49:47'),(21,'app/Modules/Clientes/Database/Migrations/1786760000000_add_contacts_to_clientes',3,'2026-08-15 00:36:40'),(22,'database/migrations/1786770000000_add_user_id_to_clientes',4,'2026-08-15 00:51:49'),(23,'database/migrations/1786770000001_add_must_change_password',4,'2026-08-15 00:51:49'),(24,'database/migrations/1786780000000_add_images_to_clientes',5,'2026-08-15 00:54:08'),(25,'database/migrations/1786790000000_configuracoes',6,'2026-08-15 01:17:25'),(26,'database/migrations/1786800000000_gestao_documental_inbox',7,'2026-08-15 01:31:46'),(27,'database/migrations/1786785000000_add_details_to_vendas',8,'2026-08-15 02:34:04'),(28,'database/migrations/1786786000000_add_details_to_compras',9,'2026-08-15 19:55:30'),(29,'database/migrations/1786787000000_add_details_to_stock',10,'2026-08-15 19:58:43'),(30,'database/migrations/1786788000000_add_details_to_faturas',11,'2026-08-15 20:05:41'),(31,'database/migrations/1786789000000_add_details_to_pagamentos',12,'2026-08-15 20:08:08'),(32,'database/migrations/1786790000000_add_details_to_contabilidade',13,'2026-08-15 20:10:10'),(33,'database/migrations/1786791000000_add_details_to_rh',14,'2026-08-15 20:12:08'),(34,'database/migrations/1786792000000_add_details_to_contratos',15,'2026-08-15 20:14:03'),(35,'database/migrations/1786793000000_add_details_to_projetos',16,'2026-08-15 20:16:04'),(36,'database/migrations/1786794000000_add_details_to_ativos',17,'2026-08-15 20:18:06'),(37,'app/Modules/SolicitacaoCredito/Database/Migrations/1786840000000_add_desembolso_fields_to_solicitacoes',18,'2026-08-20 09:51:34'),(38,'app/Modules/OperacaoFinanceira/Database/Migrations/1786840000001_add_comprovativo_to_pagamentos',18,'2026-08-20 09:51:34'),(39,'app/Modules/SolicitacaoCredito/Database/Migrations/1787223124915_alter_solicitacoes_table',19,'2026-08-20 10:52:25'),(40,'database/migrations/1786810000000_transparencia',20,'2026-08-31 14:14:38');
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
) ENGINE=InnoDB AUTO_INCREMENT=848 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `audit_logs`
--

LOCK TABLES `audit_logs` WRITE;
/*!40000 ALTER TABLE `audit_logs` DISABLE KEYS */;
INSERT INTO `audit_logs` VALUES (1,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-14 23:25:45'),(2,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-14 23:25:46'),(3,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-14 23:27:14'),(4,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-14 23:28:25'),(5,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-14 23:28:26'),(6,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-14 23:33:59'),(7,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-14 23:34:01'),(8,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-14 23:34:02'),(9,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-14 23:34:05'),(10,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-14 23:34:26'),(11,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-14 23:35:14'),(12,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-14 23:36:03'),(13,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-15 00:06:03'),(14,NULL,'POST /api/v1/vendas','127.0.0.1','{\"valor\": 266711, \"status\": \"PENDENTE\", \"cliente_id\": 1}','2026-08-15 00:06:09'),(15,NULL,'POST /api/v1/compras','127.0.0.1','{\"valor\": 85924, \"status\": \"PAGO\", \"fornecedor_id\": 107}','2026-08-15 00:06:12'),(16,NULL,'POST /api/v1/stock','127.0.0.1','{\"produto_id\": 146, \"quantidade\": 396}','2026-08-15 00:06:16'),(17,NULL,'POST /api/v1/faturacao','127.0.0.1','{\"valor\": 111963, \"status\": \"PAGA\", \"cliente_id\": 84}','2026-08-15 00:06:19'),(18,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-15 00:21:45'),(19,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-15 00:37:31'),(20,NULL,'POST /api/v1/clientes','127.0.0.1','{\"nif\": \"54324\", \"nome\": \"Noé Magalhães\", \"email\": \"noe.francisco@gmail.com\", \"endereco\": \"Angola, Luanda\", \"telefone\": \"434343\", \"contaBancaria\": \"2343234\"}','2026-08-15 00:38:02'),(21,NULL,'POST /api/v1/clientes','127.0.0.1','{\"nif\": \"33444\", \"nome\": \"Noé Magalhães\", \"email\": \"ola@gmail.com\", \"endereco\": \"Angola, Luanda\", \"telefone\": \"443\", \"contaBancaria\": \"434343\"}','2026-08-15 00:42:03'),(22,NULL,'POST /api/v1/clientes','127.0.0.1','{\"nif\": \"12345\", \"nome\": \"Teste\", \"email\": \"teste@teste.com\"}','2026-08-15 00:43:57'),(23,NULL,'POST /api/v1/clientes','127.0.0.1','{\"nif\": \"12345\", \"nome\": \"Teste\", \"email\": \"teste@teste.com\"}','2026-08-15 00:46:02'),(24,NULL,'POST /api/v1/clientes','127.0.0.1','{\"nif\": \"NIF888\", \"nome\": \"Teste\", \"email\": \"teste@teste.com\", \"endereco\": \"Rua A\", \"telefone\": \"123\", \"contaBancaria\": \"IBAN123\"}','2026-08-15 00:46:21'),(25,NULL,'POST /api/v1/clientes','127.0.0.1','{\"nif\": \"34343\", \"nome\": \"Noé Magalhães\", \"email\": \"ola@gmail.com\", \"endereco\": \"Angola, Luanda\", \"telefone\": \"3443\", \"contaBancaria\": \"23232\"}','2026-08-15 00:48:23'),(26,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-15 00:58:05'),(27,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-15 00:58:10'),(28,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-15 00:59:28'),(29,NULL,'POST /api/v1/clientes','127.0.0.1','{\"nif\": \"243424\", \"nome\": \"Noé Magalhães\", \"email\": \"noe.francisco@gmail.com\", \"endereco\": \"Angola, Luanda\", \"logotipo\": {\"meta\": {}, \"size\": 105262, \"type\": \"image\", \"state\": \"moved\", \"errors\": [], \"extname\": \"png\", \"isValid\": true, \"subtype\": \"png\", \"fileName\": \"aa08ab39-f2fe-4a10-98e0-e3545b268cb5.png\", \"filePath\": \"public/uploads/clientes/logotipos/aa08ab39-f2fe-4a10-98e0-e3545b268cb5.png\", \"fieldName\": \"logotipo\", \"validated\": true, \"clientName\": \"Captura de ecrã de 2026-08-14 10-54-37.png\"}, \"telefone\": \"22323\", \"fotografia\": {\"meta\": {}, \"size\": 17569, \"type\": \"image\", \"state\": \"moved\", \"errors\": [], \"extname\": \"png\", \"isValid\": true, \"subtype\": \"png\", \"fileName\": \"768110c4-5b61-4632-b523-e9e9d5769f40.png\", \"filePath\": \"public/uploads/clientes/fotografias/768110c4-5b61-4632-b523-e9e9d5769f40.png\", \"fieldName\": \"fotografia\", \"validated\": true, \"clientName\": \"Captura de ecrã de 2026-08-14 11-02-12.png\"}, \"contaBancaria\": \"232323\"}','2026-08-15 01:08:00'),(30,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-15 01:15:07'),(31,NULL,'POST /api/v1/administracao/backups','127.0.0.1','{}','2026-08-15 01:23:46'),(32,NULL,'POST /api/v1/administracao/backups/restore','127.0.0.1','{\"filename\": \"gloxis_backup_2026-08-15_01-23-46.sql\"}','2026-08-15 01:23:55'),(33,NULL,'POST /api/v1/administracao/backups','127.0.0.1','{}','2026-08-15 01:25:33'),(34,NULL,'POST /api/v1/administracao/test-smtp','127.0.0.1','{\"host\": \"smtp.mailgun.org\", \"port\": \"587\"}','2026-08-15 01:29:27'),(35,NULL,'DELETE /api/v1/administracao/backups','127.0.0.1','{\"filename\": \"backup_gloxis_2026-08-15_01-25-32.sql\"}','2026-08-15 01:29:41'),(36,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-15 01:34:12'),(37,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-15 01:34:18'),(38,NULL,'POST /api/v1/documentos','127.0.0.1','{\"notas\": null, \"titulo\": \"Vector 51.png\", \"arquivo\": {\"meta\": {}, \"size\": 37861, \"type\": \"image\", \"state\": \"moved\", \"errors\": [], \"extname\": \"png\", \"isValid\": true, \"subtype\": \"png\", \"fileName\": \"1786757676656_Vector_51.png\", \"filePath\": \"/home/mr-nobody/Documentos/_/VA/gloxis/backend/public/uploads/documentos/1786757676656_Vector_51.png\", \"fieldName\": \"arquivo\", \"validated\": true, \"clientName\": \"Vector 51.png\"}, \"categoria\": \"KYC\", \"cliente_nome\": null, \"departamento\": \"GERAL\", \"cliente_email\": null}','2026-08-15 01:34:36'),(39,NULL,'POST /api/v1/documentos/1/tramitar','127.0.0.1','{\"destino\": \"RISCO\", \"usuario\": \"Administrador\", \"despacho\": \"kkjj\", \"status_novo\": \"REJEITADO\"}','2026-08-15 01:34:50'),(40,NULL,'POST /api/v1/inbox','127.0.0.1','{\"assunto\": \"888\", \"conteudo\": \"8888\", \"documento_id\": 1, \"destinatario_nome\": \"887\", \"destinatario_tipo\": \"CLIENTE\"}','2026-08-15 01:35:06'),(41,NULL,'PUT /api/v1/inbox/1/lida','127.0.0.1','{}','2026-08-15 01:35:12'),(42,NULL,'POST /api/v1/inbox','127.0.0.1','{\"assunto\": \"Resposta Direta para 887\", \"conteudo\": \"Documento anexado à conversa.\", \"documento_id\": 1, \"remetente_nome\": \"Administrador\", \"remetente_tipo\": \"ADMIN\", \"destinatario_nome\": \"887\", \"destinatario_tipo\": \"CLIENTE\"}','2026-08-15 01:39:05'),(43,NULL,'POST /api/v1/inbox','127.0.0.1','{\"assunto\": \"Resposta Direta para 887\", \"conteudo\": \"oaksk\", \"documento_id\": null, \"remetente_nome\": \"Administrador\", \"remetente_tipo\": \"ADMIN\", \"destinatario_nome\": \"887\", \"destinatario_tipo\": \"CLIENTE\"}','2026-08-15 01:42:01'),(44,NULL,'POST /api/v1/inbox','127.0.0.1','{\"assunto\": \"Resposta Direta para 887\", \"conteudo\": \"sols\", \"documento_id\": null, \"remetente_nome\": \"Administrador\", \"remetente_tipo\": \"ADMIN\", \"destinatario_nome\": \"887\", \"destinatario_tipo\": \"CLIENTE\"}','2026-08-15 01:42:03'),(45,NULL,'POST /api/v1/documentos','127.0.0.1','{\"notas\": \"Gerado via Pacote Office Criador de Documentos Gloxis ERP\", \"titulo\": \"Novo Contrato de Crédito\", \"arquivo\": {\"meta\": {}, \"size\": 2085, \"type\": \"text\", \"state\": \"consumed\", \"errors\": [{\"type\": \"extname\", \"message\": \"Invalid file extension html. Only pdf, png, jpg, jpeg, docx, xlsx, txt, csv are allowed\", \"fieldName\": \"arquivo\", \"clientName\": \"Novo_Contrato_de_Crédito.html\"}], \"extname\": \"html\", \"isValid\": false, \"subtype\": \"html\", \"fieldName\": \"arquivo\", \"validated\": true, \"clientName\": \"Novo_Contrato_de_Crédito.html\"}, \"categoria\": \"CONTRATO\", \"cliente_nome\": null, \"departamento\": \"FINANCEIRO\", \"cliente_email\": null}','2026-08-15 01:44:16'),(46,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-15 01:52:24'),(47,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-15 01:52:34'),(48,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-15 02:16:00'),(49,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-15 02:28:21'),(50,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-15 02:31:36'),(51,NULL,'POST /api/v1/vendas','127.0.0.1','{\"itens\": [{\"qtd\": 1, \"descricao\": \"Licença Gloxis Enterprise ERP (Anual)\", \"precoUnit\": 450000}, {\"qtd\": 2, \"descricao\": \"Suporte Técnico & Consultoria\", \"precoUnit\": 25000}], \"notas\": null, \"valor\": 570000, \"status\": \"PAGO\", \"desconto\": 0, \"vendedor\": \"Operador de Vendas Gloxis ERP\", \"cliente_id\": null, \"imposto_iva\": 14, \"cliente_nome\": \"Consumidor Final\", \"cliente_email\": null, \"forma_pagamento\": \"MULTICAIXA\"}','2026-08-15 02:40:16'),(52,NULL,'POST /api/v1/vendas','127.0.0.1','{\"itens\": [{\"qtd\": 1, \"descricao\": \"Licença Gloxis Enterprise ERP (Anual)\", \"precoUnit\": 450000}, {\"qtd\": 2, \"descricao\": \"Suporte Técnico & Consultoria\", \"precoUnit\": 25000}], \"notas\": null, \"valor\": 570000, \"status\": \"PENDENTE\", \"desconto\": 0, \"vendedor\": \"Operador de Vendas Gloxis ERP\", \"cliente_id\": null, \"imposto_iva\": 14, \"cliente_nome\": \"Consumidor Final\", \"cliente_email\": null, \"forma_pagamento\": \"MULTICAIXA\"}','2026-08-15 02:40:46'),(53,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-15 19:50:13'),(54,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-15 19:54:28'),(55,NULL,'POST /api/v1/compras','127.0.0.1','{\"itens\": [{\"qtd\": 1, \"descricao\": \"Servidores Dell PowerEdge R750\", \"precoUnit\": 1250000}, {\"qtd\": 1, \"descricao\": \"Manutenção de Infraestrutura\", \"precoUnit\": 150000}], \"notas\": null, \"valor\": 1400000, \"status\": \"PENDENTE\", \"categoria\": \"LICENCAS\", \"comprador\": \"Diretor de Operações Gloxis\", \"fornecedor_nif\": \"ssd\", \"forma_pagamento\": \"CHEQUE\", \"fornecedor_nome\": \"DD\"}','2026-08-15 20:04:26'),(56,NULL,'POST /api/v1/stock','127.0.0.1','{\"nome\": \"333\", \"categoria\": \"ESCRITORIO\", \"codigo_sku\": \"333\", \"quantidade\": 50, \"localizacao\": \"Armazém Central - Luanda\", \"minimo_alerta\": 10, \"preco_unitario\": 25000}','2026-08-15 20:04:46'),(57,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-15 20:07:39'),(58,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-15 20:23:36'),(59,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-15 20:46:55'),(60,NULL,'PUT /api/v1/stock/1','127.0.0.1','{\"quantidade\": 10}','2026-08-15 20:47:39'),(61,NULL,'PUT /api/v1/stock/1','127.0.0.1','{\"localizacao\": \"Armazém Filial - Benguela\"}','2026-08-15 20:48:19'),(62,NULL,'PUT /api/v1/vendas/2','127.0.0.1','{\"valor\": 0, \"desconto\": 50000}','2026-08-15 20:50:07'),(63,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-15 21:20:05'),(64,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": 2500000, \"parcelas\": 12, \"clienteId\": 10, \"finalidade\": \"Financiamento de Equipamento / Capital de Giro\"}','2026-08-15 21:20:17'),(65,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": 2500000, \"parcelas\": 12, \"clienteId\": 10, \"finalidade\": \"Financiamento de Equipamento / Capital de Giro\"}','2026-08-15 21:20:21'),(66,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-15 21:38:07'),(67,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": 5000000, \"parcelas\": 12, \"clienteId\": 1, \"finalidade\": \"Expansão de Capital de Giro\"}','2026-08-15 21:39:41'),(68,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": 2500000, \"parcelas\": 12, \"clienteId\": 10, \"finalidade\": \"Financiamento de Equipamento / Capital de Giro\"}','2026-08-15 21:40:55'),(69,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-15 21:53:10'),(70,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-15 22:10:29'),(71,NULL,'POST /api/v1/administracao/users','127.0.0.1','{\"role\": \"ANALISTA_CREDITO\", \"email\": \"ana@gloxis.com\", \"fullName\": \"Ana Operadora\"}','2026-08-15 22:16:44'),(72,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-15 22:27:10'),(73,NULL,'POST /api/v1/lista-negra','127.0.0.1','{\"motivo\": \"[INADIMPLENCIA_PROLONGADA]\", \"clienteId\": 1}','2026-08-15 22:36:42'),(74,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-15 22:40:20'),(75,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-15 23:27:53'),(76,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"cliente@exemplo.com\"}','2026-08-19 19:01:54'),(77,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"cliente@exemplo.com\"}','2026-08-19 19:02:01'),(78,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"cliente@exemplo.com\"}','2026-08-19 19:04:05'),(79,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"cliente@exemplo.com\"}','2026-08-19 19:04:14'),(80,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"cliente@exemplo.com\"}','2026-08-19 19:04:15'),(81,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"cliente@exemplo.com\"}','2026-08-19 19:04:29'),(82,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-19 19:05:23'),(83,NULL,'PUT /api/v1/clientes/10','127.0.0.1','{\"nif\": \"243424\", \"nome\": \"Noé Magalhães\", \"email\": \"noe.francisco@gmail.com\", \"endereco\": \"Angola, Luanda\", \"telefone\": \"22323\", \"fotografia\": {\"meta\": {}, \"size\": 68731, \"type\": \"image\", \"state\": \"moved\", \"errors\": [], \"extname\": \"png\", \"isValid\": true, \"subtype\": \"png\", \"fileName\": \"9844940d-f379-4c47-90a1-e85390bd373c.png\", \"filePath\": \"public/uploads/clientes/fotografias/9844940d-f379-4c47-90a1-e85390bd373c.png\", \"fieldName\": \"fotografia\", \"validated\": true, \"clientName\": \"Captura de ecrã de 2026-08-19 11-47-20.png\"}, \"contaBancaria\": \"232323\"}','2026-08-19 19:06:38'),(84,NULL,'POST /api/v1/projetos','127.0.0.1','{\"nome\": \"Noah Magalhases\", \"status\": \"EM_ANDAMENTO\", \"orcamento\": 3500000, \"data_inicio\": \"2026-08-19\", \"cliente_nome\": \"Cliente Interno / Corporativo\", \"gerente_projeto\": \"Eng. Manuel San2323tos\", \"data_prevista_fim\": \"2027-02-15\", \"progresso_percentual\": 15}','2026-08-19 19:07:33'),(85,NULL,'PUT /api/v1/projetos/1','127.0.0.1','{\"status\": \"CONCLUIDO\", \"progresso_percentual\": 0}','2026-08-19 19:07:40'),(86,NULL,'PUT /api/v1/projetos/1','127.0.0.1','{\"status\": \"CONCLUIDO\", \"progresso_percentual\": 0}','2026-08-19 19:07:48'),(87,NULL,'POST /api/v1/lista-negra','127.0.0.1','{\"motivo\": \"[INADIMPLENCIA_PROLONGADA] vamos testa\", \"clienteId\": 1}','2026-08-19 19:08:25'),(88,NULL,'POST /api/v1/faturacao','127.0.0.1','{\"clienteId\": 1, \"descricao\": \"Prestação de Serviços de Consultoria de Crédito\", \"valorTotal\": 500000}','2026-08-19 19:08:44'),(89,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"cliente@exemplo.com\"}','2026-08-19 19:09:35'),(90,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"ana.ferreira@exemplo.com\"}','2026-08-19 19:13:52'),(91,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"ana.ferreira@exemplo.com\"}','2026-08-19 19:13:56'),(92,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"maria.silva@exemplo.com\"}','2026-08-19 19:15:33'),(93,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"ana.ferreira@exemplo.com\"}','2026-08-19 19:16:20'),(94,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"ana.ferreira@exemplo.com\"}','2026-08-19 19:16:26'),(95,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"ana.ferreira@exemplo.com\"}','2026-08-19 19:17:52'),(96,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 1.2323454334543224e23, \"parcelas\": 232, \"produtoId\": 4}','2026-08-19 19:18:07'),(97,NULL,'POST /api/v1/inbox','127.0.0.1','{\"assunto\": \"[Consultoria] Agendamento de Chamada (VIDEO)\", \"conteudo\": \"O cliente solicitou uma consultoria financeira.\\n\\nDetalhes:\\nData: 2026-09-02\\nHora: 10:00\\nTipo: Videochamada\", \"documento_id\": null, \"remetente_nome\": \"Ana Ferreira\", \"remetente_tipo\": \"CLIENTE\", \"destinatario_nome\": \"Administração\", \"destinatario_tipo\": \"ADMIN\"}','2026-08-19 19:18:29'),(98,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 5000, \"parcelas\": 12, \"produtoId\": 3}','2026-08-19 19:28:57'),(99,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 5000, \"parcelas\": 2, \"produtoId\": 3}','2026-08-19 19:29:05'),(100,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 50000, \"parcelas\": 2, \"produtoId\": 3}','2026-08-19 19:29:08'),(101,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 50001, \"parcelas\": 4, \"produtoId\": 9}','2026-08-19 19:29:38'),(102,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": 50001, \"parcelas\": 4, \"clienteId\": 12, \"produtoId\": 9}','2026-08-19 19:30:05'),(103,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"ana.ferreira@exemplo.com\"}','2026-08-19 19:36:08'),(104,NULL,'POST /api/v1/simulador','127.0.0.1','{\"produtoId\": 1, \"numeroParcelas\": 3, \"valorSolicitado\": 100000}','2026-08-19 19:42:59'),(105,NULL,'POST /api/v1/documentos','127.0.0.1','{\"notas\": null, \"status\": \"PENDENTE\", \"titulo\": \"BI_ANC\", \"arquivo\": {\"meta\": {}, \"size\": 166548, \"type\": \"application\", \"state\": \"moved\", \"errors\": [], \"extname\": \"pdf\", \"isValid\": true, \"subtype\": \"pdf\", \"fileName\": \"1787168606822_BI_ANC.pdf\", \"filePath\": \"/home/mr-nobody/Documentos/_/VA/gloxis/backend/public/uploads/documentos/1787168606822_BI_ANC.pdf\", \"fieldName\": \"arquivo\", \"validated\": true, \"clientName\": \"BI_ANC.pdf\"}, \"categoria\": \"CONTRATO\", \"cliente_nome\": \"Ana Ferreira\", \"departamento\": \"ARQUIVO_CLIENTE\", \"cliente_email\": \"ana.ferreira@exemplo.com\"}','2026-08-19 19:43:26'),(106,NULL,'POST /api/v1/documentos','127.0.0.1','{\"notas\": null, \"status\": \"PENDENTE\", \"titulo\": \"Laur_\", \"arquivo\": {\"meta\": {}, \"size\": 342052, \"type\": \"application\", \"state\": \"moved\", \"errors\": [], \"extname\": \"pdf\", \"isValid\": true, \"subtype\": \"pdf\", \"fileName\": \"1787168630788_Laur_.pdf\", \"filePath\": \"/home/mr-nobody/Documentos/_/VA/gloxis/backend/public/uploads/documentos/1787168630788_Laur_.pdf\", \"fieldName\": \"arquivo\", \"validated\": true, \"clientName\": \"Laur_.pdf\"}, \"categoria\": \"COMPROVATIVO\", \"cliente_nome\": \"Ana Ferreira\", \"departamento\": \"ARQUIVO_CLIENTE\", \"cliente_email\": \"ana.ferreira@exemplo.com\"}','2026-08-19 19:43:50'),(107,NULL,'POST /api/v1/inbox','127.0.0.1','{\"arquivo\": {\"meta\": {}, \"size\": 342052, \"type\": \"application\", \"state\": \"consumed\", \"errors\": [], \"extname\": \"pdf\", \"isValid\": true, \"subtype\": \"pdf\", \"fieldName\": \"arquivo\", \"validated\": false, \"clientName\": \"Laur_.pdf\"}, \"assunto\": \"s22\", \"conteudo\": \"323\", \"remetenteNome\": \"Ana Ferreira\", \"remetenteTipo\": \"CLIENTE\", \"destinatarioNome\": \"Administração Gloxis\", \"destinatarioTipo\": \"ADMIN\"}','2026-08-19 19:44:05'),(108,NULL,'POST /api/v1/inbox','127.0.0.1','{\"assunto\": \"s22\", \"conteudo\": \"323\", \"remetenteNome\": \"Ana Ferreira\", \"remetenteTipo\": \"CLIENTE\", \"destinatarioNome\": \"Administração Gloxis\", \"destinatarioTipo\": \"ADMIN\"}','2026-08-19 19:44:09'),(109,NULL,'POST /api/v1/inbox','127.0.0.1','{\"assunto\": \"s22\", \"conteudo\": \"323\", \"remetenteNome\": \"Ana Ferreira\", \"remetenteTipo\": \"CLIENTE\", \"destinatarioNome\": \"Administração Gloxis\", \"destinatarioTipo\": \"ADMIN\"}','2026-08-19 19:44:10'),(110,NULL,'POST /api/v1/inbox','127.0.0.1','{\"assunto\": \"s22\", \"conteudo\": \"3233232\", \"remetenteNome\": \"Ana Ferreira\", \"remetenteTipo\": \"CLIENTE\", \"destinatarioNome\": \"Administração Gloxis\", \"destinatarioTipo\": \"ADMIN\"}','2026-08-19 19:44:12'),(111,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 1000, \"parcelas\": 53, \"produtoId\": 1}','2026-08-19 19:46:49'),(112,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 1000, \"parcelas\": 5, \"produtoId\": 1}','2026-08-19 19:46:53'),(113,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 210000, \"parcelas\": 5, \"produtoId\": 1}','2026-08-19 19:47:02'),(114,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": 210000, \"parcelas\": 5, \"clienteId\": 12, \"produtoId\": 1}','2026-08-19 19:47:13'),(115,NULL,'POST /api/v1/inbox','127.0.0.1','{\"assunto\": \"Anexo de Arquivo - Solicitação #12\", \"conteudo\": \"O cliente vinculou o documento do seu arquivo (ID: 2) à solicitação de crédito #12.\", \"remetenteNome\": \"Ana Ferreira\", \"remetenteTipo\": \"CLIENTE\", \"destinatarioNome\": \"Departamento de Crédito\", \"destinatarioTipo\": \"ADMIN\"}','2026-08-19 19:47:13'),(116,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-19 19:51:51'),(117,NULL,'PATCH /api/v1/solicitacoes/12/status','127.0.0.1','{\"status\": \"APROVADO\"}','2026-08-19 19:52:18'),(118,NULL,'PATCH /api/v1/solicitacoes/12/status','127.0.0.1','{\"status\": \"APROVADO\"}','2026-08-19 19:52:23'),(119,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"ana.ferreira@exemplo.com\"}','2026-08-19 20:01:50'),(120,NULL,'POST /api/v1/simulador','127.0.0.1','{\"produtoId\": 1, \"numeroParcelas\": 3, \"valorSolicitado\": 100000}','2026-08-19 20:01:54'),(121,NULL,'POST /api/v1/inbox','127.0.0.1','{\"assunto\": \"33\", \"conteudo\": \"3434\", \"remetenteNome\": \"Ana Ferreira\", \"remetenteTipo\": \"CLIENTE\", \"destinatarioNome\": \"Administração Gloxis\", \"destinatarioTipo\": \"ADMIN\"}','2026-08-19 20:03:20'),(122,NULL,'POST /api/v1/inbox','127.0.0.1','{\"assunto\": \"naasjsj\", \"conteudo\": \"3434\", \"remetenteNome\": \"Ana Ferreira\", \"remetenteTipo\": \"CLIENTE\", \"destinatarioNome\": \"Administração Gloxis\", \"destinatarioTipo\": \"ADMIN\"}','2026-08-19 20:03:27'),(123,NULL,'POST /api/v1/inbox','127.0.0.1','{\"assunto\": \"[CONSULTORIA] Renegociação de Contrato\", \"conteudo\": \"Tipo: VIDEOCHAMADA\\nAssunto: Renegociação de Contrato\\nData Preferida: 2026-09-05 15:48\\n\\nDescrição:\\nj\", \"remetenteNome\": \"Ana Ferreira\", \"remetenteTipo\": \"CLIENTE\", \"destinatarioNome\": \"Administração Gloxis\", \"destinatarioTipo\": \"ADMIN\"}','2026-08-19 20:04:27'),(124,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 500000, \"parcelas\": 12, \"produtoId\": 1}','2026-08-19 20:04:30'),(125,NULL,'PUT /api/v1/clientes/me','127.0.0.1','{\"endereco\": \"Rua da Paz, 12\", \"telefone\": \"923000003\", \"contaBancaria\": \"Banco: Banco Z | Agência: 0033 | Conta: 11223-5\"}','2026-08-19 20:04:33'),(126,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-19 20:07:15'),(127,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 100000, \"parcelas\": 3, \"produtoId\": 1}','2026-08-19 20:08:37'),(128,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 100000, \"parcelas\": 6, \"produtoId\": 1}','2026-08-19 20:08:50'),(129,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 100000, \"parcelas\": 6, \"produtoId\": 1}','2026-08-19 20:08:53'),(130,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 100000, \"parcelas\": 1, \"produtoId\": 1}','2026-08-19 20:08:56'),(131,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 100000, \"parcelas\": 1, \"produtoId\": 1}','2026-08-19 20:09:00'),(132,NULL,'PATCH /api/v1/solicitacoes/12/status','127.0.0.1','{\"status\": \"APROVADO\"}','2026-08-19 20:09:34'),(133,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 4000000, \"parcelas\": 4, \"produtoId\": 2}','2026-08-19 20:10:10'),(134,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 40000, \"parcelas\": 4, \"produtoId\": 2}','2026-08-19 20:10:17'),(135,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 400000, \"parcelas\": 4, \"produtoId\": 2}','2026-08-19 20:10:27'),(136,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 400000, \"parcelas\": 7, \"produtoId\": 2}','2026-08-19 20:10:50'),(137,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": 400000, \"parcelas\": 7, \"clienteId\": 12, \"produtoId\": 2}','2026-08-19 20:10:56'),(138,NULL,'POST /api/v1/inbox','127.0.0.1','{\"assunto\": \"Anexo de Arquivo - Solicitação #13\", \"conteudo\": \"O cliente vinculou o documento do seu arquivo (ID: 3) à solicitação de crédito #13.\", \"remetenteNome\": \"Ana Ferreira\", \"remetenteTipo\": \"CLIENTE\", \"destinatarioNome\": \"Departamento de Crédito\", \"destinatarioTipo\": \"ADMIN\"}','2026-08-19 20:10:56'),(139,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": 400000, \"parcelas\": 7, \"clienteId\": 12, \"produtoId\": 2}','2026-08-19 20:14:24'),(140,NULL,'POST /api/v1/inbox','127.0.0.1','{\"assunto\": \"Anexo de Arquivo - Solicitação #14\", \"conteudo\": \"O cliente vinculou o documento do seu arquivo (ID: 3) à solicitação de crédito #14.\", \"remetente_nome\": \"Ana Ferreira\", \"remetente_tipo\": \"CLIENTE\", \"destinatario_nome\": \"Departamento de Crédito\", \"destinatario_tipo\": \"ADMIN\"}','2026-08-19 20:14:24'),(141,NULL,'PATCH /api/v1/solicitacoes/14/status','127.0.0.1','{\"status\": \"APROVADO\"}','2026-08-19 20:14:40'),(142,NULL,'PATCH /api/v1/solicitacoes/9/status','127.0.0.1','{\"status\": \"REPROVADO\"}','2026-08-19 20:17:52'),(143,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": 3000000, \"parcelas\": 6, \"clienteId\": 12, \"finalidade\": \"Expansão Comercial / Equipamento\"}','2026-08-19 20:21:35'),(144,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-19 20:23:37'),(145,NULL,'PATCH /api/v1/solicitacoes/13/status','127.0.0.1','{\"status\": \"REPROVADO\"}','2026-08-19 20:23:46'),(146,NULL,'PATCH /api/v1/solicitacoes/13/status','127.0.0.1','{\"status\": \"REJEITADO\"}','2026-08-19 20:25:06'),(147,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"ana.ferreira@exemplo.com\"}','2026-08-19 20:25:31'),(148,NULL,'POST /api/v1/solicitacoes/12/documentos','127.0.0.1','{\"documento\": {\"meta\": {}, \"size\": 166548, \"type\": \"application\", \"state\": \"consumed\", \"errors\": [], \"extname\": \"pdf\", \"isValid\": true, \"subtype\": \"pdf\", \"fieldName\": \"documento\", \"validated\": false, \"clientName\": \"BI_ANC.pdf\"}, \"tipoDocumento\": \"COMPROVATIVO\"}','2026-08-19 20:25:50'),(149,NULL,'POST /api/v1/inbox','127.0.0.1','{\"assunto\": \"223\", \"conteudo\": \"323\", \"remetenteNome\": \"Ana Ferreira\", \"remetenteTipo\": \"CLIENTE\", \"destinatarioNome\": \"Administração Gloxis\", \"destinatarioTipo\": \"ADMIN\"}','2026-08-19 20:28:46'),(150,NULL,'POST /api/v1/inbox','127.0.0.1','{\"assunto\": \"vamos\", \"conteudo\": \"22\", \"remetente_nome\": \"Ana Ferreira\", \"remetente_tipo\": \"CLIENTE\", \"destinatario_nome\": \"Administração Gloxis\", \"destinatario_tipo\": \"ADMIN\"}','2026-08-19 20:40:06'),(151,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-19 20:40:24'),(152,NULL,'POST /api/v1/administracao/backups','127.0.0.1','{}','2026-08-19 20:41:53'),(153,NULL,'POST /api/v1/administracao/backups/restore','127.0.0.1','{\"filename\": \"backup_gloxis_2026-08-19_20-41-52.sql\"}','2026-08-19 20:42:08'),(154,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"ana.ferreira@exemplo.com\"}','2026-08-19 20:54:08'),(155,NULL,'PUT /api/v1/inbox/6/lida','127.0.0.1','{}','2026-08-19 21:04:49'),(156,NULL,'PUT /api/v1/inbox/5/lida','127.0.0.1','{}','2026-08-19 21:04:51'),(157,NULL,'PUT /api/v1/inbox/7/lida','127.0.0.1','{}','2026-08-19 21:04:59'),(158,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-19 21:05:13'),(159,NULL,'POST /api/v1/inbox','127.0.0.1','{\"assunto\": \"[CONSULTORIA] Esclarecimento de Dívida\", \"conteudo\": \"Tipo: PRESENCIAL\\nAssunto: Esclarecimento de Dívida\\nData Preferida: 2026-08-21 10:05\\n\\nDescrição:\\njjj\", \"remetente_nome\": \"Ana Ferreira\", \"remetente_tipo\": \"CLIENTE\", \"destinatario_nome\": \"Administração Gloxis\", \"destinatario_tipo\": \"ADMIN\"}','2026-08-19 21:06:07'),(160,NULL,'PUT /api/v1/inbox/8/lida','127.0.0.1','{}','2026-08-19 21:06:21'),(161,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 10000000, \"parcelas\": 59, \"produtoId\": 2}','2026-08-19 21:10:07'),(162,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 100000, \"parcelas\": 59, \"produtoId\": 2}','2026-08-19 21:10:13'),(163,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-20 09:26:19'),(164,NULL,'POST /api/v1/operacoes/desembolsos','127.0.0.1','{\"solicitacaoId\": 12}','2026-08-20 09:26:40'),(165,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.ao\"}','2026-08-20 09:32:44'),(166,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-20 09:33:04'),(167,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-20 09:33:15'),(168,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-20 09:33:25'),(169,NULL,'PATCH /api/v1/solicitacoes/11/status','127.0.0.1','{\"status\": \"APROVADO\"}','2026-08-20 10:21:58'),(170,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-20 10:22:00'),(171,NULL,'PATCH /api/v1/solicitacoes/9/status','127.0.0.1','{\"status\": \"APROVADO\"}','2026-08-20 10:22:04'),(172,NULL,'PATCH /api/v1/solicitacoes/11/status','127.0.0.1','{\"status\": \"APROVADO\"}','2026-08-20 10:27:51'),(173,NULL,'PATCH /api/v1/solicitacoes/7/status','127.0.0.1','{\"status\": \"APROVADO\"}','2026-08-20 10:32:17'),(174,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"ana.ferreira@exemplo.com\"}','2026-08-20 10:33:21'),(175,NULL,'POST /api/v1/operacoes/desembolsos','127.0.0.1','{\"metodo\": \"DINHEIRO\", \"comprovativo\": {\"meta\": {}, \"size\": 129446, \"type\": \"application\", \"state\": \"moved\", \"errors\": [], \"extname\": \"pdf\", \"isValid\": true, \"subtype\": \"pdf\", \"fileName\": \"3d222516-3918-4a29-b9fe-d5ac09ba753d.pdf\", \"filePath\": \"public/uploads/comprovativos/3d222516-3918-4a29-b9fe-d5ac09ba753d.pdf\", \"fieldName\": \"comprovativo\", \"validated\": true, \"clientName\": \"diagramas_arquitectura.pdf\"}, \"solicitacaoId\": \"12\"}','2026-08-20 10:34:50'),(176,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-20 10:58:40'),(177,NULL,'POST /api/v1/operacoes/desembolsos','127.0.0.1','{\"metodo\": \"TRANSFERENCIA\", \"comprovativo\": {\"meta\": {}, \"size\": 129446, \"type\": \"application\", \"state\": \"moved\", \"errors\": [], \"extname\": \"pdf\", \"isValid\": true, \"subtype\": \"pdf\", \"fileName\": \"d886a0ed-d04a-4609-a0fb-7eae1cb66c17.pdf\", \"filePath\": \"public/uploads/comprovativos/d886a0ed-d04a-4609-a0fb-7eae1cb66c17.pdf\", \"fieldName\": \"comprovativo\", \"validated\": true, \"clientName\": \"diagramas_arquitectura.pdf\"}, \"solicitacaoId\": \"12\"}','2026-08-20 10:59:12'),(178,NULL,'POST /api/v1/operacoes/desembolsos','127.0.0.1','{\"metodo\": \"TRANSFERENCIA\", \"comprovativo\": {\"meta\": {}, \"size\": 129446, \"type\": \"application\", \"state\": \"moved\", \"errors\": [], \"extname\": \"pdf\", \"isValid\": true, \"subtype\": \"pdf\", \"fileName\": \"a7b4fef4-1d36-417f-94ca-54c5da41e325.pdf\", \"filePath\": \"public/uploads/comprovativos/a7b4fef4-1d36-417f-94ca-54c5da41e325.pdf\", \"fieldName\": \"comprovativo\", \"validated\": true, \"clientName\": \"diagramas_arquitectura.pdf\"}, \"solicitacaoId\": \"12\"}','2026-08-20 10:59:13'),(179,NULL,'POST /api/v1/operacoes/desembolsos','127.0.0.1','{\"metodo\": \"TRANSFERENCIA\", \"comprovativo\": {\"meta\": {}, \"size\": 129446, \"type\": \"application\", \"state\": \"moved\", \"errors\": [], \"extname\": \"pdf\", \"isValid\": true, \"subtype\": \"pdf\", \"fileName\": \"ae0f597a-81e4-4e42-923b-5df7fc7fd8b5.pdf\", \"filePath\": \"public/uploads/comprovativos/ae0f597a-81e4-4e42-923b-5df7fc7fd8b5.pdf\", \"fieldName\": \"comprovativo\", \"validated\": true, \"clientName\": \"diagramas_arquitectura.pdf\"}, \"solicitacaoId\": \"12\"}','2026-08-20 10:59:14'),(180,NULL,'POST /api/v1/operacoes/desembolsos','127.0.0.1','{\"metodo\": \"CHEQUE\", \"comprovativo\": {\"meta\": {}, \"size\": 129446, \"type\": \"application\", \"state\": \"moved\", \"errors\": [], \"extname\": \"pdf\", \"isValid\": true, \"subtype\": \"pdf\", \"fileName\": \"f4ee86d5-6831-42c8-89dc-00496efecd5f.pdf\", \"filePath\": \"public/uploads/comprovativos/f4ee86d5-6831-42c8-89dc-00496efecd5f.pdf\", \"fieldName\": \"comprovativo\", \"validated\": true, \"clientName\": \"diagramas_arquitectura.pdf\"}, \"solicitacaoId\": \"12\"}','2026-08-20 10:59:16'),(181,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"noe.francisco@gmail.com\"}','2026-08-20 10:59:43'),(182,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"noe.francisco@gmail.com\"}','2026-08-20 10:59:45'),(183,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"noe.francisco@gmail.com\"}','2026-08-20 10:59:52'),(184,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 500000, \"parcelas\": 4, \"produtoId\": 1}','2026-08-20 11:00:03'),(185,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": 500000, \"parcelas\": 4, \"clienteId\": 10, \"produtoId\": 1}','2026-08-20 11:00:14'),(186,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": 500000, \"parcelas\": 4, \"clienteId\": 10, \"produtoId\": 1}','2026-08-20 11:06:47'),(187,NULL,'POST /api/v1/inbox','127.0.0.1','{\"assunto\": \"Anexo de Arquivo - Solicitação #16\", \"conteudo\": \"O cliente vinculou o documento do seu arquivo (ID: 1) à solicitação de crédito #16.\", \"remetente_nome\": \"Noé Magalhães\", \"remetente_tipo\": \"CLIENTE\", \"destinatario_nome\": \"Departamento de Crédito\", \"destinatario_tipo\": \"ADMIN\"}','2026-08-20 11:06:47'),(188,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-20 11:15:22'),(189,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"ana.ferreira@exemplo.com\"}','2026-08-20 11:23:22'),(190,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-20 11:38:02'),(191,NULL,'PATCH /api/v1/solicitacoes/16/status','127.0.0.1','{\"status\": \"APROVADO\"}','2026-08-20 11:38:10'),(192,NULL,'PATCH /api/v1/solicitacoes/15/status','127.0.0.1','{\"status\": \"APROVADO\"}','2026-08-20 11:38:12'),(193,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"ana.ferreira@exemplo.com\"}','2026-08-20 11:51:43'),(194,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-20 12:12:12'),(195,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": 2500000, \"parcelas\": 12, \"clienteId\": 12, \"finalidade\": \"Financiamento de Equipamento / Capital de Giro\"}','2026-08-20 12:12:19'),(196,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": 2500000, \"parcelas\": 12, \"clienteId\": 12, \"finalidade\": \"Financiamento de Equipamento / Capital de Giro\"}','2026-08-20 12:12:21'),(197,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-20 12:32:28'),(198,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"ana.ferreira@exemplo.com\"}','2026-08-20 12:32:43'),(199,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 1000000, \"parcelas\": 5, \"produtoId\": 2}','2026-08-20 12:33:06'),(200,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 100000, \"parcelas\": 5, \"produtoId\": 2}','2026-08-20 12:33:11'),(201,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 100000, \"parcelas\": 7, \"produtoId\": 2}','2026-08-20 12:33:21'),(202,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #17]','127.0.0.1','{\"valor\": 100000, \"parcelas\": 7}','2026-08-20 12:33:35'),(203,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": 100000, \"parcelas\": 7, \"clienteId\": 12, \"produtoId\": 2}','2026-08-20 12:33:34'),(204,NULL,'POST /api/v1/inbox','127.0.0.1','{\"assunto\": \"Anexo de Arquivo - Solicitação #17\", \"conteudo\": \"O cliente vinculou o documento do seu arquivo (ID: 2) à solicitação de crédito #17.\", \"remetente_nome\": \"Ana Ferreira\", \"remetente_tipo\": \"CLIENTE\", \"destinatario_nome\": \"Departamento de Crédito\", \"destinatario_tipo\": \"ADMIN\"}','2026-08-20 12:33:34'),(205,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"cliente@gloxis.com\"}','2026-08-20 12:54:41'),(206,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-20 12:58:14'),(207,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-20 13:13:19'),(208,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-20 13:24:34'),(209,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"ana.ferreira@exemplo.com\"}','2026-08-20 13:27:32'),(210,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"teste@teste.com\"}','2026-08-20 13:28:07'),(211,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"ana.ferreira@exemplo.com\"}','2026-08-20 13:28:45'),(212,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"ana.ferreira@exemplo.com\"}','2026-08-20 13:33:17'),(213,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"ana.ferreira@exemplo.com\"}','2026-08-20 13:34:06'),(214,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"ana.ferreira@exemplo.com\"}','2026-08-20 13:34:51'),(215,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-20 13:35:42'),(216,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"teste@teste.com\"}','2026-08-20 13:36:29'),(217,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-20 13:43:32'),(218,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-20 18:48:18'),(219,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-20 18:48:18'),(220,NULL,'POST /api/v1/auth/refresh','127.0.0.1','{\"refreshToken\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJlbWFpbCI6ImFkbWluX3Rlc3RAZ2xveGlzLmNvbSIsInJvbGUiOiJBRE1JTiIsIm11c3RDaGFuZ2VQYXNzd29yZCI6MCwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3ODcyNTE2OTgsImV4cCI6MTc4Nzg1NjQ5OH0.ZEexAyVl0K_REnH5vNn4bdMvvfhye2k4CXYisDOnyfQ\"}','2026-08-20 18:48:18'),(221,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-20 18:48:18'),(222,NULL,'POST /api/v1/campanhas','127.0.0.1','{\"nome\": \"Campanha Fim de Ano\", \"ativo\": true, \"dataFim\": \"2026-08-21T18:48:18.511Z\", \"descricao\": \"10% de Cashback\", \"dataInicio\": \"2026-08-20T18:48:18.511Z\", \"descontoTaxaJuros\": 0, \"percentualCashback\": 10}','2026-08-20 18:48:18'),(223,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 10000, \"parcelas\": 12, \"produtoId\": 1}','2026-08-20 18:48:18'),(224,NULL,'POST /api/v1/renegociacoes','127.0.0.1','{\"clienteId\": 13, \"novaTaxaJuros\": 2, \"novasParcelas\": 5, \"solicitacaoId\": 18, \"multasPerdoadas\": 300, \"jurosMoraPerdoados\": 600}','2026-08-20 18:48:19'),(225,NULL,'POST /api/v1/account/2fa/generate','127.0.0.1','{}','2026-08-20 18:48:19'),(226,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-20 18:48:19'),(227,NULL,'POST /api/v1/account/2fa/disable','127.0.0.1','{\"token\": \"656374\"}','2026-08-20 18:48:19'),(228,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 10000, \"parcelas\": 12, \"produtoId\": 14}','2026-08-20 18:48:19'),(229,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-20 18:48:44'),(230,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-20 18:48:44'),(231,NULL,'POST /api/v1/auth/refresh','127.0.0.1','{\"refreshToken\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJlbWFpbCI6ImFkbWluX3Rlc3RAZ2xveGlzLmNvbSIsInJvbGUiOiJBRE1JTiIsIm11c3RDaGFuZ2VQYXNzd29yZCI6MCwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3ODcyNTE3MjQsImV4cCI6MTc4Nzg1NjUyNH0.en9GNqJX9gsnIA-AljrUSouzwEGGwC7K9dOW1IJgHHA\"}','2026-08-20 18:48:44'),(232,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-20 18:48:44'),(233,NULL,'POST /api/v1/campanhas','127.0.0.1','{\"nome\": \"Campanha Fim de Ano\", \"ativo\": true, \"dataFim\": \"2026-08-21T18:48:44.681Z\", \"descricao\": \"10% de Cashback\", \"dataInicio\": \"2026-08-20T18:48:44.681Z\", \"descontoTaxaJuros\": 0, \"percentualCashback\": 10}','2026-08-20 18:48:44'),(234,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 10000, \"parcelas\": 12, \"produtoId\": 1}','2026-08-20 18:48:45'),(235,NULL,'POST /api/v1/renegociacoes','127.0.0.1','{\"clienteId\": 13, \"novaTaxaJuros\": 2, \"novasParcelas\": 5, \"solicitacaoId\": 19, \"multasPerdoadas\": 300, \"jurosMoraPerdoados\": 600}','2026-08-20 18:48:45'),(236,NULL,'POST /api/v1/account/2fa/generate','127.0.0.1','{}','2026-08-20 18:48:45'),(237,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-20 18:48:45'),(238,NULL,'POST /api/v1/account/2fa/disable','127.0.0.1','{\"token\": \"018571\"}','2026-08-20 18:48:45'),(239,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 10000, \"parcelas\": 12, \"produtoId\": 15}','2026-08-20 18:48:45'),(240,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-20 18:49:03'),(241,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-20 18:49:03'),(242,NULL,'POST /api/v1/auth/refresh','127.0.0.1','{\"refreshToken\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJlbWFpbCI6ImFkbWluX3Rlc3RAZ2xveGlzLmNvbSIsInJvbGUiOiJBRE1JTiIsIm11c3RDaGFuZ2VQYXNzd29yZCI6MCwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3ODcyNTE3NDMsImV4cCI6MTc4Nzg1NjU0M30.hWoDJQFSNo67Qikpkt7ILmCVYqRFkmnf72JRAxnntoU\"}','2026-08-20 18:49:03'),(243,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-20 18:49:03'),(244,NULL,'POST /api/v1/campanhas','127.0.0.1','{\"nome\": \"Campanha Fim de Ano\", \"ativo\": true, \"dataFim\": \"2026-08-21T18:49:04.006Z\", \"descricao\": \"10% de Cashback\", \"dataInicio\": \"2026-08-20T18:49:04.006Z\", \"descontoTaxaJuros\": 0, \"percentualCashback\": 10}','2026-08-20 18:49:04'),(245,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 10000, \"parcelas\": 12, \"produtoId\": 1}','2026-08-20 18:49:04'),(246,NULL,'POST /api/v1/renegociacoes','127.0.0.1','{\"clienteId\": 13, \"novaTaxaJuros\": 2, \"novasParcelas\": 5, \"solicitacaoId\": 20, \"multasPerdoadas\": 300, \"jurosMoraPerdoados\": 600}','2026-08-20 18:49:04'),(247,NULL,'POST /api/v1/renegociacoes/1/aprovar','127.0.0.1','{}','2026-08-20 18:49:04'),(248,NULL,'POST /api/v1/account/2fa/generate','127.0.0.1','{}','2026-08-20 18:49:05'),(249,NULL,'POST /api/v1/account/2fa/enable','127.0.0.1','{\"token\": \"929255\"}','2026-08-20 18:49:05'),(250,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-20 18:49:05'),(251,NULL,'POST /api/v1/account/2fa/disable','127.0.0.1','{\"token\": \"929255\"}','2026-08-20 18:49:05'),(252,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 10000, \"parcelas\": 12, \"produtoId\": 16}','2026-08-20 18:49:05'),(253,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-20 19:17:07'),(254,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-20 19:17:08'),(255,NULL,'POST /api/v1/auth/refresh','127.0.0.1','{\"refreshToken\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJlbWFpbCI6ImFkbWluX3Rlc3RAZ2xveGlzLmNvbSIsInJvbGUiOiJBRE1JTiIsIm11c3RDaGFuZ2VQYXNzd29yZCI6MCwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3ODcyNTM0MjgsImV4cCI6MTc4Nzg1ODIyOH0.4NQXWn8r5Ng6O1NDpYV_COLUNo4d-L5KTfwBf2W5kbU\"}','2026-08-20 19:17:08'),(256,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-20 19:17:08'),(257,NULL,'POST /api/v1/campanhas','127.0.0.1','{\"nome\": \"Campanha Fim de Ano\", \"ativo\": true, \"dataFim\": \"2026-08-21T19:17:08.348Z\", \"descricao\": \"10% de Cashback\", \"dataInicio\": \"2026-08-20T19:17:08.348Z\", \"descontoTaxaJuros\": 0, \"percentualCashback\": 10}','2026-08-20 19:17:08'),(258,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 10000, \"parcelas\": 12, \"produtoId\": 1}','2026-08-20 19:17:09'),(259,NULL,'POST /api/v1/renegociacoes','127.0.0.1','{\"clienteId\": 13, \"novaTaxaJuros\": 2, \"novasParcelas\": 5, \"solicitacaoId\": 21, \"multasPerdoadas\": 300, \"jurosMoraPerdoados\": 600}','2026-08-20 19:17:09'),(260,NULL,'POST /api/v1/renegociacoes/2/aprovar','127.0.0.1','{}','2026-08-20 19:17:09'),(261,NULL,'POST /api/v1/account/2fa/generate','127.0.0.1','{}','2026-08-20 19:17:09'),(262,NULL,'POST /api/v1/account/2fa/enable','127.0.0.1','{\"token\": \"609622\"}','2026-08-20 19:17:09'),(263,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-20 19:17:09'),(264,NULL,'POST /api/v1/account/2fa/disable','127.0.0.1','{\"token\": \"609622\"}','2026-08-20 19:17:09'),(265,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 10000, \"parcelas\": 12, \"produtoId\": 17}','2026-08-20 19:17:09'),(266,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-20 19:17:41'),(267,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-20 19:17:41'),(268,NULL,'POST /api/v1/auth/refresh','127.0.0.1','{\"refreshToken\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJlbWFpbCI6ImFkbWluX3Rlc3RAZ2xveGlzLmNvbSIsInJvbGUiOiJBRE1JTiIsIm11c3RDaGFuZ2VQYXNzd29yZCI6MCwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3ODcyNTM0NjEsImV4cCI6MTc4Nzg1ODI2MX0.68guV8NOf95aAEiQwwt04j7LutnES1hJ_ft-IiDI8Ow\"}','2026-08-20 19:17:41'),(269,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-20 19:17:41'),(270,NULL,'POST /api/v1/campanhas','127.0.0.1','{\"nome\": \"Campanha Fim de Ano\", \"ativo\": true, \"dataFim\": \"2026-08-21T19:17:41.490Z\", \"descricao\": \"10% de Cashback\", \"dataInicio\": \"2026-08-20T19:17:41.489Z\", \"descontoTaxaJuros\": 0, \"percentualCashback\": 10}','2026-08-20 19:17:41'),(271,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 100000, \"parcelas\": 12, \"produtoId\": 1}','2026-08-20 19:17:41'),(272,NULL,'POST /api/v1/renegociacoes','127.0.0.1','{\"clienteId\": 13, \"novaTaxaJuros\": 2, \"novasParcelas\": 5, \"solicitacaoId\": 22, \"multasPerdoadas\": 300, \"jurosMoraPerdoados\": 600}','2026-08-20 19:17:41'),(273,NULL,'POST /api/v1/renegociacoes/3/aprovar','127.0.0.1','{}','2026-08-20 19:17:42'),(274,NULL,'POST /api/v1/account/2fa/generate','127.0.0.1','{}','2026-08-20 19:17:42'),(275,NULL,'POST /api/v1/account/2fa/enable','127.0.0.1','{\"token\": \"790428\"}','2026-08-20 19:17:42'),(276,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-20 19:17:42'),(277,NULL,'POST /api/v1/account/2fa/disable','127.0.0.1','{\"token\": \"790428\"}','2026-08-20 19:17:42'),(278,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 10000, \"parcelas\": 12, \"produtoId\": 18}','2026-08-20 19:17:42'),(279,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-20 19:40:09'),(280,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-20 19:40:09'),(281,NULL,'POST /api/v1/auth/refresh','127.0.0.1','{\"refreshToken\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJlbWFpbCI6ImFkbWluX3Rlc3RAZ2xveGlzLmNvbSIsInJvbGUiOiJBRE1JTiIsIm11c3RDaGFuZ2VQYXNzd29yZCI6MCwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3ODcyNTQ4MDksImV4cCI6MTc4Nzg1OTYwOX0.iRa5RgSsqyAI_ci8q5dArp-DS9xZ8wXKM3hAGUh39kc\"}','2026-08-20 19:40:09'),(282,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-20 19:40:10'),(283,NULL,'POST /api/v1/campanhas','127.0.0.1','{\"nome\": \"Campanha Fim de Ano\", \"ativo\": true, \"dataFim\": \"2026-08-21T19:40:10.105Z\", \"descricao\": \"10% de Cashback\", \"dataInicio\": \"2026-08-20T19:40:10.105Z\", \"descontoTaxaJuros\": 0, \"percentualCashback\": 10}','2026-08-20 19:40:10'),(284,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 100000, \"parcelas\": 12, \"produtoId\": 1}','2026-08-20 19:40:10'),(285,NULL,'POST /api/v1/renegociacoes','127.0.0.1','{\"clienteId\": 13, \"novaTaxaJuros\": 2, \"novasParcelas\": 5, \"solicitacaoId\": 23, \"multasPerdoadas\": 300, \"jurosMoraPerdoados\": 600}','2026-08-20 19:40:10'),(286,NULL,'POST /api/v1/renegociacoes/4/aprovar','127.0.0.1','{}','2026-08-20 19:40:10'),(287,NULL,'POST /api/v1/account/2fa/generate','127.0.0.1','{}','2026-08-20 19:40:11'),(288,NULL,'POST /api/v1/account/2fa/enable','127.0.0.1','{\"token\": \"688997\"}','2026-08-20 19:40:11'),(289,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-20 19:40:11'),(290,NULL,'POST /api/v1/account/2fa/disable','127.0.0.1','{\"token\": \"688997\"}','2026-08-20 19:40:11'),(291,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 10000, \"parcelas\": 12, \"produtoId\": 19}','2026-08-20 19:40:11'),(292,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-20 19:51:19'),(293,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-20 19:51:19'),(294,NULL,'POST /api/v1/auth/refresh','127.0.0.1','{\"refreshToken\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJlbWFpbCI6ImFkbWluX3Rlc3RAZ2xveGlzLmNvbSIsInJvbGUiOiJBRE1JTiIsIm11c3RDaGFuZ2VQYXNzd29yZCI6MCwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3ODcyNTU0NzksImV4cCI6MTc4Nzg2MDI3OX0.iYbpCiVAt6s54nlDcKwxBP64DDIqqohqiXQJt9eEscw\"}','2026-08-20 19:51:19'),(295,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-20 19:51:19'),(296,NULL,'POST /api/v1/campanhas','127.0.0.1','{\"nome\": \"Campanha Fim de Ano\", \"ativo\": true, \"dataFim\": \"2026-08-21T19:51:19.522Z\", \"descricao\": \"10% de Cashback\", \"dataInicio\": \"2026-08-20T19:51:19.522Z\", \"descontoTaxaJuros\": 0, \"percentualCashback\": 10}','2026-08-20 19:51:19'),(297,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 100000, \"parcelas\": 12, \"produtoId\": 1}','2026-08-20 19:51:19'),(298,NULL,'POST /api/v1/renegociacoes','127.0.0.1','{\"clienteId\": 13, \"novaTaxaJuros\": 2, \"novasParcelas\": 5, \"solicitacaoId\": 24, \"multasPerdoadas\": 300, \"jurosMoraPerdoados\": 600}','2026-08-20 19:51:20'),(299,NULL,'POST /api/v1/renegociacoes/5/aprovar','127.0.0.1','{}','2026-08-20 19:51:20'),(300,NULL,'POST /api/v1/account/2fa/generate','127.0.0.1','{}','2026-08-20 19:51:20'),(301,NULL,'POST /api/v1/account/2fa/enable','127.0.0.1','{\"token\": \"900514\"}','2026-08-20 19:51:20'),(302,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-20 19:51:20'),(303,NULL,'POST /api/v1/account/2fa/disable','127.0.0.1','{\"token\": \"900514\"}','2026-08-20 19:51:20'),(304,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 10000, \"parcelas\": 12, \"produtoId\": 20}','2026-08-20 19:51:20'),(305,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-20 19:58:05'),(306,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-20 19:58:05'),(307,NULL,'POST /api/v1/auth/refresh','127.0.0.1','{\"refreshToken\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJlbWFpbCI6ImFkbWluX3Rlc3RAZ2xveGlzLmNvbSIsInJvbGUiOiJBRE1JTiIsIm11c3RDaGFuZ2VQYXNzd29yZCI6MCwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3ODcyNTU4ODUsImV4cCI6MTc4Nzg2MDY4NX0.91cz_uHP45dYCD1rbdkDAUykII1eaxtL7Js4lJ1n6hw\"}','2026-08-20 19:58:05'),(308,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-20 19:58:05'),(309,NULL,'POST /api/v1/campanhas','127.0.0.1','{\"nome\": \"Campanha Fim de Ano\", \"ativo\": true, \"dataFim\": \"2026-08-21T19:58:05.921Z\", \"descricao\": \"10% de Cashback\", \"dataInicio\": \"2026-08-20T19:58:05.921Z\", \"descontoTaxaJuros\": 0, \"percentualCashback\": 10}','2026-08-20 19:58:05'),(310,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 100000, \"parcelas\": 12, \"produtoId\": 1}','2026-08-20 19:58:06'),(311,NULL,'POST /api/v1/renegociacoes','127.0.0.1','{\"clienteId\": 13, \"novaTaxaJuros\": 2, \"novasParcelas\": 5, \"solicitacaoId\": 25, \"multasPerdoadas\": 300, \"jurosMoraPerdoados\": 600}','2026-08-20 19:58:06'),(312,NULL,'POST /api/v1/renegociacoes/6/aprovar','127.0.0.1','{}','2026-08-20 19:58:06'),(313,NULL,'POST /api/v1/account/2fa/generate','127.0.0.1','{}','2026-08-20 19:58:06'),(314,NULL,'POST /api/v1/account/2fa/enable','127.0.0.1','{\"token\": \"075226\"}','2026-08-20 19:58:06'),(315,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-20 19:58:06'),(316,NULL,'POST /api/v1/account/2fa/disable','127.0.0.1','{\"token\": \"075226\"}','2026-08-20 19:58:06'),(317,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 10000, \"parcelas\": 12, \"produtoId\": 21}','2026-08-20 19:58:06'),(318,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #1]','127.0.0.1','{\"valor\": 15000, \"parcelas\": 12}','2026-08-20 20:03:40'),(319,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-20 20:03:40'),(320,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-20 20:03:40'),(321,NULL,'POST /api/v1/auth/refresh','127.0.0.1','{\"refreshToken\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJlbWFpbCI6ImFkbWluX3Rlc3RAZ2xveGlzLmNvbSIsInJvbGUiOiJBRE1JTiIsIm11c3RDaGFuZ2VQYXNzd29yZCI6MCwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3ODcyNTYyMjAsImV4cCI6MTc4Nzg2MTAyMH0.IHzMjQM07XllfBOpW1MRh02cCoihkaWO7TB73lpniFk\"}','2026-08-20 20:03:40'),(322,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-20 20:03:40'),(323,NULL,'POST /api/v1/campanhas','127.0.0.1','{\"nome\": \"Campanha Fim de Ano\", \"ativo\": true, \"dataFim\": \"2026-08-21T20:03:40.436Z\", \"descricao\": \"10% de Cashback\", \"dataInicio\": \"2026-08-20T20:03:40.436Z\", \"descontoTaxaJuros\": 0, \"percentualCashback\": 10}','2026-08-20 20:03:40'),(324,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 100000, \"parcelas\": 12, \"produtoId\": 1}','2026-08-20 20:03:40'),(325,NULL,'POST /api/v1/renegociacoes','127.0.0.1','{\"clienteId\": 13, \"novaTaxaJuros\": 2, \"novasParcelas\": 5, \"solicitacaoId\": 26, \"multasPerdoadas\": 300, \"jurosMoraPerdoados\": 600}','2026-08-20 20:03:40'),(326,NULL,'POST /api/v1/renegociacoes/7/aprovar','127.0.0.1','{}','2026-08-20 20:03:40'),(327,NULL,'POST /api/v1/account/2fa/generate','127.0.0.1','{}','2026-08-20 20:03:40'),(328,NULL,'POST /api/v1/account/2fa/enable','127.0.0.1','{\"token\": \"998985\"}','2026-08-20 20:03:40'),(329,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-20 20:03:41'),(330,NULL,'POST /api/v1/account/2fa/disable','127.0.0.1','{\"token\": \"998985\"}','2026-08-20 20:03:41'),(331,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 10000, \"parcelas\": 12, \"produtoId\": 22}','2026-08-20 20:03:41'),(332,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #1]','127.0.0.1','{\"valor\": 15000, \"parcelas\": 12}','2026-08-20 20:04:00'),(333,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-20 20:04:00'),(334,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-20 20:04:00'),(335,NULL,'POST /api/v1/auth/refresh','127.0.0.1','{\"refreshToken\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJlbWFpbCI6ImFkbWluX3Rlc3RAZ2xveGlzLmNvbSIsInJvbGUiOiJBRE1JTiIsIm11c3RDaGFuZ2VQYXNzd29yZCI6MCwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3ODcyNTYyNDAsImV4cCI6MTc4Nzg2MTA0MH0.YFFH_hCogty3IYnOzBU8iRD3jJa4lSOlXnqM2N2a25E\"}','2026-08-20 20:04:00'),(336,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-20 20:04:00'),(337,NULL,'POST /api/v1/campanhas','127.0.0.1','{\"nome\": \"Campanha Fim de Ano\", \"ativo\": true, \"dataFim\": \"2026-08-21T20:04:00.510Z\", \"descricao\": \"10% de Cashback\", \"dataInicio\": \"2026-08-20T20:04:00.510Z\", \"descontoTaxaJuros\": 0, \"percentualCashback\": 10}','2026-08-20 20:04:00'),(338,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 100000, \"parcelas\": 12, \"produtoId\": 1}','2026-08-20 20:04:00'),(339,NULL,'POST /api/v1/renegociacoes','127.0.0.1','{\"clienteId\": 13, \"novaTaxaJuros\": 2, \"novasParcelas\": 5, \"solicitacaoId\": 27, \"multasPerdoadas\": 300, \"jurosMoraPerdoados\": 600}','2026-08-20 20:04:00'),(340,NULL,'POST /api/v1/renegociacoes/8/aprovar','127.0.0.1','{}','2026-08-20 20:04:00'),(341,NULL,'POST /api/v1/account/2fa/generate','127.0.0.1','{}','2026-08-20 20:04:01'),(342,NULL,'POST /api/v1/account/2fa/enable','127.0.0.1','{\"token\": \"106213\"}','2026-08-20 20:04:01'),(343,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-20 20:04:01'),(344,NULL,'POST /api/v1/account/2fa/disable','127.0.0.1','{\"token\": \"106213\"}','2026-08-20 20:04:01'),(345,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 10000, \"parcelas\": 12, \"produtoId\": 23}','2026-08-20 20:04:01'),(346,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #28]','127.0.0.1','{\"valor\": 20000, \"parcelas\": 6}','2026-08-20 20:04:01'),(347,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": 20000, \"parcelas\": 6, \"clienteId\": 14}','2026-08-20 20:04:01'),(348,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": -5000, \"parcelas\": 0, \"clienteId\": 14}','2026-08-20 20:04:01'),(349,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #1]','127.0.0.1','{\"valor\": 15000, \"parcelas\": 12}','2026-08-20 20:05:59'),(350,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-20 20:05:58'),(351,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-20 20:05:59'),(352,NULL,'POST /api/v1/auth/refresh','127.0.0.1','{\"refreshToken\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJlbWFpbCI6ImFkbWluX3Rlc3RAZ2xveGlzLmNvbSIsInJvbGUiOiJBRE1JTiIsIm11c3RDaGFuZ2VQYXNzd29yZCI6MCwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3ODcyNTYzNTksImV4cCI6MTc4Nzg2MTE1OX0.g3b0aQW0qXMxXSZJmCyBS-aijMWfic-aOSsfwUJQGXI\"}','2026-08-20 20:05:59'),(353,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-20 20:05:59'),(354,NULL,'POST /api/v1/campanhas','127.0.0.1','{\"nome\": \"Campanha Fim de Ano\", \"ativo\": true, \"dataFim\": \"2026-08-21T20:05:59.306Z\", \"descricao\": \"10% de Cashback\", \"dataInicio\": \"2026-08-20T20:05:59.306Z\", \"descontoTaxaJuros\": 0, \"percentualCashback\": 10}','2026-08-20 20:05:59'),(355,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 100000, \"parcelas\": 12, \"produtoId\": 1}','2026-08-20 20:05:59'),(356,NULL,'POST /api/v1/renegociacoes','127.0.0.1','{\"clienteId\": 13, \"novaTaxaJuros\": 2, \"novasParcelas\": 5, \"solicitacaoId\": 29, \"multasPerdoadas\": 300, \"jurosMoraPerdoados\": 600}','2026-08-20 20:05:59'),(357,NULL,'POST /api/v1/renegociacoes/9/aprovar','127.0.0.1','{}','2026-08-20 20:05:59'),(358,NULL,'POST /api/v1/account/2fa/generate','127.0.0.1','{}','2026-08-20 20:05:59'),(359,NULL,'POST /api/v1/account/2fa/enable','127.0.0.1','{\"token\": \"228061\"}','2026-08-20 20:05:59'),(360,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-20 20:06:00'),(361,NULL,'POST /api/v1/account/2fa/disable','127.0.0.1','{\"token\": \"045787\"}','2026-08-20 20:06:00'),(362,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 10000, \"parcelas\": 12, \"produtoId\": 24}','2026-08-20 20:06:00'),(363,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #30]','127.0.0.1','{\"valor\": 20000, \"parcelas\": 6}','2026-08-20 20:06:00'),(364,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": 20000, \"parcelas\": 6, \"clienteId\": 14}','2026-08-20 20:06:00'),(365,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": -5000, \"parcelas\": 0, \"clienteId\": 14}','2026-08-20 20:06:00'),(366,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #1]','127.0.0.1','{\"valor\": 15000, \"parcelas\": 12}','2026-08-20 20:09:41'),(367,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-20 20:09:41'),(368,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-20 20:09:41'),(369,NULL,'POST /api/v1/auth/refresh','127.0.0.1','{\"refreshToken\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJlbWFpbCI6ImFkbWluX3Rlc3RAZ2xveGlzLmNvbSIsInJvbGUiOiJBRE1JTiIsIm11c3RDaGFuZ2VQYXNzd29yZCI6MCwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3ODcyNTY1ODEsImV4cCI6MTc4Nzg2MTM4MX0.dyhwdKBFVAHbNb0oOae002R2sInwmtgLus5RPff_xWA\"}','2026-08-20 20:09:41'),(370,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-20 20:09:41'),(371,NULL,'POST /api/v1/campanhas','127.0.0.1','{\"nome\": \"Campanha Fim de Ano\", \"ativo\": true, \"dataFim\": \"2026-08-21T20:09:41.634Z\", \"descricao\": \"10% de Cashback\", \"dataInicio\": \"2026-08-20T20:09:41.634Z\", \"descontoTaxaJuros\": 0, \"percentualCashback\": 10}','2026-08-20 20:09:41'),(372,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 100000, \"parcelas\": 12, \"produtoId\": 1}','2026-08-20 20:09:41'),(373,NULL,'POST /api/v1/renegociacoes','127.0.0.1','{\"clienteId\": 13, \"novaTaxaJuros\": 2, \"novasParcelas\": 5, \"solicitacaoId\": 31, \"multasPerdoadas\": 300, \"jurosMoraPerdoados\": 600}','2026-08-20 20:09:42'),(374,NULL,'POST /api/v1/renegociacoes/10/aprovar','127.0.0.1','{}','2026-08-20 20:09:42'),(375,NULL,'POST /api/v1/account/2fa/generate','127.0.0.1','{}','2026-08-20 20:09:42'),(376,NULL,'POST /api/v1/account/2fa/enable','127.0.0.1','{\"token\": \"351672\"}','2026-08-20 20:09:42'),(377,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-20 20:09:42'),(378,NULL,'POST /api/v1/account/2fa/disable','127.0.0.1','{\"token\": \"351672\"}','2026-08-20 20:09:42'),(379,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 10000, \"parcelas\": 12, \"produtoId\": 25}','2026-08-20 20:09:42'),(380,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #32]','127.0.0.1','{\"valor\": 20000, \"parcelas\": 6}','2026-08-20 20:09:42'),(381,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": 20000, \"parcelas\": 6, \"clienteId\": 14}','2026-08-20 20:09:42'),(382,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": -5000, \"parcelas\": 0, \"clienteId\": 14}','2026-08-20 20:09:42'),(383,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #1]','127.0.0.1','{\"valor\": 15000, \"parcelas\": 12}','2026-08-20 20:11:11'),(384,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-20 20:11:11'),(385,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-20 20:11:11'),(386,NULL,'POST /api/v1/auth/refresh','127.0.0.1','{\"refreshToken\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJlbWFpbCI6ImFkbWluX3Rlc3RAZ2xveGlzLmNvbSIsInJvbGUiOiJBRE1JTiIsIm11c3RDaGFuZ2VQYXNzd29yZCI6MCwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3ODcyNTY2NzEsImV4cCI6MTc4Nzg2MTQ3MX0.7-WqazENOKnRv6o4f3ELu_e7AtHrH4jpD-4aeBwMPCE\"}','2026-08-20 20:11:11'),(387,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-20 20:11:11'),(388,NULL,'POST /api/v1/campanhas','127.0.0.1','{\"nome\": \"Campanha Fim de Ano\", \"ativo\": true, \"dataFim\": \"2026-08-21T20:11:11.942Z\", \"descricao\": \"10% de Cashback\", \"dataInicio\": \"2026-08-20T20:11:11.942Z\", \"descontoTaxaJuros\": 0, \"percentualCashback\": 10}','2026-08-20 20:11:12'),(389,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 100000, \"parcelas\": 12, \"produtoId\": 1}','2026-08-20 20:11:12'),(390,NULL,'POST /api/v1/renegociacoes','127.0.0.1','{\"clienteId\": 13, \"novaTaxaJuros\": 2, \"novasParcelas\": 5, \"solicitacaoId\": 33, \"multasPerdoadas\": 300, \"jurosMoraPerdoados\": 600}','2026-08-20 20:11:12'),(391,NULL,'POST /api/v1/renegociacoes/11/aprovar','127.0.0.1','{}','2026-08-20 20:11:12'),(392,NULL,'POST /api/v1/account/2fa/generate','127.0.0.1','{}','2026-08-20 20:11:12'),(393,NULL,'POST /api/v1/account/2fa/enable','127.0.0.1','{\"token\": \"707949\"}','2026-08-20 20:11:12'),(394,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-20 20:11:12'),(395,NULL,'POST /api/v1/account/2fa/disable','127.0.0.1','{\"token\": \"707949\"}','2026-08-20 20:11:12'),(396,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 10000, \"parcelas\": 12, \"produtoId\": 26}','2026-08-20 20:11:13'),(397,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #34]','127.0.0.1','{\"valor\": 20000, \"parcelas\": 6}','2026-08-20 20:11:13'),(398,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": 20000, \"parcelas\": 6, \"clienteId\": 14}','2026-08-20 20:11:13'),(399,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": -5000, \"parcelas\": 0, \"clienteId\": 14}','2026-08-20 20:11:13'),(400,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-27 09:16:34'),(401,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"solicitacao_test@gloxis.com\"}','2026-08-27 09:16:55'),(402,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"solicitacao_test@gloxis.com\"}','2026-08-27 09:17:14'),(403,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"solicitacao_test@gloxis.com\"}','2026-08-27 09:17:15'),(404,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"ana.ferreira@exemplo.com\"}','2026-08-27 09:17:41'),(405,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-27 09:33:27'),(406,NULL,'PUT /api/v1/inbox/10/lida','127.0.0.1','{}','2026-08-27 09:46:46'),(407,NULL,'PUT /api/v1/inbox/9/lida','127.0.0.1','{}','2026-08-27 09:46:47'),(408,NULL,'PUT /api/v1/inbox/4/lida','127.0.0.1','{}','2026-08-27 09:46:50'),(409,NULL,'PUT /api/v1/inbox/2/lida','127.0.0.1','{}','2026-08-27 09:46:50'),(410,NULL,'PUT /api/v1/inbox/3/lida','127.0.0.1','{}','2026-08-27 09:46:50'),(411,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-27 09:48:30'),(412,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"noe.francisco@gmail.com\"}','2026-08-27 09:49:06'),(413,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 600000, \"parcelas\": 6, \"produtoId\": 1}','2026-08-27 09:49:45'),(414,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #35]','127.0.0.1','{\"valor\": 600000, \"parcelas\": 6}','2026-08-27 09:50:05'),(415,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": 600000, \"parcelas\": 6, \"clienteId\": 10, \"produtoId\": 1}','2026-08-27 09:50:05'),(416,NULL,'POST /api/v1/inbox','127.0.0.1','{\"assunto\": \"Anexo de Arquivo - Solicitação #35\", \"conteudo\": \"O cliente vinculou o documento do seu arquivo (ID: 1) à solicitação de crédito #35.\", \"remetente_nome\": \"Noé Magalhães\", \"remetente_tipo\": \"CLIENTE\", \"destinatario_nome\": \"Departamento de Crédito\", \"destinatario_tipo\": \"ADMIN\"}','2026-08-27 09:50:05'),(417,NULL,'POST /api/v1/operacoes/desembolsos','127.0.0.1','{\"metodo\": \"TRANSFERENCIA\", \"comprovativo\": {\"meta\": {}, \"size\": 242639, \"type\": \"application\", \"state\": \"moved\", \"errors\": [], \"extname\": \"pdf\", \"isValid\": true, \"subtype\": \"pdf\", \"fileName\": \"f78945e0-4f91-4e4e-b076-0ef07ca876d5.pdf\", \"filePath\": \"public/uploads/comprovativos/f78945e0-4f91-4e4e-b076-0ef07ca876d5.pdf\", \"fieldName\": \"comprovativo\", \"validated\": true, \"clientName\": \"noisy.pdf-2.pdf\"}, \"solicitacaoId\": \"35\"}','2026-08-27 09:52:06'),(418,NULL,'POST /api/v1/operacoes/desembolsos','127.0.0.1','{\"metodo\": \"TRANSFERENCIA\", \"comprovativo\": {\"meta\": {}, \"size\": 242639, \"type\": \"application\", \"state\": \"moved\", \"errors\": [], \"extname\": \"pdf\", \"isValid\": true, \"subtype\": \"pdf\", \"fileName\": \"616cd67e-2aa4-45a7-82ac-b77536db97ce.pdf\", \"filePath\": \"public/uploads/comprovativos/616cd67e-2aa4-45a7-82ac-b77536db97ce.pdf\", \"fieldName\": \"comprovativo\", \"validated\": true, \"clientName\": \"noisy.pdf-2.pdf\"}, \"solicitacaoId\": \"35\"}','2026-08-27 09:52:07'),(419,NULL,'POST /api/v1/operacoes/desembolsos','127.0.0.1','{\"metodo\": \"TRANSFERENCIA\", \"comprovativo\": {\"meta\": {}, \"size\": 226227, \"type\": \"application\", \"state\": \"moved\", \"errors\": [], \"extname\": \"pdf\", \"isValid\": true, \"subtype\": \"pdf\", \"fileName\": \"333ec2c1-5a52-4c6c-a028-09eea869c7ad.pdf\", \"filePath\": \"public/uploads/comprovativos/333ec2c1-5a52-4c6c-a028-09eea869c7ad.pdf\", \"fieldName\": \"comprovativo\", \"validated\": true, \"clientName\": \"Lorna Alvarado (1).pdf\"}, \"solicitacaoId\": \"35\"}','2026-08-27 09:52:16'),(420,NULL,'POST /api/v1/operacoes/desembolsos','127.0.0.1','{\"metodo\": \"TRANSFERENCIA\", \"comprovativo\": {\"meta\": {}, \"size\": 226227, \"type\": \"application\", \"state\": \"moved\", \"errors\": [], \"extname\": \"pdf\", \"isValid\": true, \"subtype\": \"pdf\", \"fileName\": \"5f2d2e19-2d17-40e5-9179-79d24d063110.pdf\", \"filePath\": \"public/uploads/comprovativos/5f2d2e19-2d17-40e5-9179-79d24d063110.pdf\", \"fieldName\": \"comprovativo\", \"validated\": true, \"clientName\": \"Lorna Alvarado (1).pdf\"}, \"solicitacaoId\": \"35\"}','2026-08-27 09:52:17'),(421,NULL,'POST /api/v1/operacoes/desembolsos','127.0.0.1','{\"metodo\": \"TRANSFERENCIA\", \"comprovativo\": {\"meta\": {}, \"size\": 226227, \"type\": \"application\", \"state\": \"moved\", \"errors\": [], \"extname\": \"pdf\", \"isValid\": true, \"subtype\": \"pdf\", \"fileName\": \"b1343c9f-788a-4a13-83bd-595df6a9424b.pdf\", \"filePath\": \"public/uploads/comprovativos/b1343c9f-788a-4a13-83bd-595df6a9424b.pdf\", \"fieldName\": \"comprovativo\", \"validated\": true, \"clientName\": \"Lorna Alvarado (1).pdf\"}, \"solicitacaoId\": \"35\"}','2026-08-27 09:52:17'),(422,NULL,'POST /api/v1/operacoes/desembolsos','127.0.0.1','{\"metodo\": \"TRANSFERENCIA\", \"comprovativo\": {\"meta\": {}, \"size\": 226227, \"type\": \"application\", \"state\": \"moved\", \"errors\": [], \"extname\": \"pdf\", \"isValid\": true, \"subtype\": \"pdf\", \"fileName\": \"52fa5607-01ad-46f8-9827-3499ebcc26f8.pdf\", \"filePath\": \"public/uploads/comprovativos/52fa5607-01ad-46f8-9827-3499ebcc26f8.pdf\", \"fieldName\": \"comprovativo\", \"validated\": true, \"clientName\": \"Lorna Alvarado (1).pdf\"}, \"solicitacaoId\": \"35\"}','2026-08-27 09:52:17'),(423,NULL,'POST /api/v1/operacoes/desembolsos','127.0.0.1','{\"metodo\": \"TRANSFERENCIA\", \"comprovativo\": {\"meta\": {}, \"size\": 226227, \"type\": \"application\", \"state\": \"moved\", \"errors\": [], \"extname\": \"pdf\", \"isValid\": true, \"subtype\": \"pdf\", \"fileName\": \"4bdadef1-3504-4dd0-a963-7e436d2acba8.pdf\", \"filePath\": \"public/uploads/comprovativos/4bdadef1-3504-4dd0-a963-7e436d2acba8.pdf\", \"fieldName\": \"comprovativo\", \"validated\": true, \"clientName\": \"Lorna Alvarado (1).pdf\"}, \"solicitacaoId\": \"35\"}','2026-08-27 09:52:17'),(424,NULL,'POST /api/v1/operacoes/desembolsos','127.0.0.1','{\"metodo\": \"TRANSFERENCIA\", \"comprovativo\": {\"meta\": {}, \"size\": 226227, \"type\": \"application\", \"state\": \"moved\", \"errors\": [], \"extname\": \"pdf\", \"isValid\": true, \"subtype\": \"pdf\", \"fileName\": \"c7e59beb-b879-4160-8b04-f11c60ca3a4b.pdf\", \"filePath\": \"public/uploads/comprovativos/c7e59beb-b879-4160-8b04-f11c60ca3a4b.pdf\", \"fieldName\": \"comprovativo\", \"validated\": true, \"clientName\": \"Lorna Alvarado (1).pdf\"}, \"solicitacaoId\": \"35\"}','2026-08-27 09:52:17'),(425,NULL,'POST /api/v1/operacoes/desembolsos','127.0.0.1','{\"metodo\": \"TRANSFERENCIA\", \"comprovativo\": {\"meta\": {}, \"size\": 226227, \"type\": \"application\", \"state\": \"moved\", \"errors\": [], \"extname\": \"pdf\", \"isValid\": true, \"subtype\": \"pdf\", \"fileName\": \"0a37c1f8-76db-464b-a6eb-0abfd2605a1b.pdf\", \"filePath\": \"public/uploads/comprovativos/0a37c1f8-76db-464b-a6eb-0abfd2605a1b.pdf\", \"fieldName\": \"comprovativo\", \"validated\": true, \"clientName\": \"Lorna Alvarado (1).pdf\"}, \"solicitacaoId\": \"35\"}','2026-08-27 09:52:18'),(426,NULL,'POST /api/v1/operacoes/desembolsos','127.0.0.1','{\"metodo\": \"TRANSFERENCIA\", \"comprovativo\": {\"meta\": {}, \"size\": 226227, \"type\": \"application\", \"state\": \"moved\", \"errors\": [], \"extname\": \"pdf\", \"isValid\": true, \"subtype\": \"pdf\", \"fileName\": \"5f616245-9e31-40c3-830f-bc85657f7f4b.pdf\", \"filePath\": \"public/uploads/comprovativos/5f616245-9e31-40c3-830f-bc85657f7f4b.pdf\", \"fieldName\": \"comprovativo\", \"validated\": true, \"clientName\": \"noisy.pdf\"}, \"solicitacaoId\": \"35\"}','2026-08-27 09:52:34'),(427,NULL,'POST /api/v1/operacoes/desembolsos','127.0.0.1','{\"metodo\": \"TRANSFERENCIA\", \"comprovativo\": {\"meta\": {}, \"size\": 226227, \"type\": \"application\", \"state\": \"moved\", \"errors\": [], \"extname\": \"pdf\", \"isValid\": true, \"subtype\": \"pdf\", \"fileName\": \"4bbbf70f-be92-4688-b137-a18265e03d07.pdf\", \"filePath\": \"public/uploads/comprovativos/4bbbf70f-be92-4688-b137-a18265e03d07.pdf\", \"fieldName\": \"comprovativo\", \"validated\": true, \"clientName\": \"noisy.pdf\"}, \"solicitacaoId\": \"35\"}','2026-08-27 09:52:35'),(428,NULL,'PUT /api/v1/inbox/11/lida','127.0.0.1','{}','2026-08-27 09:53:15'),(429,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 100000, \"parcelas\": 6, \"produtoId\": 1}','2026-08-27 09:53:47'),(430,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-27 10:05:17'),(431,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-28 21:19:39'),(432,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 500000, \"parcelas\": 12, \"produtoId\": 1}','2026-08-28 21:20:40'),(433,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #1]','127.0.0.1','{\"valor\": 15000, \"parcelas\": 12}','2026-08-28 21:28:41'),(434,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-28 21:28:41'),(435,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-28 21:28:42'),(436,NULL,'POST /api/v1/auth/refresh','127.0.0.1','{\"refreshToken\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJlbWFpbCI6ImFkbWluX3Rlc3RAZ2xveGlzLmNvbSIsInJvbGUiOiJBRE1JTiIsIm11c3RDaGFuZ2VQYXNzd29yZCI6MCwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3ODc5NTI1MjIsImV4cCI6MTc4ODU1NzMyMn0._bkT8SO8NddP97yM0fLrh1lm9pFFzuc5AF_r954iTyA\"}','2026-08-28 21:28:42'),(437,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-28 21:28:42'),(438,NULL,'POST /api/v1/campanhas','127.0.0.1','{\"nome\": \"Campanha Fim de Ano\", \"ativo\": true, \"dataFim\": \"2026-08-29T21:28:42.565Z\", \"descricao\": \"10% de Cashback\", \"dataInicio\": \"2026-08-28T21:28:42.565Z\", \"descontoTaxaJuros\": 0, \"percentualCashback\": 10}','2026-08-28 21:28:42'),(439,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 100000, \"parcelas\": 12, \"produtoId\": 1}','2026-08-28 21:28:43'),(440,NULL,'POST /api/v1/renegociacoes','127.0.0.1','{\"clienteId\": 13, \"novaTaxaJuros\": 2, \"novasParcelas\": 5, \"solicitacaoId\": 36, \"multasPerdoadas\": 300, \"jurosMoraPerdoados\": 600}','2026-08-28 21:28:43'),(441,NULL,'POST /api/v1/renegociacoes/12/aprovar','127.0.0.1','{}','2026-08-28 21:28:43'),(442,NULL,'POST /api/v1/account/2fa/generate','127.0.0.1','{}','2026-08-28 21:28:44'),(443,NULL,'POST /api/v1/account/2fa/enable','127.0.0.1','{\"token\": \"734027\"}','2026-08-28 21:28:44'),(444,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-28 21:28:44'),(445,NULL,'POST /api/v1/account/2fa/disable','127.0.0.1','{\"token\": \"734027\"}','2026-08-28 21:28:44'),(446,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 10000, \"parcelas\": 12, \"produtoId\": 27}','2026-08-28 21:28:44'),(447,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #37]','127.0.0.1','{\"valor\": 20000, \"parcelas\": 6}','2026-08-28 21:28:45'),(448,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": 20000, \"parcelas\": 6, \"clienteId\": 14}','2026-08-28 21:28:44'),(449,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": -5000, \"parcelas\": 0, \"clienteId\": 14}','2026-08-28 21:28:44'),(450,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 500000, \"parcelas\": 12, \"produtoId\": 1}','2026-08-28 21:29:09'),(451,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #1]','127.0.0.1','{\"valor\": 15000, \"parcelas\": 12}','2026-08-28 21:35:13'),(452,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-28 21:35:13'),(453,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-28 21:35:13'),(454,NULL,'POST /api/v1/auth/refresh','127.0.0.1','{\"refreshToken\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJlbWFpbCI6ImFkbWluX3Rlc3RAZ2xveGlzLmNvbSIsInJvbGUiOiJBRE1JTiIsIm11c3RDaGFuZ2VQYXNzd29yZCI6MCwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3ODc5NTI5MTMsImV4cCI6MTc4ODU1NzcxM30.JpQMWtjyl34FWULFhnc79f2RopGl2sd7sCl97uELExw\"}','2026-08-28 21:35:14'),(455,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-28 21:35:14'),(456,NULL,'POST /api/v1/campanhas','127.0.0.1','{\"nome\": \"Campanha Fim de Ano\", \"ativo\": true, \"dataFim\": \"2026-08-29T21:35:14.483Z\", \"descricao\": \"10% de Cashback\", \"dataInicio\": \"2026-08-28T21:35:14.483Z\", \"descontoTaxaJuros\": 0, \"percentualCashback\": 10}','2026-08-28 21:35:14'),(457,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 100000, \"parcelas\": 12, \"produtoId\": 1}','2026-08-28 21:35:15'),(458,NULL,'POST /api/v1/renegociacoes','127.0.0.1','{\"clienteId\": 13, \"novaTaxaJuros\": 2, \"novasParcelas\": 5, \"solicitacaoId\": 38, \"multasPerdoadas\": 300, \"jurosMoraPerdoados\": 600}','2026-08-28 21:35:15'),(459,NULL,'POST /api/v1/renegociacoes/13/aprovar','127.0.0.1','{}','2026-08-28 21:35:15'),(460,NULL,'POST /api/v1/account/2fa/generate','127.0.0.1','{}','2026-08-28 21:35:16'),(461,NULL,'POST /api/v1/account/2fa/enable','127.0.0.1','{\"token\": \"970299\"}','2026-08-28 21:35:16'),(462,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-28 21:35:16'),(463,NULL,'POST /api/v1/account/2fa/disable','127.0.0.1','{\"token\": \"970299\"}','2026-08-28 21:35:16'),(464,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 10000, \"parcelas\": 12, \"produtoId\": 28}','2026-08-28 21:35:16'),(465,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #39]','127.0.0.1','{\"valor\": 20000, \"parcelas\": 6}','2026-08-28 21:35:17'),(466,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": 20000, \"parcelas\": 6, \"clienteId\": 14}','2026-08-28 21:35:17'),(467,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": -5000, \"parcelas\": 0, \"clienteId\": 14}','2026-08-28 21:35:17'),(468,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-28 21:37:59'),(469,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-28 21:41:05'),(470,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-28 21:51:43'),(471,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-28 21:53:05'),(472,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"solicitacao_test@gloxis.com\"}','2026-08-28 21:58:22'),(473,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-28 21:59:20'),(474,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"ana.ferreira@exemplo.com\"}','2026-08-28 22:03:15'),(475,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"ana.ferreira@exemplo.com\"}','2026-08-28 22:03:15'),(476,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"ana.ferreira@exemplo.com\"}','2026-08-28 22:03:16'),(477,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"ana.ferreira@exemplo.com\"}','2026-08-28 22:03:16'),(478,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"ana.ferreira@exemplo.com\"}','2026-08-28 22:03:16'),(479,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"ana.ferreira@exemplo.com\"}','2026-08-28 22:03:16'),(480,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"ana.ferreira@exemplo.com\"}','2026-08-28 22:03:17'),(481,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"ana.ferreira@exemplo.com\"}','2026-08-28 22:03:17'),(482,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"ana.ferreira@exemplo.com\"}','2026-08-28 22:03:17'),(483,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"ana.ferreira@exemplo.com\"}','2026-08-28 22:03:17'),(484,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"ana.ferreira@exemplo.com\"}','2026-08-28 22:06:04'),(485,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-30 16:48:03'),(486,NULL,'PUT /api/v1/clientes/10','127.0.0.1','{\"nif\": \"243424\", \"nome\": \"Noé Magalhães\", \"email\": \"noe.francisco@gmail.com\", \"endereco\": \"Angola, Luanda\", \"telefone\": \"922323\", \"contaBancaria\": \"232323\"}','2026-08-30 16:48:53'),(487,NULL,'PUT /api/v1/clientes/10','127.0.0.1','{\"nif\": \"243424\", \"nome\": \"Noé Magalhães\", \"email\": \"noe.francisco@gmail.com\", \"endereco\": \"Angola, Luand\", \"telefone\": \"922323\", \"contaBancaria\": \"232323\"}','2026-08-30 16:49:03'),(488,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-30 17:03:17'),(489,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #1]','127.0.0.1','{\"valor\": 15000, \"parcelas\": 12}','2026-08-31 08:14:09'),(490,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 08:14:10'),(491,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 08:14:10'),(492,NULL,'POST /api/v1/auth/refresh','127.0.0.1','{\"refreshToken\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJlbWFpbCI6ImFkbWluX3Rlc3RAZ2xveGlzLmNvbSIsInJvbGUiOiJBRE1JTiIsIm11c3RDaGFuZ2VQYXNzd29yZCI6MCwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3ODgxNjQwNTAsImV4cCI6MTc4ODc2ODg1MH0.m2BiQEtjf_HWVJgD7tIVdkel1E9IIL3nSTJ-nYkXTp8\"}','2026-08-31 08:14:10'),(493,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 08:14:10'),(494,NULL,'POST /api/v1/campanhas','127.0.0.1','{\"nome\": \"Campanha Fim de Ano\", \"ativo\": true, \"dataFim\": \"2026-09-01T08:14:10.675Z\", \"descricao\": \"10% de Cashback\", \"dataInicio\": \"2026-08-31T08:14:10.675Z\", \"descontoTaxaJuros\": 0, \"percentualCashback\": 10}','2026-08-31 08:14:10'),(495,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 100000, \"parcelas\": 12, \"produtoId\": 1}','2026-08-31 08:14:11'),(496,NULL,'POST /api/v1/renegociacoes','127.0.0.1','{\"clienteId\": 13, \"novaTaxaJuros\": 2, \"novasParcelas\": 5, \"solicitacaoId\": 40, \"multasPerdoadas\": 300, \"jurosMoraPerdoados\": 600}','2026-08-31 08:14:11'),(497,NULL,'POST /api/v1/renegociacoes/14/aprovar','127.0.0.1','{}','2026-08-31 08:14:11'),(498,NULL,'POST /api/v1/account/2fa/generate','127.0.0.1','{}','2026-08-31 08:14:11'),(499,NULL,'POST /api/v1/account/2fa/enable','127.0.0.1','{\"token\": \"388480\"}','2026-08-31 08:14:11'),(500,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 08:14:12'),(501,NULL,'POST /api/v1/account/2fa/disable','127.0.0.1','{\"token\": \"388480\"}','2026-08-31 08:14:12'),(502,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 10000, \"parcelas\": 12, \"produtoId\": 29}','2026-08-31 08:14:12'),(503,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #41]','127.0.0.1','{\"valor\": 20000, \"parcelas\": 6}','2026-08-31 08:14:12'),(504,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": 20000, \"parcelas\": 6, \"clienteId\": 14}','2026-08-31 08:14:12'),(505,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": -5000, \"parcelas\": 0, \"clienteId\": 14}','2026-08-31 08:14:12'),(506,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #1]','127.0.0.1','{\"valor\": 15000, \"parcelas\": 12}','2026-08-31 08:15:20'),(507,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 08:15:20'),(508,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 08:15:20'),(509,NULL,'POST /api/v1/auth/refresh','127.0.0.1','{\"refreshToken\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJlbWFpbCI6ImFkbWluX3Rlc3RAZ2xveGlzLmNvbSIsInJvbGUiOiJBRE1JTiIsIm11c3RDaGFuZ2VQYXNzd29yZCI6MCwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3ODgxNjQxMjAsImV4cCI6MTc4ODc2ODkyMH0.YaVAcFXRVxt2GVeQg6PhyKfdAmT1Bz7Y28GQP9PTwQY\"}','2026-08-31 08:15:20'),(510,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 08:15:21'),(511,NULL,'POST /api/v1/campanhas','127.0.0.1','{\"nome\": \"Campanha Fim de Ano\", \"ativo\": true, \"dataFim\": \"2026-09-01T08:15:21.190Z\", \"descricao\": \"10% de Cashback\", \"dataInicio\": \"2026-08-31T08:15:21.190Z\", \"descontoTaxaJuros\": 0, \"percentualCashback\": 10}','2026-08-31 08:15:21'),(512,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 100000, \"parcelas\": 12, \"produtoId\": 1}','2026-08-31 08:15:21'),(513,NULL,'POST /api/v1/renegociacoes','127.0.0.1','{\"clienteId\": 13, \"novaTaxaJuros\": 2, \"novasParcelas\": 5, \"solicitacaoId\": 42, \"multasPerdoadas\": 300, \"jurosMoraPerdoados\": 600}','2026-08-31 08:15:21'),(514,NULL,'POST /api/v1/renegociacoes/15/aprovar','127.0.0.1','{}','2026-08-31 08:15:22'),(515,NULL,'POST /api/v1/account/2fa/generate','127.0.0.1','{}','2026-08-31 08:15:22'),(516,NULL,'POST /api/v1/account/2fa/enable','127.0.0.1','{\"token\": \"601133\"}','2026-08-31 08:15:22'),(517,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 08:15:22'),(518,NULL,'POST /api/v1/account/2fa/disable','127.0.0.1','{\"token\": \"601133\"}','2026-08-31 08:15:22'),(519,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 10000, \"parcelas\": 12, \"produtoId\": 30}','2026-08-31 08:15:22'),(520,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #43]','127.0.0.1','{\"valor\": 20000, \"parcelas\": 6}','2026-08-31 08:15:23'),(521,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": 20000, \"parcelas\": 6, \"clienteId\": 14}','2026-08-31 08:15:22'),(522,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": -5000, \"parcelas\": 0, \"clienteId\": 14}','2026-08-31 08:15:22'),(523,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #1]','127.0.0.1','{\"valor\": 15000, \"parcelas\": 12}','2026-08-31 08:15:55'),(524,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 08:15:55'),(525,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 08:15:56'),(526,NULL,'POST /api/v1/auth/refresh','127.0.0.1','{\"refreshToken\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJlbWFpbCI6ImFkbWluX3Rlc3RAZ2xveGlzLmNvbSIsInJvbGUiOiJBRE1JTiIsIm11c3RDaGFuZ2VQYXNzd29yZCI6MCwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3ODgxNjQxNTYsImV4cCI6MTc4ODc2ODk1Nn0.MNA2fdP6OvKaG8APM4tmQOT7Zsp02WoADfVo_PQwGC0\"}','2026-08-31 08:15:56'),(527,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 08:15:56'),(528,NULL,'POST /api/v1/campanhas','127.0.0.1','{\"nome\": \"Campanha Fim de Ano\", \"ativo\": true, \"dataFim\": \"2026-09-01T08:15:56.546Z\", \"descricao\": \"10% de Cashback\", \"dataInicio\": \"2026-08-31T08:15:56.546Z\", \"descontoTaxaJuros\": 0, \"percentualCashback\": 10}','2026-08-31 08:15:56'),(529,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 100000, \"parcelas\": 12, \"produtoId\": 1}','2026-08-31 08:15:57'),(530,NULL,'POST /api/v1/renegociacoes','127.0.0.1','{\"clienteId\": 13, \"novaTaxaJuros\": 2, \"novasParcelas\": 5, \"solicitacaoId\": 44, \"multasPerdoadas\": 300, \"jurosMoraPerdoados\": 600}','2026-08-31 08:15:57'),(531,NULL,'POST /api/v1/renegociacoes/16/aprovar','127.0.0.1','{}','2026-08-31 08:15:57'),(532,NULL,'POST /api/v1/account/2fa/generate','127.0.0.1','{}','2026-08-31 08:15:57'),(533,NULL,'POST /api/v1/account/2fa/enable','127.0.0.1','{\"token\": \"674347\"}','2026-08-31 08:15:57'),(534,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 08:15:58'),(535,NULL,'POST /api/v1/account/2fa/disable','127.0.0.1','{\"token\": \"674347\"}','2026-08-31 08:15:58'),(536,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 10000, \"parcelas\": 12, \"produtoId\": 31}','2026-08-31 08:15:58'),(537,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #45]','127.0.0.1','{\"valor\": 20000, \"parcelas\": 6}','2026-08-31 08:15:58'),(538,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": 20000, \"parcelas\": 6, \"clienteId\": 14}','2026-08-31 08:15:58'),(539,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": -5000, \"parcelas\": 0, \"clienteId\": 14}','2026-08-31 08:15:58'),(540,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #1]','127.0.0.1','{\"valor\": 15000, \"parcelas\": 12}','2026-08-31 08:16:27'),(541,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 08:16:27'),(542,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 08:16:27'),(543,NULL,'POST /api/v1/auth/refresh','127.0.0.1','{\"refreshToken\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJlbWFpbCI6ImFkbWluX3Rlc3RAZ2xveGlzLmNvbSIsInJvbGUiOiJBRE1JTiIsIm11c3RDaGFuZ2VQYXNzd29yZCI6MCwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3ODgxNjQxODcsImV4cCI6MTc4ODc2ODk4N30.4Sn5NiQE8rU8eg83rEgIwe5WBcMFcClG1O1HOwlxISE\"}','2026-08-31 08:16:27'),(544,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 08:16:27'),(545,NULL,'POST /api/v1/campanhas','127.0.0.1','{\"nome\": \"Campanha Fim de Ano\", \"ativo\": true, \"dataFim\": \"2026-09-01T08:16:28.022Z\", \"descricao\": \"10% de Cashback\", \"dataInicio\": \"2026-08-31T08:16:28.022Z\", \"descontoTaxaJuros\": 0, \"percentualCashback\": 10}','2026-08-31 08:16:28'),(546,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 100000, \"parcelas\": 12, \"produtoId\": 1}','2026-08-31 08:16:28'),(547,NULL,'POST /api/v1/renegociacoes','127.0.0.1','{\"clienteId\": 13, \"novaTaxaJuros\": 2, \"novasParcelas\": 5, \"solicitacaoId\": 46, \"multasPerdoadas\": 300, \"jurosMoraPerdoados\": 600}','2026-08-31 08:16:28'),(548,NULL,'POST /api/v1/renegociacoes/17/aprovar','127.0.0.1','{}','2026-08-31 08:16:29'),(549,NULL,'POST /api/v1/account/2fa/generate','127.0.0.1','{}','2026-08-31 08:16:29'),(550,NULL,'POST /api/v1/account/2fa/enable','127.0.0.1','{\"token\": \"809203\"}','2026-08-31 08:16:29'),(551,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 08:16:29'),(552,NULL,'POST /api/v1/account/2fa/disable','127.0.0.1','{\"token\": \"809203\"}','2026-08-31 08:16:29'),(553,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 10000, \"parcelas\": 12, \"produtoId\": 32}','2026-08-31 08:16:29'),(554,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #47]','127.0.0.1','{\"valor\": 20000, \"parcelas\": 6}','2026-08-31 08:16:30'),(555,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": 20000, \"parcelas\": 6, \"clienteId\": 14}','2026-08-31 08:16:29'),(556,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": -5000, \"parcelas\": 0, \"clienteId\": 14}','2026-08-31 08:16:29'),(557,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #1]','127.0.0.1','{\"valor\": 15000, \"parcelas\": 12}','2026-08-31 08:16:58'),(558,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 08:16:58'),(559,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 08:16:58'),(560,NULL,'POST /api/v1/auth/refresh','127.0.0.1','{\"refreshToken\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJlbWFpbCI6ImFkbWluX3Rlc3RAZ2xveGlzLmNvbSIsInJvbGUiOiJBRE1JTiIsIm11c3RDaGFuZ2VQYXNzd29yZCI6MCwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3ODgxNjQyMTgsImV4cCI6MTc4ODc2OTAxOH0.JdzL_7fETuIxUt3htmcVyusoXHrcIEIfAWqoNHJL0qY\"}','2026-08-31 08:16:58'),(561,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 08:16:58'),(562,NULL,'POST /api/v1/campanhas','127.0.0.1','{\"nome\": \"Campanha Fim de Ano\", \"ativo\": true, \"dataFim\": \"2026-09-01T08:16:58.923Z\", \"descricao\": \"10% de Cashback\", \"dataInicio\": \"2026-08-31T08:16:58.923Z\", \"descontoTaxaJuros\": 0, \"percentualCashback\": 10}','2026-08-31 08:16:59'),(563,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 100000, \"parcelas\": 12, \"produtoId\": 1}','2026-08-31 08:16:59'),(564,NULL,'POST /api/v1/renegociacoes','127.0.0.1','{\"clienteId\": 13, \"novaTaxaJuros\": 2, \"novasParcelas\": 5, \"solicitacaoId\": 48, \"multasPerdoadas\": 300, \"jurosMoraPerdoados\": 600}','2026-08-31 08:16:59'),(565,NULL,'POST /api/v1/renegociacoes/18/aprovar','127.0.0.1','{}','2026-08-31 08:16:59'),(566,NULL,'POST /api/v1/account/2fa/generate','127.0.0.1','{}','2026-08-31 08:17:00'),(567,NULL,'POST /api/v1/account/2fa/enable','127.0.0.1','{\"token\": \"856631\"}','2026-08-31 08:17:00'),(568,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 08:17:00'),(569,NULL,'POST /api/v1/account/2fa/disable','127.0.0.1','{\"token\": \"856631\"}','2026-08-31 08:17:00'),(570,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 10000, \"parcelas\": 12, \"produtoId\": 33}','2026-08-31 08:17:00'),(571,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #49]','127.0.0.1','{\"valor\": 20000, \"parcelas\": 6}','2026-08-31 08:17:01'),(572,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": 20000, \"parcelas\": 6, \"clienteId\": 14}','2026-08-31 08:17:00'),(573,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": -5000, \"parcelas\": 0, \"clienteId\": 14}','2026-08-31 08:17:00'),(574,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #1]','127.0.0.1','{\"valor\": 15000, \"parcelas\": 12}','2026-08-31 08:17:30'),(575,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 08:17:30'),(576,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 08:17:30'),(577,NULL,'POST /api/v1/auth/refresh','127.0.0.1','{\"refreshToken\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJlbWFpbCI6ImFkbWluX3Rlc3RAZ2xveGlzLmNvbSIsInJvbGUiOiJBRE1JTiIsIm11c3RDaGFuZ2VQYXNzd29yZCI6MCwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3ODgxNjQyNTAsImV4cCI6MTc4ODc2OTA1MH0.mohCMXY9Xcwx9z6OrWkk1UnJBQG1NQhqPdPh6QXdRRE\"}','2026-08-31 08:17:30'),(578,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 08:17:30'),(579,NULL,'POST /api/v1/campanhas','127.0.0.1','{\"nome\": \"Campanha Fim de Ano\", \"ativo\": true, \"dataFim\": \"2026-09-01T08:17:31.027Z\", \"descricao\": \"10% de Cashback\", \"dataInicio\": \"2026-08-31T08:17:31.027Z\", \"descontoTaxaJuros\": 0, \"percentualCashback\": 10}','2026-08-31 08:17:31'),(580,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 100000, \"parcelas\": 12, \"produtoId\": 1}','2026-08-31 08:17:31'),(581,NULL,'POST /api/v1/renegociacoes','127.0.0.1','{\"clienteId\": 13, \"novaTaxaJuros\": 2, \"novasParcelas\": 5, \"solicitacaoId\": 50, \"multasPerdoadas\": 300, \"jurosMoraPerdoados\": 600}','2026-08-31 08:17:31'),(582,NULL,'POST /api/v1/renegociacoes/19/aprovar','127.0.0.1','{}','2026-08-31 08:17:31'),(583,NULL,'POST /api/v1/account/2fa/generate','127.0.0.1','{}','2026-08-31 08:17:32'),(584,NULL,'POST /api/v1/account/2fa/enable','127.0.0.1','{\"token\": \"367647\"}','2026-08-31 08:17:32'),(585,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 08:17:32'),(586,NULL,'POST /api/v1/account/2fa/disable','127.0.0.1','{\"token\": \"367647\"}','2026-08-31 08:17:32'),(587,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 10000, \"parcelas\": 12, \"produtoId\": 34}','2026-08-31 08:17:32'),(588,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #51]','127.0.0.1','{\"valor\": 20000, \"parcelas\": 6}','2026-08-31 08:17:33'),(589,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": 20000, \"parcelas\": 6, \"clienteId\": 14}','2026-08-31 08:17:33'),(590,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": -5000, \"parcelas\": 0, \"clienteId\": 14}','2026-08-31 08:17:33'),(591,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #1]','127.0.0.1','{\"valor\": 15000, \"parcelas\": 12}','2026-08-31 08:18:02'),(592,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 08:18:02'),(593,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 08:18:03'),(594,NULL,'POST /api/v1/auth/refresh','127.0.0.1','{\"refreshToken\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJlbWFpbCI6ImFkbWluX3Rlc3RAZ2xveGlzLmNvbSIsInJvbGUiOiJBRE1JTiIsIm11c3RDaGFuZ2VQYXNzd29yZCI6MCwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3ODgxNjQyODMsImV4cCI6MTc4ODc2OTA4M30.ehR4zhZUuKLBo3rEgvVOt_G6tLpYRVEQ5oTf0el6HEw\"}','2026-08-31 08:18:03'),(595,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 08:18:03'),(596,NULL,'POST /api/v1/campanhas','127.0.0.1','{\"nome\": \"Campanha Fim de Ano\", \"ativo\": true, \"dataFim\": \"2026-09-01T08:18:03.500Z\", \"descricao\": \"10% de Cashback\", \"dataInicio\": \"2026-08-31T08:18:03.500Z\", \"descontoTaxaJuros\": 0, \"percentualCashback\": 10}','2026-08-31 08:18:03'),(597,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 100000, \"parcelas\": 12, \"produtoId\": 1}','2026-08-31 08:18:04'),(598,NULL,'POST /api/v1/renegociacoes','127.0.0.1','{\"clienteId\": 13, \"novaTaxaJuros\": 2, \"novasParcelas\": 5, \"solicitacaoId\": 52, \"multasPerdoadas\": 300, \"jurosMoraPerdoados\": 600}','2026-08-31 08:18:04'),(599,NULL,'POST /api/v1/renegociacoes/20/aprovar','127.0.0.1','{}','2026-08-31 08:18:04'),(600,NULL,'POST /api/v1/account/2fa/generate','127.0.0.1','{}','2026-08-31 08:18:04'),(601,NULL,'POST /api/v1/account/2fa/enable','127.0.0.1','{\"token\": \"893585\"}','2026-08-31 08:18:04'),(602,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 08:18:05'),(603,NULL,'POST /api/v1/account/2fa/disable','127.0.0.1','{\"token\": \"893585\"}','2026-08-31 08:18:05'),(604,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 10000, \"parcelas\": 12, \"produtoId\": 35}','2026-08-31 08:18:05'),(605,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #53]','127.0.0.1','{\"valor\": 20000, \"parcelas\": 6}','2026-08-31 08:18:05'),(606,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": 20000, \"parcelas\": 6, \"clienteId\": 14}','2026-08-31 08:18:05'),(607,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": -5000, \"parcelas\": 0, \"clienteId\": 14}','2026-08-31 08:18:05'),(608,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #1]','127.0.0.1','{\"valor\": 15000, \"parcelas\": 12}','2026-08-31 08:20:01'),(609,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 08:20:01'),(610,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 08:20:02'),(611,NULL,'POST /api/v1/auth/refresh','127.0.0.1','{\"refreshToken\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJlbWFpbCI6ImFkbWluX3Rlc3RAZ2xveGlzLmNvbSIsInJvbGUiOiJBRE1JTiIsIm11c3RDaGFuZ2VQYXNzd29yZCI6MCwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3ODgxNjQ0MDIsImV4cCI6MTc4ODc2OTIwMn0.-3lwy-qcm0Rtf60UGwGD9pC5AUZ84dVhC4cn2tJ7vKM\"}','2026-08-31 08:20:02'),(612,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 08:20:02'),(613,NULL,'POST /api/v1/campanhas','127.0.0.1','{\"nome\": \"Campanha Fim de Ano\", \"ativo\": true, \"dataFim\": \"2026-09-01T08:20:02.620Z\", \"descricao\": \"10% de Cashback\", \"dataInicio\": \"2026-08-31T08:20:02.620Z\", \"descontoTaxaJuros\": 0, \"percentualCashback\": 10}','2026-08-31 08:20:02'),(614,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 100000, \"parcelas\": 12, \"produtoId\": 1}','2026-08-31 08:20:03'),(615,NULL,'POST /api/v1/renegociacoes','127.0.0.1','{\"clienteId\": 13, \"novaTaxaJuros\": 2, \"novasParcelas\": 5, \"solicitacaoId\": 54, \"multasPerdoadas\": 300, \"jurosMoraPerdoados\": 600}','2026-08-31 08:20:03'),(616,NULL,'POST /api/v1/renegociacoes/21/aprovar','127.0.0.1','{}','2026-08-31 08:20:03'),(617,NULL,'POST /api/v1/account/2fa/generate','127.0.0.1','{}','2026-08-31 08:20:03'),(618,NULL,'POST /api/v1/account/2fa/enable','127.0.0.1','{\"token\": \"449131\"}','2026-08-31 08:20:03'),(619,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 08:20:04'),(620,NULL,'POST /api/v1/account/2fa/disable','127.0.0.1','{\"token\": \"449131\"}','2026-08-31 08:20:04'),(621,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 10000, \"parcelas\": 12, \"produtoId\": 36}','2026-08-31 08:20:04'),(622,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #55]','127.0.0.1','{\"valor\": 20000, \"parcelas\": 6}','2026-08-31 08:20:04'),(623,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": 20000, \"parcelas\": 6, \"clienteId\": 14}','2026-08-31 08:20:04'),(624,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": -5000, \"parcelas\": 0, \"clienteId\": 14}','2026-08-31 08:20:04'),(625,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #1]','127.0.0.1','{\"valor\": 15000, \"parcelas\": 12}','2026-08-31 09:09:50'),(626,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 09:09:50'),(627,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 09:09:50'),(628,NULL,'POST /api/v1/auth/refresh','127.0.0.1','{\"refreshToken\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJlbWFpbCI6ImFkbWluX3Rlc3RAZ2xveGlzLmNvbSIsInJvbGUiOiJBRE1JTiIsIm11c3RDaGFuZ2VQYXNzd29yZCI6MCwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3ODgxNjczOTAsImV4cCI6MTc4ODc3MjE5MH0.zUkuUHuKvTJvK_IF8Fw1G5fDCjRWkUl3Z-IsZ-nt5U0\"}','2026-08-31 09:09:50'),(629,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 09:09:51'),(630,NULL,'POST /api/v1/campanhas','127.0.0.1','{\"nome\": \"Campanha Fim de Ano\", \"ativo\": true, \"dataFim\": \"2026-09-01T09:09:51.095Z\", \"descricao\": \"10% de Cashback\", \"dataInicio\": \"2026-08-31T09:09:51.095Z\", \"descontoTaxaJuros\": 0, \"percentualCashback\": 10}','2026-08-31 09:09:51'),(631,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 100000, \"parcelas\": 12, \"produtoId\": 1}','2026-08-31 09:09:51'),(632,NULL,'POST /api/v1/renegociacoes','127.0.0.1','{\"clienteId\": 13, \"novaTaxaJuros\": 2, \"novasParcelas\": 5, \"solicitacaoId\": 56, \"multasPerdoadas\": 300, \"jurosMoraPerdoados\": 600}','2026-08-31 09:09:51'),(633,NULL,'POST /api/v1/renegociacoes/22/aprovar','127.0.0.1','{}','2026-08-31 09:09:51'),(634,NULL,'POST /api/v1/account/2fa/generate','127.0.0.1','{}','2026-08-31 09:09:52'),(635,NULL,'POST /api/v1/account/2fa/enable','127.0.0.1','{\"token\": \"224955\"}','2026-08-31 09:09:52'),(636,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 09:09:52'),(637,NULL,'POST /api/v1/account/2fa/disable','127.0.0.1','{\"token\": \"224955\"}','2026-08-31 09:09:52'),(638,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 10000, \"parcelas\": 12, \"produtoId\": 37}','2026-08-31 09:09:52'),(639,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #57]','127.0.0.1','{\"valor\": 20000, \"parcelas\": 6}','2026-08-31 09:09:53'),(640,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": 20000, \"parcelas\": 6, \"clienteId\": 14}','2026-08-31 09:09:52'),(641,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": -5000, \"parcelas\": 0, \"clienteId\": 14}','2026-08-31 09:09:52'),(642,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #1]','127.0.0.1','{\"valor\": 15000, \"parcelas\": 12}','2026-08-31 09:41:22'),(643,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 09:41:22'),(644,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 09:41:22'),(645,NULL,'POST /api/v1/auth/refresh','127.0.0.1','{\"refreshToken\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJlbWFpbCI6ImFkbWluX3Rlc3RAZ2xveGlzLmNvbSIsInJvbGUiOiJBRE1JTiIsIm11c3RDaGFuZ2VQYXNzd29yZCI6MCwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3ODgxNjkyODIsImV4cCI6MTc4ODc3NDA4Mn0.qH-vnlJoSSN-Nph0jEt3vKtRBzc1x3njVKVYf0W9Zho\"}','2026-08-31 09:41:22'),(646,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 09:41:22'),(647,NULL,'POST /api/v1/campanhas','127.0.0.1','{\"nome\": \"Campanha Fim de Ano\", \"ativo\": true, \"dataFim\": \"2026-09-01T09:41:22.868Z\", \"descricao\": \"10% de Cashback\", \"dataInicio\": \"2026-08-31T09:41:22.868Z\", \"descontoTaxaJuros\": 0, \"percentualCashback\": 10}','2026-08-31 09:41:22'),(648,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 100000, \"parcelas\": 12, \"produtoId\": 1}','2026-08-31 09:41:23'),(649,NULL,'POST /api/v1/renegociacoes','127.0.0.1','{\"clienteId\": 13, \"novaTaxaJuros\": 2, \"novasParcelas\": 5, \"solicitacaoId\": 58, \"multasPerdoadas\": 300, \"jurosMoraPerdoados\": 600}','2026-08-31 09:41:23'),(650,NULL,'POST /api/v1/renegociacoes/23/aprovar','127.0.0.1','{}','2026-08-31 09:41:23'),(651,NULL,'POST /api/v1/account/2fa/generate','127.0.0.1','{}','2026-08-31 09:41:23'),(652,NULL,'POST /api/v1/account/2fa/enable','127.0.0.1','{\"token\": \"186459\"}','2026-08-31 09:41:24'),(653,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 09:41:24'),(654,NULL,'POST /api/v1/account/2fa/disable','127.0.0.1','{\"token\": \"186459\"}','2026-08-31 09:41:24'),(655,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 10000, \"parcelas\": 12, \"produtoId\": 38}','2026-08-31 09:41:24'),(656,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #59]','127.0.0.1','{\"valor\": 20000, \"parcelas\": 6}','2026-08-31 09:41:24'),(657,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": 20000, \"parcelas\": 6, \"clienteId\": 14}','2026-08-31 09:41:24'),(658,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": -5000, \"parcelas\": 0, \"clienteId\": 14}','2026-08-31 09:41:24'),(659,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #1]','127.0.0.1','{\"valor\": 15000, \"parcelas\": 12}','2026-08-31 09:59:46'),(660,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 09:59:46'),(661,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 09:59:46'),(662,NULL,'POST /api/v1/auth/refresh','127.0.0.1','{\"refreshToken\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJlbWFpbCI6ImFkbWluX3Rlc3RAZ2xveGlzLmNvbSIsInJvbGUiOiJBRE1JTiIsIm11c3RDaGFuZ2VQYXNzd29yZCI6MCwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3ODgxNzAzODYsImV4cCI6MTc4ODc3NTE4Nn0.DHXZeEm3XSFzVbXD0Q1hgtJn4tpBap-hQzyxSDmJMJA\"}','2026-08-31 09:59:46'),(663,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 09:59:47'),(664,NULL,'POST /api/v1/campanhas','127.0.0.1','{\"nome\": \"Campanha Fim de Ano\", \"ativo\": true, \"dataFim\": \"2026-09-01T09:59:47.093Z\", \"descricao\": \"10% de Cashback\", \"dataInicio\": \"2026-08-31T09:59:47.093Z\", \"descontoTaxaJuros\": 0, \"percentualCashback\": 10}','2026-08-31 09:59:47'),(665,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 100000, \"parcelas\": 12, \"produtoId\": 1}','2026-08-31 09:59:47'),(666,NULL,'POST /api/v1/renegociacoes','127.0.0.1','{\"clienteId\": 13, \"novaTaxaJuros\": 2, \"novasParcelas\": 5, \"solicitacaoId\": 60, \"multasPerdoadas\": 300, \"jurosMoraPerdoados\": 600}','2026-08-31 09:59:47'),(667,NULL,'POST /api/v1/renegociacoes/24/aprovar','127.0.0.1','{}','2026-08-31 09:59:48'),(668,NULL,'POST /api/v1/account/2fa/generate','127.0.0.1','{}','2026-08-31 09:59:48'),(669,NULL,'POST /api/v1/account/2fa/enable','127.0.0.1','{\"token\": \"419826\"}','2026-08-31 09:59:48'),(670,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 09:59:48'),(671,NULL,'POST /api/v1/account/2fa/disable','127.0.0.1','{\"token\": \"419826\"}','2026-08-31 09:59:48'),(672,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 10000, \"parcelas\": 12, \"produtoId\": 39}','2026-08-31 09:59:48'),(673,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #61]','127.0.0.1','{\"valor\": 20000, \"parcelas\": 6}','2026-08-31 09:59:49'),(674,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": 20000, \"parcelas\": 6, \"clienteId\": 14}','2026-08-31 09:59:49'),(675,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": -5000, \"parcelas\": 0, \"clienteId\": 14}','2026-08-31 09:59:49'),(676,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #1]','127.0.0.1','{\"valor\": 15000, \"parcelas\": 12}','2026-08-31 10:45:17'),(677,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #1]','127.0.0.1','{\"valor\": 15000, \"parcelas\": 12}','2026-08-31 10:45:59'),(678,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 10:45:59'),(679,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 10:46:00'),(680,NULL,'POST /api/v1/auth/refresh','127.0.0.1','{\"refreshToken\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJlbWFpbCI6ImFkbWluX3Rlc3RAZ2xveGlzLmNvbSIsInJvbGUiOiJBRE1JTiIsIm11c3RDaGFuZ2VQYXNzd29yZCI6MCwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3ODgxNzMxNjAsImV4cCI6MTc4ODc3Nzk2MH0.bLY8Er3CdHsZNCYj7-4gMdlSGUHClfGu0Arrjbic4Kw\"}','2026-08-31 10:46:00'),(681,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 10:46:00'),(682,NULL,'POST /api/v1/campanhas','127.0.0.1','{\"nome\": \"Campanha Fim de Ano\", \"ativo\": true, \"dataFim\": \"2026-09-01T10:46:00.581Z\", \"descricao\": \"10% de Cashback\", \"dataInicio\": \"2026-08-31T10:46:00.581Z\", \"descontoTaxaJuros\": 0, \"percentualCashback\": 10}','2026-08-31 10:46:00'),(683,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 100000, \"parcelas\": 12, \"produtoId\": 1}','2026-08-31 10:46:01'),(684,NULL,'POST /api/v1/renegociacoes','127.0.0.1','{\"clienteId\": 13, \"novaTaxaJuros\": 2, \"novasParcelas\": 5, \"solicitacaoId\": 62, \"multasPerdoadas\": 300, \"jurosMoraPerdoados\": 600}','2026-08-31 10:46:01'),(685,NULL,'POST /api/v1/renegociacoes/25/aprovar','127.0.0.1','{}','2026-08-31 10:46:01'),(686,NULL,'POST /api/v1/account/2fa/generate','127.0.0.1','{}','2026-08-31 10:46:01'),(687,NULL,'POST /api/v1/account/2fa/enable','127.0.0.1','{\"token\": \"637892\"}','2026-08-31 10:46:01'),(688,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 10:46:02'),(689,NULL,'POST /api/v1/account/2fa/disable','127.0.0.1','{\"token\": \"637892\"}','2026-08-31 10:46:02'),(690,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 10000, \"parcelas\": 12, \"produtoId\": 40}','2026-08-31 10:46:02'),(691,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #63]','127.0.0.1','{\"valor\": 20000, \"parcelas\": 6}','2026-08-31 10:46:02'),(692,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": 20000, \"parcelas\": 6, \"clienteId\": 14}','2026-08-31 10:46:02'),(693,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": -5000, \"parcelas\": 0, \"clienteId\": 14}','2026-08-31 10:46:02'),(694,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #1]','127.0.0.1','{\"valor\": 15000, \"parcelas\": 12}','2026-08-31 11:07:27'),(695,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 11:07:28'),(696,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 11:07:28'),(697,NULL,'POST /api/v1/auth/refresh','127.0.0.1','{\"refreshToken\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJlbWFpbCI6ImFkbWluX3Rlc3RAZ2xveGlzLmNvbSIsInJvbGUiOiJBRE1JTiIsIm11c3RDaGFuZ2VQYXNzd29yZCI6MCwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3ODgxNzQ0NDgsImV4cCI6MTc4ODc3OTI0OH0.yqVt1T4NuX_85iHxPo-73B5lJ53i9GDfHqUVJNVWCMM\"}','2026-08-31 11:07:28'),(698,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 11:07:28'),(699,NULL,'POST /api/v1/campanhas','127.0.0.1','{\"nome\": \"Campanha Fim de Ano\", \"ativo\": true, \"dataFim\": \"2026-09-01T11:07:28.627Z\", \"descricao\": \"10% de Cashback\", \"dataInicio\": \"2026-08-31T11:07:28.627Z\", \"descontoTaxaJuros\": 0, \"percentualCashback\": 10}','2026-08-31 11:07:28'),(700,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 100000, \"parcelas\": 12, \"produtoId\": 1}','2026-08-31 11:07:29'),(701,NULL,'POST /api/v1/renegociacoes','127.0.0.1','{\"clienteId\": 13, \"novaTaxaJuros\": 2, \"novasParcelas\": 5, \"solicitacaoId\": 64, \"multasPerdoadas\": 300, \"jurosMoraPerdoados\": 600}','2026-08-31 11:07:29'),(702,NULL,'POST /api/v1/renegociacoes/26/aprovar','127.0.0.1','{}','2026-08-31 11:07:29'),(703,NULL,'POST /api/v1/account/2fa/generate','127.0.0.1','{}','2026-08-31 11:07:29'),(704,NULL,'POST /api/v1/account/2fa/enable','127.0.0.1','{\"token\": \"892938\"}','2026-08-31 11:07:30'),(705,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 11:07:30'),(706,NULL,'POST /api/v1/account/2fa/disable','127.0.0.1','{\"token\": \"892938\"}','2026-08-31 11:07:30'),(707,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 10000, \"parcelas\": 12, \"produtoId\": 41}','2026-08-31 11:07:30'),(708,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #65]','127.0.0.1','{\"valor\": 20000, \"parcelas\": 6}','2026-08-31 11:07:30'),(709,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": 20000, \"parcelas\": 6, \"clienteId\": 14}','2026-08-31 11:07:30'),(710,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": -5000, \"parcelas\": 0, \"clienteId\": 14}','2026-08-31 11:07:30'),(711,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #1]','127.0.0.1','{\"valor\": 15000, \"parcelas\": 12}','2026-08-31 13:17:31'),(712,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 13:17:31'),(713,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 13:17:31'),(714,NULL,'POST /api/v1/auth/refresh','127.0.0.1','{\"refreshToken\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJlbWFpbCI6ImFkbWluX3Rlc3RAZ2xveGlzLmNvbSIsInJvbGUiOiJBRE1JTiIsIm11c3RDaGFuZ2VQYXNzd29yZCI6MCwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3ODgxODIyNTEsImV4cCI6MTc4ODc4NzA1MX0.ENHDxQ3byT1HC4sm034P7F3P_XKJrr8JJt1c666_VGI\"}','2026-08-31 13:17:31'),(715,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 13:17:32'),(716,NULL,'POST /api/v1/campanhas','127.0.0.1','{\"nome\": \"Campanha Fim de Ano\", \"ativo\": true, \"dataFim\": \"2026-09-01T13:17:32.069Z\", \"descricao\": \"10% de Cashback\", \"dataInicio\": \"2026-08-31T13:17:32.069Z\", \"descontoTaxaJuros\": 0, \"percentualCashback\": 10}','2026-08-31 13:17:32'),(717,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 100000, \"parcelas\": 12, \"produtoId\": 1}','2026-08-31 13:17:32'),(718,NULL,'POST /api/v1/renegociacoes','127.0.0.1','{\"clienteId\": 13, \"novaTaxaJuros\": 2, \"novasParcelas\": 5, \"solicitacaoId\": 66, \"multasPerdoadas\": 300, \"jurosMoraPerdoados\": 600}','2026-08-31 13:17:32'),(719,NULL,'POST /api/v1/renegociacoes/27/aprovar','127.0.0.1','{}','2026-08-31 13:17:32'),(720,NULL,'POST /api/v1/account/2fa/generate','127.0.0.1','{}','2026-08-31 13:17:32'),(721,NULL,'POST /api/v1/account/2fa/enable','127.0.0.1','{\"token\": \"834602\"}','2026-08-31 13:17:32'),(722,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 13:17:33'),(723,NULL,'POST /api/v1/account/2fa/disable','127.0.0.1','{\"token\": \"834602\"}','2026-08-31 13:17:33'),(724,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 10000, \"parcelas\": 12, \"produtoId\": 42}','2026-08-31 13:17:33'),(725,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #67]','127.0.0.1','{\"valor\": 20000, \"parcelas\": 6}','2026-08-31 13:17:33'),(726,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": 20000, \"parcelas\": 6, \"clienteId\": 14}','2026-08-31 13:17:33'),(727,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": -5000, \"parcelas\": 0, \"clienteId\": 14}','2026-08-31 13:17:33'),(728,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #1]','127.0.0.1','{\"valor\": 15000, \"parcelas\": 12}','2026-08-31 13:18:07'),(729,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 13:18:06'),(730,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 13:18:07'),(731,NULL,'POST /api/v1/auth/refresh','127.0.0.1','{\"refreshToken\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJlbWFpbCI6ImFkbWluX3Rlc3RAZ2xveGlzLmNvbSIsInJvbGUiOiJBRE1JTiIsIm11c3RDaGFuZ2VQYXNzd29yZCI6MCwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3ODgxODIyODcsImV4cCI6MTc4ODc4NzA4N30.HsbkL9zqulrZ04ge7QQ1bPponcVRRVjHiDWiXjfjwtY\"}','2026-08-31 13:18:07'),(732,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 13:18:07'),(733,NULL,'POST /api/v1/campanhas','127.0.0.1','{\"nome\": \"Campanha Fim de Ano\", \"ativo\": true, \"dataFim\": \"2026-09-01T13:18:07.234Z\", \"descricao\": \"10% de Cashback\", \"dataInicio\": \"2026-08-31T13:18:07.233Z\", \"descontoTaxaJuros\": 0, \"percentualCashback\": 10}','2026-08-31 13:18:07'),(734,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 100000, \"parcelas\": 12, \"produtoId\": 1}','2026-08-31 13:18:07'),(735,NULL,'POST /api/v1/renegociacoes','127.0.0.1','{\"clienteId\": 13, \"novaTaxaJuros\": 2, \"novasParcelas\": 5, \"solicitacaoId\": 68, \"multasPerdoadas\": 300, \"jurosMoraPerdoados\": 600}','2026-08-31 13:18:07'),(736,NULL,'POST /api/v1/renegociacoes/28/aprovar','127.0.0.1','{}','2026-08-31 13:18:07'),(737,NULL,'POST /api/v1/account/2fa/generate','127.0.0.1','{}','2026-08-31 13:18:07'),(738,NULL,'POST /api/v1/account/2fa/enable','127.0.0.1','{\"token\": \"748878\"}','2026-08-31 13:18:07'),(739,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 13:18:08'),(740,NULL,'POST /api/v1/account/2fa/disable','127.0.0.1','{\"token\": \"748878\"}','2026-08-31 13:18:08'),(741,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 10000, \"parcelas\": 12, \"produtoId\": 43}','2026-08-31 13:18:08'),(742,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #69]','127.0.0.1','{\"valor\": 20000, \"parcelas\": 6}','2026-08-31 13:18:08'),(743,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": 20000, \"parcelas\": 6, \"clienteId\": 14}','2026-08-31 13:18:08'),(744,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": -5000, \"parcelas\": 0, \"clienteId\": 14}','2026-08-31 13:18:08'),(745,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #1]','127.0.0.1','{\"valor\": 15000, \"parcelas\": 12}','2026-08-31 13:18:26'),(746,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 13:18:26'),(747,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 13:18:27'),(748,NULL,'POST /api/v1/auth/refresh','127.0.0.1','{\"refreshToken\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJlbWFpbCI6ImFkbWluX3Rlc3RAZ2xveGlzLmNvbSIsInJvbGUiOiJBRE1JTiIsIm11c3RDaGFuZ2VQYXNzd29yZCI6MCwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3ODgxODIzMDcsImV4cCI6MTc4ODc4NzEwN30.4bRauDNR41G_UrLKy3L_3592nSj6OvzyYDd23_orYeo\"}','2026-08-31 13:18:27'),(749,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 13:18:27'),(750,NULL,'POST /api/v1/campanhas','127.0.0.1','{\"nome\": \"Campanha Fim de Ano\", \"ativo\": true, \"dataFim\": \"2026-09-01T13:18:27.277Z\", \"descricao\": \"10% de Cashback\", \"dataInicio\": \"2026-08-31T13:18:27.277Z\", \"descontoTaxaJuros\": 0, \"percentualCashback\": 10}','2026-08-31 13:18:27'),(751,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 100000, \"parcelas\": 12, \"produtoId\": 1}','2026-08-31 13:18:27'),(752,NULL,'POST /api/v1/renegociacoes','127.0.0.1','{\"clienteId\": 13, \"novaTaxaJuros\": 2, \"novasParcelas\": 5, \"solicitacaoId\": 70, \"multasPerdoadas\": 300, \"jurosMoraPerdoados\": 600}','2026-08-31 13:18:27'),(753,NULL,'POST /api/v1/renegociacoes/29/aprovar','127.0.0.1','{}','2026-08-31 13:18:28'),(754,NULL,'POST /api/v1/account/2fa/generate','127.0.0.1','{}','2026-08-31 13:18:28'),(755,NULL,'POST /api/v1/account/2fa/enable','127.0.0.1','{\"token\": \"888250\"}','2026-08-31 13:18:28'),(756,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 13:18:28'),(757,NULL,'POST /api/v1/account/2fa/disable','127.0.0.1','{\"token\": \"888250\"}','2026-08-31 13:18:28'),(758,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 10000, \"parcelas\": 12, \"produtoId\": 44}','2026-08-31 13:18:28'),(759,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #71]','127.0.0.1','{\"valor\": 20000, \"parcelas\": 6}','2026-08-31 13:18:29'),(760,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": 20000, \"parcelas\": 6, \"clienteId\": 14}','2026-08-31 13:18:28'),(761,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": -5000, \"parcelas\": 0, \"clienteId\": 14}','2026-08-31 13:18:28'),(762,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #1]','127.0.0.1','{\"valor\": 15000, \"parcelas\": 12}','2026-08-31 13:18:51'),(763,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 13:18:51'),(764,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 13:18:51'),(765,NULL,'POST /api/v1/auth/refresh','127.0.0.1','{\"refreshToken\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJlbWFpbCI6ImFkbWluX3Rlc3RAZ2xveGlzLmNvbSIsInJvbGUiOiJBRE1JTiIsIm11c3RDaGFuZ2VQYXNzd29yZCI6MCwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3ODgxODIzMzEsImV4cCI6MTc4ODc4NzEzMX0.hIw-H9pZsopAW2eVXstwkISk1eMWsE8roq-TWNzNa8k\"}','2026-08-31 13:18:51'),(766,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 13:18:51'),(767,NULL,'POST /api/v1/campanhas','127.0.0.1','{\"nome\": \"Campanha Fim de Ano\", \"ativo\": true, \"dataFim\": \"2026-09-01T13:18:51.642Z\", \"descricao\": \"10% de Cashback\", \"dataInicio\": \"2026-08-31T13:18:51.642Z\", \"descontoTaxaJuros\": 0, \"percentualCashback\": 10}','2026-08-31 13:18:51'),(768,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 100000, \"parcelas\": 12, \"produtoId\": 1}','2026-08-31 13:18:52'),(769,NULL,'POST /api/v1/renegociacoes','127.0.0.1','{\"clienteId\": 13, \"novaTaxaJuros\": 2, \"novasParcelas\": 5, \"solicitacaoId\": 72, \"multasPerdoadas\": 300, \"jurosMoraPerdoados\": 600}','2026-08-31 13:18:52'),(770,NULL,'POST /api/v1/renegociacoes/30/aprovar','127.0.0.1','{}','2026-08-31 13:18:52'),(771,NULL,'POST /api/v1/account/2fa/generate','127.0.0.1','{}','2026-08-31 13:18:52'),(772,NULL,'POST /api/v1/account/2fa/enable','127.0.0.1','{\"token\": \"573341\"}','2026-08-31 13:18:52'),(773,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 13:18:52'),(774,NULL,'POST /api/v1/account/2fa/disable','127.0.0.1','{\"token\": \"573341\"}','2026-08-31 13:18:52'),(775,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 10000, \"parcelas\": 12, \"produtoId\": 45}','2026-08-31 13:18:52'),(776,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #73]','127.0.0.1','{\"valor\": 20000, \"parcelas\": 6}','2026-08-31 13:18:53'),(777,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": 20000, \"parcelas\": 6, \"clienteId\": 14}','2026-08-31 13:18:53'),(778,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": -5000, \"parcelas\": 0, \"clienteId\": 14}','2026-08-31 13:18:53'),(779,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #1]','127.0.0.1','{\"valor\": 15000, \"parcelas\": 12}','2026-08-31 13:19:15'),(780,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 13:19:16'),(781,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 13:19:16'),(782,NULL,'POST /api/v1/auth/refresh','127.0.0.1','{\"refreshToken\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJlbWFpbCI6ImFkbWluX3Rlc3RAZ2xveGlzLmNvbSIsInJvbGUiOiJBRE1JTiIsIm11c3RDaGFuZ2VQYXNzd29yZCI6MCwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3ODgxODIzNTYsImV4cCI6MTc4ODc4NzE1Nn0._bVyEP0tnE3q1jCF449MnwrHpFbNyBNrcZ2-whOvS8s\"}','2026-08-31 13:19:16'),(783,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 13:19:16'),(784,NULL,'POST /api/v1/campanhas','127.0.0.1','{\"nome\": \"Campanha Fim de Ano\", \"ativo\": true, \"dataFim\": \"2026-09-01T13:19:16.884Z\", \"descricao\": \"10% de Cashback\", \"dataInicio\": \"2026-08-31T13:19:16.884Z\", \"descontoTaxaJuros\": 0, \"percentualCashback\": 10}','2026-08-31 13:19:17'),(785,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 100000, \"parcelas\": 12, \"produtoId\": 1}','2026-08-31 13:19:18'),(786,NULL,'POST /api/v1/renegociacoes','127.0.0.1','{\"clienteId\": 13, \"novaTaxaJuros\": 2, \"novasParcelas\": 5, \"solicitacaoId\": 74, \"multasPerdoadas\": 300, \"jurosMoraPerdoados\": 600}','2026-08-31 13:19:18'),(787,NULL,'POST /api/v1/renegociacoes/31/aprovar','127.0.0.1','{}','2026-08-31 13:19:18'),(788,NULL,'POST /api/v1/account/2fa/generate','127.0.0.1','{}','2026-08-31 13:19:19'),(789,NULL,'POST /api/v1/account/2fa/enable','127.0.0.1','{\"token\": \"341936\"}','2026-08-31 13:19:19'),(790,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 13:19:19'),(791,NULL,'POST /api/v1/account/2fa/disable','127.0.0.1','{\"token\": \"341936\"}','2026-08-31 13:19:19'),(792,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 10000, \"parcelas\": 12, \"produtoId\": 46}','2026-08-31 13:19:19'),(793,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #75]','127.0.0.1','{\"valor\": 20000, \"parcelas\": 6}','2026-08-31 13:19:20'),(794,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": 20000, \"parcelas\": 6, \"clienteId\": 14}','2026-08-31 13:19:19'),(795,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": -5000, \"parcelas\": 0, \"clienteId\": 14}','2026-08-31 13:19:19'),(796,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-31 15:23:48'),(797,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-31 15:23:52'),(798,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-31 15:23:53'),(799,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-31 15:23:54'),(800,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-31 15:25:38'),(801,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-31 15:26:04'),(802,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-31 15:26:30'),(803,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #1]','127.0.0.1','{\"valor\": 15000, \"parcelas\": 12}','2026-08-31 15:26:49'),(804,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 15:26:49'),(805,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 15:26:49'),(806,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 15:26:49'),(807,NULL,'POST /api/v1/campanhas','127.0.0.1','{\"nome\": \"Campanha Fim de Ano\", \"ativo\": true, \"dataFim\": \"2026-09-01T15:26:49.511Z\", \"descricao\": \"10% de Cashback\", \"dataInicio\": \"2026-08-31T15:26:49.511Z\", \"descontoTaxaJuros\": 0, \"percentualCashback\": 10}','2026-08-31 15:26:49'),(808,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 100000, \"parcelas\": 12, \"produtoId\": 1}','2026-08-31 15:26:49'),(809,NULL,'POST /api/v1/renegociacoes','127.0.0.1','{\"clienteId\": 13, \"novaTaxaJuros\": 2, \"novasParcelas\": 5, \"solicitacaoId\": 78, \"multasPerdoadas\": 300, \"jurosMoraPerdoados\": 600}','2026-08-31 15:26:49'),(810,NULL,'POST /api/v1/renegociacoes/32/aprovar','127.0.0.1','{}','2026-08-31 15:26:49'),(811,NULL,'POST /api/v1/account/2fa/generate','127.0.0.1','{}','2026-08-31 15:26:50'),(812,NULL,'POST /api/v1/account/2fa/enable','127.0.0.1','{\"token\": \"153599\"}','2026-08-31 15:26:50'),(813,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 15:26:50'),(814,NULL,'POST /api/v1/account/2fa/disable','127.0.0.1','{\"token\": \"153599\"}','2026-08-31 15:26:50'),(815,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 10000, \"parcelas\": 12, \"produtoId\": 49}','2026-08-31 15:26:50'),(816,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #79]','127.0.0.1','{\"valor\": 20000, \"parcelas\": 6}','2026-08-31 15:26:50'),(817,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": 20000, \"parcelas\": 6, \"clienteId\": 14}','2026-08-31 15:26:50'),(818,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": -5000, \"parcelas\": 0, \"clienteId\": 14}','2026-08-31 15:26:50'),(819,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #1]','127.0.0.1','{\"valor\": 15000, \"parcelas\": 12}','2026-08-31 15:27:14'),(820,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 15:27:14'),(821,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 15:27:14'),(822,NULL,'POST /api/v1/auth/refresh','127.0.0.1','{\"refreshToken\": \"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjExLCJlbWFpbCI6ImFkbWluX3Rlc3RAZ2xveGlzLmNvbSIsInJvbGUiOiJBRE1JTiIsIm11c3RDaGFuZ2VQYXNzd29yZCI6MCwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3ODgxOTAwMzQsImV4cCI6MTc4ODc5NDgzNH0.9oudbSMwFbhJGK8CW0zd4I8d-s5aBVRVUHBuC9aTtv0\"}','2026-08-31 15:27:14'),(823,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 15:27:14'),(824,NULL,'POST /api/v1/campanhas','127.0.0.1','{\"nome\": \"Campanha Fim de Ano\", \"ativo\": true, \"dataFim\": \"2026-09-01T15:27:14.942Z\", \"descricao\": \"10% de Cashback\", \"dataInicio\": \"2026-08-31T15:27:14.942Z\", \"descontoTaxaJuros\": 0, \"percentualCashback\": 10}','2026-08-31 15:27:14'),(825,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 100000, \"parcelas\": 12, \"produtoId\": 1}','2026-08-31 15:27:15'),(826,NULL,'POST /api/v1/renegociacoes','127.0.0.1','{\"clienteId\": 13, \"novaTaxaJuros\": 2, \"novasParcelas\": 5, \"solicitacaoId\": 80, \"multasPerdoadas\": 300, \"jurosMoraPerdoados\": 600}','2026-08-31 15:27:15'),(827,NULL,'POST /api/v1/renegociacoes/33/aprovar','127.0.0.1','{}','2026-08-31 15:27:15'),(828,NULL,'POST /api/v1/account/2fa/generate','127.0.0.1','{}','2026-08-31 15:27:15'),(829,NULL,'POST /api/v1/account/2fa/enable','127.0.0.1','{\"token\": \"841261\"}','2026-08-31 15:27:15'),(830,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin_test@gloxis.com\"}','2026-08-31 15:27:15'),(831,NULL,'POST /api/v1/account/2fa/disable','127.0.0.1','{\"token\": \"841261\"}','2026-08-31 15:27:15'),(832,NULL,'POST /api/v1/simulador','127.0.0.1','{\"valor\": 10000, \"parcelas\": 12, \"produtoId\": 50}','2026-08-31 15:27:15'),(833,NULL,'SOLICITACAO_CRIADA [SOLICITACAO_CREDITO #81]','127.0.0.1','{\"valor\": 20000, \"parcelas\": 6}','2026-08-31 15:27:16'),(834,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": 20000, \"parcelas\": 6, \"clienteId\": 14}','2026-08-31 15:27:15'),(835,NULL,'POST /api/v1/solicitacoes','127.0.0.1','{\"valor\": -5000, \"parcelas\": 0, \"clienteId\": 14}','2026-08-31 15:27:15'),(836,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-31 15:27:44'),(837,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-31 15:32:14'),(838,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-31 15:33:06'),(839,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-31 15:33:16'),(840,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-31 15:33:26'),(841,NULL,'POST /api/v1/auth/signup','127.0.0.1','{\"nif\": \"007211362LA041\", \"email\": \"noe.francisco@gmail.com\", \"fullName\": \"Noeh Francisoc\", \"telefone\": \"937613304\"}','2026-08-31 15:33:30'),(842,NULL,'POST /api/v1/auth/signup','127.0.0.1','{\"nif\": \"007211362LA041\", \"email\": \"noe.francis@gmail.com\", \"fullName\": \"Noeh Francisoc\", \"telefone\": \"937613304\"}','2026-08-31 15:33:38'),(843,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-31 15:35:25'),(844,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-31 15:46:18'),(845,NULL,'PATCH /api/v1/solicitacoes/81/status','127.0.0.1','{\"status\": \"APROVADO\"}','2026-08-31 15:52:47'),(846,NULL,'POST /api/v1/auth/login','127.0.0.1','{\"email\": \"admin@gloxis.com\"}','2026-08-31 16:01:43'),(847,NULL,'PUT /api/v1/transparencia/documentos/1','127.0.0.1','{\"date\": \"Janeiro 2026\", \"file\": {\"meta\": {}, \"size\": 93485, \"type\": \"application\", \"state\": \"moved\", \"errors\": [], \"extname\": \"pdf\", \"isValid\": true, \"subtype\": \"pdf\", \"fileName\": \"1788192272652_Prossional de Assistente de Contact Center Africell_094857.pdf\", \"filePath\": \"/home/mr-nobody/Documentos/_/VA/gloxis/backend/public/uploads/1788192272652_Prossional de Assistente de Contact Center Africell_094857.pdf\", \"fieldName\": \"file\", \"validated\": true, \"clientName\": \"Prossional de Assistente de Contact Center Africell_094857.pdf\"}, \"title\": \"Aviso N.º 10/2024 BNA - Regulamento de Microcrédito\", \"categoria\": \"Regulamento\"}','2026-08-31 16:04:32');
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
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clientes`
--

LOCK TABLES `clientes` WRITE;
/*!40000 ALTER TABLE `clientes` DISABLE KEYS */;
INSERT INTO `clientes` VALUES (1,'Maria Silva','123456789','[]','{\"rua\":\"Av. Central\",\"numero\":100}','{\"banco\":\"Banco X\",\"agencia\":\"0001\",\"conta\":\"12345-6\"}','2026-04-07 00:29:18','2026-08-19 19:12:36',0,'NOVO','maria.silva@exemplo.com','923000001',8,NULL,NULL),(2,'João Santos','987654321','[]','{\"rua\":\"Rua das Flores\",\"numero\":45}','{\"banco\":\"Banco Y\",\"agencia\":\"0022\",\"conta\":\"98765-4\"}','2026-03-18 00:29:18','2026-08-19 19:12:36',0,'NOVO','joao.santos@exemplo.com','923000002',9,NULL,NULL),(5,'Noé Magalhães','54324',NULL,NULL,NULL,'2026-08-15 00:38:02','2026-08-15 00:38:02',0,'NOVO',NULL,NULL,NULL,NULL,NULL),(6,'Noé Magalhães','33444',NULL,'Angola, Luanda','434343','2026-08-15 00:42:03','2026-08-15 00:42:03',0,'NOVO','ola@gmail.com','443',NULL,NULL,NULL),(7,'Teste','12345',NULL,NULL,NULL,'2026-08-15 00:46:02','2026-08-15 00:46:02',0,'NOVO','teste@teste.com',NULL,NULL,NULL,NULL),(8,'Teste','NIF888',NULL,'Rua A','IBAN123','2026-08-15 00:46:21','2026-08-15 00:46:21',0,'NOVO','teste@teste.com','123',NULL,NULL,NULL),(9,'Noé Magalhães','34343',NULL,'Angola, Luanda','23232','2026-08-15 00:48:23','2026-08-15 00:48:23',0,'NOVO','ola@gmail.com','3443',NULL,NULL,NULL),(10,'Noé Magalhães','243424',NULL,'Angola, Luand','232323','2026-08-15 01:08:00','2026-08-30 16:49:03',0,'NOVO','noe.francisco@gmail.com','922323',6,'/uploads/clientes/fotografias/9844940d-f379-4c47-90a1-e85390bd373c.png','/uploads/clientes/logotipos/aa08ab39-f2fe-4a10-98e0-e3545b268cb5.png'),(12,'Ana Ferreira','456789123','[]','{\"rua\":\"Rua da Paz\",\"numero\":12}','{\"banco\":\"Banco Z\",\"agencia\":\"0033\",\"conta\":\"11223-5\"}','2026-08-19 19:12:36','2026-08-31 14:14:44',0,'NOVO','ana.ferreira@exemplo.com','923000003',10,NULL,NULL),(13,'Cliente Inadimplente','000111222BA045',NULL,NULL,NULL,'2026-08-20 18:48:19','2026-08-20 18:48:19',0,'NOVO',NULL,NULL,NULL,NULL,NULL),(14,'Cliente Teste Solicitacao','541298374',NULL,NULL,NULL,'2026-08-20 20:04:01','2026-08-20 20:04:01',0,'NOVO','solicitacao_test@gloxis.com','+244923000111',NULL,NULL,NULL),(15,'Noeh Francisoc','007211362LA041',NULL,NULL,NULL,'2026-08-31 15:33:39','2026-08-31 15:33:39',0,'NOVO','noe.francis@gmail.com','937613304',13,NULL,NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `faturas`
--

LOCK TABLES `faturas` WRITE;
/*!40000 ALTER TABLE `faturas` DISABLE KEYS */;
INSERT INTO `faturas` VALUES (1,1,0.00,'EMITIDA','2026-08-19 19:08:44','2026-08-19 19:08:44','Cliente Consumidor Final','5418009900','FT',0.00,0.00,'BB5AAE5CA794BFFE','[]','2026-09-18'),(2,10,500000.00,'PENDENTE','2026-08-20 11:06:47','2026-08-20 11:06:47','Mutuário','000000000','FT',0.00,0.00,'232B131A1A4EBC9E','[{\"descricao\":\"Solicitação de Crédito #16\",\"valor\":500000}]','2026-09-19'),(3,12,100000.00,'PENDENTE','2026-08-20 12:33:34','2026-08-20 12:33:34','Ana Ferreira','456789123','FT',0.00,0.00,'16316847D817842B','[{\"descricao\":\"Solicitação de Crédito #17\",\"valor\":100000}]','2026-09-19'),(4,14,20000.00,'PENDENTE','2026-08-20 20:04:01','2026-08-20 20:04:01','Cliente Teste Solicitacao','541298374','FT',0.00,0.00,'34ED9367AA22954B','[{\"descricao\":\"Solicitação de Crédito #28\",\"valor\":20000}]','2026-09-19'),(5,14,20000.00,'PENDENTE','2026-08-20 20:06:00','2026-08-20 20:06:00','Cliente Teste Solicitacao','541298374','FT',0.00,0.00,'9125AF4DD566FF41','[{\"descricao\":\"Solicitação de Crédito #30\",\"valor\":20000}]','2026-09-19'),(6,14,20000.00,'PENDENTE','2026-08-20 20:09:42','2026-08-20 20:09:42','Cliente Teste Solicitacao','541298374','FT',0.00,0.00,'1B685E2F3FDB97C9','[{\"descricao\":\"Solicitação de Crédito #32\",\"valor\":20000}]','2026-09-19'),(7,14,20000.00,'PENDENTE','2026-08-20 20:11:13','2026-08-20 20:11:13','Cliente Teste Solicitacao','541298374','FT',0.00,0.00,'E4067A071D33FB46','[{\"descricao\":\"Solicitação de Crédito #34\",\"valor\":20000}]','2026-09-19'),(8,10,600000.00,'PENDENTE','2026-08-27 09:50:05','2026-08-27 09:50:05','Noé Magalhães','243424','FT',0.00,0.00,'556BC968A7CA830C','[{\"descricao\":\"Solicitação de Crédito #35\",\"valor\":600000}]','2026-09-26'),(9,14,20000.00,'PENDENTE','2026-08-28 21:28:44','2026-08-28 21:28:44','Cliente Teste Solicitacao','541298374','FT',0.00,0.00,'89B60A8B542D2F18','[{\"descricao\":\"Solicitação de Crédito #37\",\"valor\":20000}]','2026-09-27'),(10,14,20000.00,'PENDENTE','2026-08-28 21:35:17','2026-08-28 21:35:17','Cliente Teste Solicitacao','541298374','FT',0.00,0.00,'AF8EF04A229FA1D5','[{\"descricao\":\"Solicitação de Crédito #39\",\"valor\":20000}]','2026-09-27'),(11,14,20000.00,'PENDENTE','2026-08-31 08:14:12','2026-08-31 08:14:12','Cliente Teste Solicitacao','541298374','FT',0.00,0.00,'84E2B574DDD92FA9','[{\"descricao\":\"Solicitação de Crédito #41\",\"valor\":20000}]','2026-09-30'),(12,14,20000.00,'PENDENTE','2026-08-31 08:15:22','2026-08-31 08:15:22','Cliente Teste Solicitacao','541298374','FT',0.00,0.00,'133F49ED4AA4A5F6','[{\"descricao\":\"Solicitação de Crédito #43\",\"valor\":20000}]','2026-09-30'),(13,14,20000.00,'PENDENTE','2026-08-31 08:15:58','2026-08-31 08:15:58','Cliente Teste Solicitacao','541298374','FT',0.00,0.00,'F748B95DD767FE00','[{\"descricao\":\"Solicitação de Crédito #45\",\"valor\":20000}]','2026-09-30'),(14,14,20000.00,'PENDENTE','2026-08-31 08:16:29','2026-08-31 08:16:29','Cliente Teste Solicitacao','541298374','FT',0.00,0.00,'CAAAC509F4528B53','[{\"descricao\":\"Solicitação de Crédito #47\",\"valor\":20000}]','2026-09-30'),(15,14,20000.00,'PENDENTE','2026-08-31 08:17:00','2026-08-31 08:17:00','Cliente Teste Solicitacao','541298374','FT',0.00,0.00,'5437A65B50C43CED','[{\"descricao\":\"Solicitação de Crédito #49\",\"valor\":20000}]','2026-09-30'),(16,14,20000.00,'PENDENTE','2026-08-31 08:17:33','2026-08-31 08:17:33','Cliente Teste Solicitacao','541298374','FT',0.00,0.00,'03A73EB42F8FE9AC','[{\"descricao\":\"Solicitação de Crédito #51\",\"valor\":20000}]','2026-09-30'),(17,14,20000.00,'PENDENTE','2026-08-31 08:18:05','2026-08-31 08:18:05','Cliente Teste Solicitacao','541298374','FT',0.00,0.00,'0B0ACB967B56D194','[{\"descricao\":\"Solicitação de Crédito #53\",\"valor\":20000}]','2026-09-30'),(18,14,20000.00,'PENDENTE','2026-08-31 08:20:04','2026-08-31 08:20:04','Cliente Teste Solicitacao','541298374','FT',0.00,0.00,'97FB8E3B8ACA885E','[{\"descricao\":\"Solicitação de Crédito #55\",\"valor\":20000}]','2026-09-30'),(19,14,20000.00,'PENDENTE','2026-08-31 09:09:52','2026-08-31 09:09:52','Cliente Teste Solicitacao','541298374','FT',0.00,0.00,'08C007A8383575E8','[{\"descricao\":\"Solicitação de Crédito #57\",\"valor\":20000}]','2026-09-30'),(20,14,20000.00,'PENDENTE','2026-08-31 09:41:24','2026-08-31 09:41:24','Cliente Teste Solicitacao','541298374','FT',0.00,0.00,'8EB86A6C6940679E','[{\"descricao\":\"Solicitação de Crédito #59\",\"valor\":20000}]','2026-09-30'),(21,14,20000.00,'PENDENTE','2026-08-31 09:59:49','2026-08-31 09:59:49','Cliente Teste Solicitacao','541298374','FT',0.00,0.00,'FFE5305C1F3967D0','[{\"descricao\":\"Solicitação de Crédito #61\",\"valor\":20000}]','2026-09-30'),(22,14,20000.00,'PENDENTE','2026-08-31 10:46:02','2026-08-31 10:46:02','Cliente Teste Solicitacao','541298374','FT',0.00,0.00,'2DE8F57586C7D597','[{\"descricao\":\"Solicitação de Crédito #63\",\"valor\":20000}]','2026-09-30'),(23,14,20000.00,'PENDENTE','2026-08-31 11:07:30','2026-08-31 11:07:30','Cliente Teste Solicitacao','541298374','FT',0.00,0.00,'691840D6DDC96781','[{\"descricao\":\"Solicitação de Crédito #65\",\"valor\":20000}]','2026-09-30'),(24,14,20000.00,'PENDENTE','2026-08-31 13:17:33','2026-08-31 13:17:33','Cliente Teste Solicitacao','541298374','FT',0.00,0.00,'08F115F26541BB03','[{\"descricao\":\"Solicitação de Crédito #67\",\"valor\":20000}]','2026-09-30'),(25,14,20000.00,'PENDENTE','2026-08-31 13:18:08','2026-08-31 13:18:08','Cliente Teste Solicitacao','541298374','FT',0.00,0.00,'BAD5C6F65FEDD10E','[{\"descricao\":\"Solicitação de Crédito #69\",\"valor\":20000}]','2026-09-30'),(26,14,20000.00,'PENDENTE','2026-08-31 13:18:28','2026-08-31 13:18:28','Cliente Teste Solicitacao','541298374','FT',0.00,0.00,'7DAD2FE6A3243B0B','[{\"descricao\":\"Solicitação de Crédito #71\",\"valor\":20000}]','2026-09-30'),(27,14,20000.00,'PENDENTE','2026-08-31 13:18:53','2026-08-31 13:18:53','Cliente Teste Solicitacao','541298374','FT',0.00,0.00,'10E722F9E5F2C9D8','[{\"descricao\":\"Solicitação de Crédito #73\",\"valor\":20000}]','2026-09-30'),(28,14,20000.00,'PENDENTE','2026-08-31 13:19:19','2026-08-31 13:19:19','Cliente Teste Solicitacao','541298374','FT',0.00,0.00,'E8AA45591A775D9F','[{\"descricao\":\"Solicitação de Crédito #75\",\"valor\":20000}]','2026-09-30'),(29,14,20000.00,'PENDENTE','2026-08-31 15:26:50','2026-08-31 15:26:50','Cliente Teste Solicitacao','541298374','FT',0.00,0.00,'DDBFAD4A2C14D653','[{\"descricao\":\"Solicitação de Crédito #79\",\"valor\":20000}]','2026-09-30'),(30,14,20000.00,'PENDENTE','2026-08-31 15:27:15','2026-08-31 15:27:15','Cliente Teste Solicitacao','541298374','FT',0.00,0.00,'383725B37E89D1E3','[{\"descricao\":\"Solicitação de Crédito #81\",\"valor\":20000}]','2026-09-30');
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
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mensagens_inbox`
--

LOCK TABLES `mensagens_inbox` WRITE;
/*!40000 ALTER TABLE `mensagens_inbox` DISABLE KEYS */;
INSERT INTO `mensagens_inbox` VALUES (1,NULL,'Administrador','ADMIN',NULL,'887','CLIENTE','888','8888',1,1,'2026-08-15 01:35:06','2026-08-15 01:35:12'),(2,NULL,'Administrador','ADMIN',NULL,'887','CLIENTE','Resposta Direta para 887','Documento anexado à conversa.',1,1,'2026-08-15 01:39:05','2026-08-27 09:46:50'),(3,NULL,'Administrador','ADMIN',NULL,'887','CLIENTE','Resposta Direta para 887','oaksk',NULL,1,'2026-08-15 01:42:01','2026-08-27 09:46:50'),(4,NULL,'Administrador','ADMIN',NULL,'887','CLIENTE','Resposta Direta para 887','sols',NULL,1,'2026-08-15 01:42:03','2026-08-27 09:46:50'),(5,NULL,'Ana Ferreira','CLIENTE',NULL,'Administração','ADMIN','[Consultoria] Agendamento de Chamada (VIDEO)','O cliente solicitou uma consultoria financeira.\n\nDetalhes:\nData: 2026-09-02\nHora: 10:00\nTipo: Videochamada',NULL,1,'2026-08-19 19:18:29','2026-08-19 21:04:51'),(6,NULL,'Ana Ferreira','CLIENTE',NULL,'Departamento de Crédito','ADMIN','Anexo de Arquivo - Solicitação #14','O cliente vinculou o documento do seu arquivo (ID: 3) à solicitação de crédito #14.',NULL,1,'2026-08-19 20:14:24','2026-08-19 21:04:49'),(7,NULL,'Ana Ferreira','CLIENTE',NULL,'Administração Gloxis','ADMIN','vamos','22',NULL,1,'2026-08-19 20:40:06','2026-08-19 21:04:59'),(8,NULL,'Ana Ferreira','CLIENTE',NULL,'Administração Gloxis','ADMIN','[CONSULTORIA] Esclarecimento de Dívida','Tipo: PRESENCIAL\nAssunto: Esclarecimento de Dívida\nData Preferida: 2026-08-21 10:05\n\nDescrição:\njjj',NULL,1,'2026-08-19 21:06:07','2026-08-19 21:06:21'),(9,NULL,'Noé Magalhães','CLIENTE',NULL,'Departamento de Crédito','ADMIN','Anexo de Arquivo - Solicitação #16','O cliente vinculou o documento do seu arquivo (ID: 1) à solicitação de crédito #16.',NULL,1,'2026-08-20 11:06:47','2026-08-27 09:46:47'),(10,NULL,'Ana Ferreira','CLIENTE',NULL,'Departamento de Crédito','ADMIN','Anexo de Arquivo - Solicitação #17','O cliente vinculou o documento do seu arquivo (ID: 2) à solicitação de crédito #17.',NULL,1,'2026-08-20 12:33:34','2026-08-27 09:46:46'),(11,NULL,'Noé Magalhães','CLIENTE',NULL,'Departamento de Crédito','ADMIN','Anexo de Arquivo - Solicitação #35','O cliente vinculou o documento do seu arquivo (ID: 1) à solicitação de crédito #35.',NULL,1,'2026-08-27 09:50:05','2026-08-27 09:53:15');
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
  `comprovativo_reembolso_path` varchar(255) DEFAULT NULL,
  `notas` text,
  `aprovado_por_id` int unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `pagamentos_solicitacao_id_foreign` (`solicitacao_id`),
  CONSTRAINT `pagamentos_solicitacao_id_foreign` FOREIGN KEY (`solicitacao_id`) REFERENCES `solicitacao_creditos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=271 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `produto_creditos`
--

LOCK TABLES `produto_creditos` WRITE;
/*!40000 ALTER TABLE `produto_creditos` DISABLE KEYS */;
INSERT INTO `produto_creditos` VALUES (1,'Microcrédito Empreendedor (Popular)','Crédito voltado para pequenos negócios informais.',0.0500,3,12,50000.00,1000000.00,1,'2026-08-14 23:25:06','2026-08-14 23:25:06'),(2,'Crédito Pessoal (Funcionário Público)','Crédito com taxas reduzidas para servidores.',0.0350,6,60,100000.00,5000000.00,1,'2026-08-14 23:25:06','2026-08-14 23:25:06'),(3,'Microcrédito Empreendedor (Popular)','Crédito voltado para pequenos negócios informais.',0.0500,3,12,50000.00,1000000.00,1,'2026-08-14 23:25:28','2026-08-14 23:25:28'),(4,'Crédito Pessoal (Funcionário Público)','Crédito com taxas reduzidas para servidores.',0.0350,6,60,100000.00,5000000.00,1,'2026-08-14 23:25:28','2026-08-14 23:25:28'),(5,'Microcrédito Empreendedor (Popular)','Crédito voltado para pequenos negócios informais.',0.0500,3,12,50000.00,1000000.00,1,'2026-08-14 23:27:06','2026-08-14 23:27:06'),(6,'Crédito Pessoal (Funcionário Público)','Crédito com taxas reduzidas para servidores.',0.0350,6,60,100000.00,5000000.00,1,'2026-08-14 23:27:06','2026-08-14 23:27:06'),(7,'Microcrédito Empreendedor (Popular)','Crédito voltado para pequenos negócios informais.',0.0500,3,12,50000.00,1000000.00,1,'2026-08-14 23:32:52','2026-08-14 23:32:52'),(8,'Crédito Pessoal (Funcionário Público)','Crédito com taxas reduzidas para servidores.',0.0350,6,60,100000.00,5000000.00,1,'2026-08-14 23:32:52','2026-08-14 23:32:52'),(9,'Microcrédito Empreendedor (Popular)','Crédito voltado para pequenos negócios informais.',0.0500,3,12,50000.00,1000000.00,1,'2026-08-19 19:02:48','2026-08-19 19:02:48'),(10,'Crédito Pessoal (Funcionário Público)','Crédito com taxas reduzidas para servidores.',0.0350,6,60,100000.00,5000000.00,1,'2026-08-19 19:02:48','2026-08-19 19:02:48'),(11,'Microcrédito Empreendedor (Popular)','Crédito voltado para pequenos negócios informais.',0.0500,3,12,50000.00,1000000.00,1,'2026-08-19 19:12:36','2026-08-19 19:12:36'),(12,'Crédito Pessoal (Funcionário Público)','Crédito com taxas reduzidas para servidores.',0.0350,6,60,100000.00,5000000.00,1,'2026-08-19 19:12:36','2026-08-19 19:12:36'),(13,'Produto Padrão',NULL,0.0500,3,24,1000.00,50000.00,1,'2026-08-20 18:48:19','2026-08-20 18:48:19'),(47,'Microcrédito Empreendedor (Popular)','Crédito voltado para pequenos negócios informais.',0.0500,3,12,50000.00,1000000.00,1,'2026-08-31 14:14:44','2026-08-31 14:14:44'),(48,'Crédito Pessoal (Funcionário Público)','Crédito com taxas reduzidas para servidores.',0.0350,6,60,100000.00,5000000.00,1,'2026-08-31 14:14:44','2026-08-31 14:14:44');
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
) ENGINE=InnoDB AUTO_INCREMENT=34 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
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
  `finalidade` varchar(255) DEFAULT NULL,
  `data_aprovacao` timestamp NULL DEFAULT NULL,
  `data_inicio_pagamento` timestamp NULL DEFAULT NULL,
  `data_vencimento_final` timestamp NULL DEFAULT NULL,
  `taxa_juros` decimal(5,4) DEFAULT '0.0300',
  `comprovativo_desembolso_path` varchar(255) DEFAULT NULL,
  `motivo_rejeicao` text,
  PRIMARY KEY (`id`),
  KEY `solicitacao_creditos_cliente_id_foreign` (`cliente_id`),
  CONSTRAINT `solicitacao_creditos_cliente_id_foreign` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=82 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `solicitacao_creditos`
--

LOCK TABLES `solicitacao_creditos` WRITE;
/*!40000 ALTER TABLE `solicitacao_creditos` DISABLE KEYS */;
INSERT INTO `solicitacao_creditos` VALUES (1,1,5000.00,12,'PENDENTE','2026-04-25 00:29:18','2026-04-25 00:29:18',NULL,NULL,NULL,NULL,0.0300,NULL,NULL),(2,2,12000.50,24,'APROVADO','2026-05-12 00:29:18','2026-05-12 00:29:18',NULL,NULL,NULL,NULL,0.0300,NULL,NULL),(3,1,5000.00,12,'PENDENTE','2026-05-26 00:29:18','2026-05-26 00:29:18',NULL,NULL,NULL,NULL,0.0300,NULL,NULL),(4,2,12000.50,24,'APROVADO','2026-08-11 00:29:18','2026-08-11 00:29:18',NULL,NULL,NULL,NULL,0.0300,NULL,NULL),(5,1,5000.00,12,'PENDENTE','2026-06-04 00:29:18','2026-06-04 00:29:18',NULL,NULL,NULL,NULL,0.0300,NULL,NULL),(6,2,12000.50,24,'APROVADO','2026-08-06 00:29:18','2026-08-06 00:29:18',NULL,NULL,NULL,NULL,0.0300,NULL,NULL),(7,1,5000.00,12,'APROVADO','2026-08-19 19:02:48','2026-08-20 10:32:17',NULL,NULL,NULL,NULL,0.0300,NULL,NULL),(8,2,12000.50,24,'APROVADO','2026-08-19 19:02:48','2026-08-19 19:02:48',NULL,NULL,NULL,NULL,0.0300,NULL,NULL),(9,1,5000.00,12,'APROVADO','2026-08-19 19:12:36','2026-08-20 10:22:04',NULL,NULL,NULL,NULL,0.0300,NULL,NULL),(10,2,12000.50,24,'APROVADO','2026-08-19 19:12:36','2026-08-19 19:12:36',NULL,NULL,NULL,NULL,0.0300,NULL,NULL),(11,12,50001.00,4,'APROVADO','2026-08-19 19:30:05','2026-08-20 10:27:51',NULL,NULL,NULL,NULL,0.0300,NULL,NULL),(12,12,210000.00,5,'APROVADO','2026-08-19 19:47:13','2026-08-19 20:09:34',NULL,NULL,NULL,NULL,0.0300,NULL,NULL),(13,12,400000.00,7,'REJEITADO','2026-08-19 20:10:56','2026-08-19 20:25:06',NULL,NULL,NULL,NULL,0.0300,NULL,NULL),(14,12,400000.00,7,'APROVADO','2026-08-19 20:14:24','2026-08-19 20:14:40',NULL,NULL,NULL,NULL,0.0300,NULL,NULL),(15,10,500000.00,4,'APROVADO','2026-08-20 11:00:14','2026-08-20 11:38:12',NULL,NULL,NULL,NULL,0.0300,NULL,NULL),(16,10,500000.00,4,'APROVADO','2026-08-20 11:06:47','2026-08-20 11:38:10',NULL,NULL,NULL,NULL,0.0300,NULL,NULL),(17,12,100000.00,7,'PENDENTE','2026-08-20 12:33:34','2026-08-20 12:33:34',NULL,NULL,NULL,NULL,0.0300,NULL,NULL),(28,14,20000.00,6,'PENDENTE','2026-08-20 20:04:01','2026-08-20 20:04:01',NULL,NULL,NULL,NULL,0.0300,NULL,NULL),(30,14,20000.00,6,'PENDENTE','2026-08-20 20:06:00','2026-08-20 20:06:00',NULL,NULL,NULL,NULL,0.0300,NULL,NULL),(32,14,20000.00,6,'PENDENTE','2026-08-20 20:09:42','2026-08-20 20:09:42',NULL,NULL,NULL,NULL,0.0300,NULL,NULL),(34,14,20000.00,6,'PENDENTE','2026-08-20 20:11:13','2026-08-20 20:11:13',NULL,NULL,NULL,NULL,0.0300,NULL,NULL),(35,10,600000.00,6,'PENDENTE','2026-08-27 09:50:05','2026-08-27 09:50:05',NULL,NULL,NULL,NULL,0.0300,NULL,NULL),(37,14,20000.00,6,'PENDENTE','2026-08-28 21:28:44','2026-08-28 21:28:44',NULL,NULL,NULL,NULL,0.0300,NULL,NULL),(39,14,20000.00,6,'PENDENTE','2026-08-28 21:35:16','2026-08-28 21:35:16',NULL,NULL,NULL,NULL,0.0300,NULL,NULL),(41,14,20000.00,6,'PENDENTE','2026-08-31 08:14:12','2026-08-31 08:14:12',NULL,NULL,NULL,NULL,0.0300,NULL,NULL),(43,14,20000.00,6,'PENDENTE','2026-08-31 08:15:22','2026-08-31 08:15:22',NULL,NULL,NULL,NULL,0.0300,NULL,NULL),(45,14,20000.00,6,'PENDENTE','2026-08-31 08:15:58','2026-08-31 08:15:58',NULL,NULL,NULL,NULL,0.0300,NULL,NULL),(47,14,20000.00,6,'PENDENTE','2026-08-31 08:16:29','2026-08-31 08:16:29',NULL,NULL,NULL,NULL,0.0300,NULL,NULL),(49,14,20000.00,6,'PENDENTE','2026-08-31 08:17:00','2026-08-31 08:17:00',NULL,NULL,NULL,NULL,0.0300,NULL,NULL),(51,14,20000.00,6,'PENDENTE','2026-08-31 08:17:32','2026-08-31 08:17:32',NULL,NULL,NULL,NULL,0.0300,NULL,NULL),(53,14,20000.00,6,'PENDENTE','2026-08-31 08:18:05','2026-08-31 08:18:05',NULL,NULL,NULL,NULL,0.0300,NULL,NULL),(55,14,20000.00,6,'PENDENTE','2026-08-31 08:20:04','2026-08-31 08:20:04',NULL,NULL,NULL,NULL,0.0300,NULL,NULL),(57,14,20000.00,6,'PENDENTE','2026-08-31 09:09:52','2026-08-31 09:09:52',NULL,NULL,NULL,NULL,0.0300,NULL,NULL),(59,14,20000.00,6,'PENDENTE','2026-08-31 09:41:24','2026-08-31 09:41:24',NULL,NULL,NULL,NULL,0.0300,NULL,NULL),(61,14,20000.00,6,'PENDENTE','2026-08-31 09:59:49','2026-08-31 09:59:49',NULL,NULL,NULL,NULL,0.0300,NULL,NULL),(63,14,20000.00,6,'PENDENTE','2026-08-31 10:46:02','2026-08-31 10:46:02',NULL,NULL,NULL,NULL,0.0300,NULL,NULL),(65,14,20000.00,6,'PENDENTE','2026-08-31 11:07:30','2026-08-31 11:07:30',NULL,NULL,NULL,NULL,0.0300,NULL,NULL),(67,14,20000.00,6,'PENDENTE','2026-08-31 13:17:33','2026-08-31 13:17:33',NULL,NULL,NULL,NULL,0.0300,NULL,NULL),(69,14,20000.00,6,'PENDENTE','2026-08-31 13:18:08','2026-08-31 13:18:08',NULL,NULL,NULL,NULL,0.0300,NULL,NULL),(71,14,20000.00,6,'PENDENTE','2026-08-31 13:18:28','2026-08-31 13:18:28',NULL,NULL,NULL,NULL,0.0300,NULL,NULL),(73,14,20000.00,6,'PENDENTE','2026-08-31 13:18:52','2026-08-31 13:18:52',NULL,NULL,NULL,NULL,0.0300,NULL,NULL),(75,14,20000.00,6,'PENDENTE','2026-08-31 13:19:19','2026-08-31 13:19:19',NULL,NULL,NULL,NULL,0.0300,NULL,NULL),(76,1,5000.00,12,'PENDENTE','2026-08-31 14:14:44','2026-08-31 14:14:44',NULL,NULL,NULL,NULL,0.0300,NULL,NULL),(77,2,12000.50,24,'APROVADO','2026-08-31 14:14:44','2026-08-31 14:14:44',NULL,NULL,NULL,NULL,0.0300,NULL,NULL),(79,14,20000.00,6,'PENDENTE','2026-08-31 15:26:50','2026-08-31 15:26:50',NULL,NULL,NULL,NULL,0.0300,NULL,NULL),(81,14,20000.00,6,'APROVADO','2026-08-31 15:27:15','2026-08-31 15:52:47',NULL,NULL,NULL,NULL,0.0300,NULL,NULL);
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
-- Table structure for table `transparencia_documentos`
--

DROP TABLE IF EXISTS `transparencia_documentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transparencia_documentos` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `date` varchar(255) NOT NULL,
  `size` varchar(255) DEFAULT NULL,
  `categoria` varchar(255) DEFAULT 'Normativo',
  `file_url` varchar(255) NOT NULL,
  `ordem` int DEFAULT '0',
  `ativo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transparencia_documentos`
--

LOCK TABLES `transparencia_documentos` WRITE;
/*!40000 ALTER TABLE `transparencia_documentos` DISABLE KEYS */;
INSERT INTO `transparencia_documentos` VALUES (1,'Aviso N.º 10/2024 BNA - Regulamento de Microcrédito','Janeiro 2026','1.4 MB','Regulamento','/uploads/1788192272652_Prossional de Assistente de Contact Center Africell_094857.pdf',1,1,'2026-08-31 14:14:44','2026-08-31 16:04:32'),(2,'Preçário Oficial e Tabela de Taxas Máximas (Kz)','Fevereiro 2026','890 KB','Preçário','/uploads/precario_oficial_gloxis.pdf',2,1,'2026-08-31 14:14:44','2026-08-31 14:14:44'),(3,'Relatório Institucional de Transparência & Governação 2025','Dezembro 2025','3.2 MB','Relatório','/uploads/relatorio_transparencia_2025.pdf',3,1,'2026-08-31 14:14:44','2026-08-31 14:14:44'),(4,'Código de Conduta e Proteção ao Consumidor Financeiro','Outubro 2025','1.1 MB','Normativo','/uploads/codigo_conduta_consumidor.pdf',4,1,'2026-08-31 14:14:44','2026-08-31 14:14:44'),(5,'Guia de Prevenção do Branqueamento de Capitais (BCFT)','Novembro 2025','2.0 MB','Compliance','/uploads/guia_bcft_gloxis.pdf',5,1,'2026-08-31 14:14:44','2026-08-31 14:14:44');
/*!40000 ALTER TABLE `transparencia_documentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transparencia_metricas`
--

DROP TABLE IF EXISTS `transparencia_metricas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transparencia_metricas` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `chave` varchar(255) NOT NULL,
  `label` varchar(255) NOT NULL,
  `val` varchar(255) NOT NULL,
  `ordem` int DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `transparencia_metricas_chave_unique` (`chave`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transparencia_metricas`
--

LOCK TABLES `transparencia_metricas` WRITE;
/*!40000 ALTER TABLE `transparencia_metricas` DISABLE KEYS */;
INSERT INTO `transparencia_metricas` VALUES (1,'volume','Volume de Microcrédito Concedido','12.4 B Kz',1,'2026-08-31 14:14:44','2026-08-31 14:14:44'),(2,'beneficiados','Cidadãos & PMEs Beneficiados','45.890+',2,'2026-08-31 14:14:44','2026-08-31 14:14:44'),(3,'taxa_aprovacao','Taxa Média de Aprovação','94.2%',3,'2026-08-31 14:14:44','2026-08-31 14:14:44'),(4,'registo_bna','Registo Oficial BNA','N.º 0048-26',4,'2026-08-31 14:14:44','2026-08-31 14:14:44');
/*!40000 ALTER TABLE `transparencia_metricas` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Administrador Supremo','admin@gloxis.com','$scrypt$n=16384,r=8,p=1$n12o7z01Y+jMDedy/6Gjeg$jHCCS9aD3ko76A5fuzdBHw8HfUMH3KauCfgp/d2MBvo6C+ePCtCiKwYDPTA4ZfNrgIEheaL0jVz3tvAwiqXKDQ','2026-08-14 23:25:06','2026-08-31 14:14:45','ADMIN',NULL,0,NULL,NULL,0),(2,'Gestor de Crédito','gestor@gloxis.com','$scrypt$n=16384,r=8,p=1$tmX0ePSeHS6HSYdq6d3CMg$vBlUOMfqGITUYyvws9PWjAl4ECP7f9ESBAZme0oT6ti2bEHnaS9G3sKenwkV6wyp5VjY8SgfykxTJAY6p52aag','2026-08-14 23:25:06','2026-08-31 14:14:46','GESTOR',NULL,0,NULL,NULL,0),(3,'Diretor Financeiro','diretor@gloxis.com','$scrypt$n=16384,r=8,p=1$jeP7XUKxRz5d4/J13V4BGA$6Elv6CzQhT9zvHSfCyyMlAriI2hhTNwY7rTjedB1fE88lLsXJYX/5IHISnIA6pNjt92I3veHu7g834WUtDBMCQ','2026-08-14 23:25:06','2026-08-31 14:14:46','DIRETOR',NULL,0,NULL,NULL,0),(4,'João Cliente','cliente@exemplo.com','$scrypt$n=16384,r=8,p=1$7KXycpgoPdCCmVj/aIYOsQ$4Lmtp1aJ0rC7ijAk1LZ/yYVqzR/DhaBmz7Bcdq9QcPskQt5pSKlGI2fwXXnmHqyMd0wi00jhEpYZovSj5j8T0Q','2026-08-14 23:25:07','2026-08-31 14:14:45','CLIENTE',NULL,0,NULL,NULL,1),(5,'Test','test@gloxis.com','$scrypt$n=16384,r=8,p=1$1alx7I53Gi92ij2AKau8Rg$DbvjdmCK6suJCaAxrqk0LcTWHg0w2ZDvbqCEKNWnBNvCSlXPzLkGY8p3J+Ktt4POTgseBdWfxREZw66Z+GMzTg','2026-08-14 23:31:19','2026-08-31 14:14:45','CLIENTE',NULL,0,NULL,NULL,0),(6,'Noé Magalhães','noe.francisco@gmail.com','$scrypt$n=16384,r=8,p=1$uKNEWYdIAcTzjuAt8l/BeQ$bBuexNfCAE+SfdS24SH+mvQM9Fh7vbDnoYFNA7e4Yuo8KLv08LtMAKd3FQUXJBkfW7SzAfl9L8uB60yY8J37jA','2026-08-15 01:08:00','2026-08-31 14:14:45','CLIENTE',NULL,0,NULL,NULL,0),(7,'Ana Operadora','ana@gloxis.com','$scrypt$n=16384,r=8,p=1$UZEFxxUUHqNaVyd24ozIMg$MRT+SOWmnjDmpZRqLbKDXW/GZMBwHn8JK3NBjYFT+N5yu2wtBmntW3GjhU1PyxcACklFAKNiVHKH3kxTuz99Dg','2026-08-15 22:16:44','2026-08-15 22:16:44','ANALISTA_CREDITO',NULL,0,NULL,NULL,0),(8,'Maria Silva','maria.silva@exemplo.com','$scrypt$n=16384,r=8,p=1$ClLtu0iwEnQK1yiyC8lmUg$ivsJNggruPrtbSPOIVmDEjaiZDe+fRYFhB+3X9kege68TXqOzeknqg8MwxX0RbUOPGPi3f6n3pKqZup9AnUk+A','2026-08-19 19:12:36','2026-08-31 14:14:45','CLIENTE',NULL,0,NULL,NULL,0),(9,'João Santos','joao.santos@exemplo.com','$scrypt$n=16384,r=8,p=1$Pll2a6SeawJB5uVcrSpsdQ$ek86JuU0Ciex6OrYBghtd76mHzLUyDmOkDFibrV0y50TYx240LIWuoG3aS1Y3NQ9/DTjykNpN8vEBwD2RnL1BA','2026-08-19 19:12:36','2026-08-31 14:14:45','CLIENTE',NULL,0,NULL,NULL,0),(10,'Ana Ferreira','ana.ferreira@exemplo.com','$scrypt$n=16384,r=8,p=1$2KmRkl+GsAb+insmSa1GxA$6oMwkfh+J3uO9oD72QrJIJGGJeQfbVLFcr0rufotJWslJ6FinWRM37CMXxcGG/sdwS3kTU2elv1IEiXaD3lLuQ','2026-08-19 19:12:36','2026-08-31 14:14:45','CLIENTE',NULL,0,NULL,NULL,0),(11,'Admin Teste','admin_test@gloxis.com','$scrypt$n=16384,r=8,p=1$c3pnpyEfe1fdTwjhx4YPoA$SB1I3T7UeVNHsL89tAqSgv/mWiDqLfxIwHREdbUJK49cmmsB/L1YLtC7Muw4ru/foMCthTSwycpQmcpz6aPSLg','2026-08-20 18:48:17','2026-08-31 15:27:15','ADMIN',NULL,0,NULL,NULL,0),(12,'Admin','admin_reneg@gloxis.com','$scrypt$n=16384,r=8,p=1$rUNAXvMrLmLIP0tDZQ2rzg$174J3YoOYr+R3GKWwANbaEbV133lAQ1IFzxbiVNGw1r8vVQfrViDCp7W6/rMlMjl82VMqbr13AFHxzu1zAWU/w','2026-08-20 18:48:19','2026-08-20 18:48:19','ADMIN',NULL,0,NULL,NULL,0),(13,'Noeh Francisoc','noe.francis@gmail.com','$scrypt$n=16384,r=8,p=1$EYVDDkQABanoxddDHEGjIQ$+KFGehfuxXA+G/HxH+0ti8FLIQ1tla+2BB4M+cLv41uDSHb5m51iLs9atnek8pV5NqExtLHae/wLTL76Aol2AA','2026-08-31 15:33:38','2026-08-31 15:33:38','CLIENTE',NULL,0,NULL,NULL,0);
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

-- Dump completed on 2026-08-31 16:08:26
