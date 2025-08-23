-- ==========================================
-- Script d'initialisation PostgreSQL pour le PoC Chat
-- ==========================================

-- Création de l'utilisateur root si nécessaire
DO
$$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'root') THEN
      CREATE ROLE root LOGIN PASSWORD 'root';
   ELSE
      ALTER ROLE root PASSWORD 'root';
   END IF;
END
$$;

-- Création de la base chatdb si nécessaire
DO
$$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'chatdb') THEN
      CREATE DATABASE chatdb OWNER root;
   END IF;
END
$$;

-- Connecte-toi à la base chatdb
\c chatdb

-- Extension nécessaire pour générer des UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des utilisateurs (clients + support)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('CLIENT', 'SUPPORT'))
);

-- Table des tickets support
CREATE TABLE IF NOT EXISTS support_ticket (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN'
);

-- Table des conversations
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES support_ticket(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table des messages
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- Données initiales (utilisateurs + ticket + conversation + messages)
-- ==========================================

-- Deux utilisateurs fictifs avec mot de passe hashé (Valid123!)
INSERT INTO users (username, email, password, role) VALUES
('alice', 'alice@test.com', '$2b$12$/XpfPuZgtKXkM8v63MZXKOW9usXXpgGvtgZID6Rx3DBmHh0fBd1eK', 'CLIENT'),
('bob',   'bob@test.com',   '$2b$12$/XpfPuZgtKXkM8v63MZXKOW9usXXpgGvtgZID6Rx3DBmHh0fBd1eK', 'SUPPORT')
ON CONFLICT (username) DO NOTHING;

-- Ticket exemple
INSERT INTO support_ticket (subject, status) VALUES
('Problème de connexion', 'OPEN')
ON CONFLICT DO NOTHING;

-- Conversation liée au ticket
INSERT INTO conversations (ticket_id)
SELECT id FROM support_ticket WHERE subject = 'Problème de connexion'
ON CONFLICT DO NOTHING;

-- Quelques messages exemple
INSERT INTO messages (conversation_id, sender_id, content)
VALUES 
((SELECT id FROM conversations LIMIT 1), (SELECT id FROM users WHERE username='alice'), 'Bonjour, je n’arrive pas à me connecter.'),
((SELECT id FROM conversations LIMIT 1), (SELECT id FROM users WHERE username='bob'), 'Bonjour Alice, pouvez-vous vérifier votre mot de passe ?');
