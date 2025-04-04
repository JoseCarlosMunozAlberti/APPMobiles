
-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id UUID REFERENCES auth.users PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de cuentas
CREATE TABLE IF NOT EXISTS accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('cash', 'bank', 'credit', 'savings', 'investment')) NOT NULL,
    balance DECIMAL(12,2) DEFAULT 0,
    currency TEXT DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de categorías
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
    icon TEXT,
    color TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de transacciones
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    type TEXT CHECK (type IN ('income', 'expense', 'transfer')) NOT NULL,
    amount DECIMAL(12,2) CHECK (amount > 0) NOT NULL,
    description TEXT,
    date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_frequency TEXT CHECK (recurring_frequency IN ('daily', 'weekly', 'monthly', 'yearly') OR recurring_frequency IS NULL),
    status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear categorías por defecto
INSERT INTO categories (id, user_id, name, type, icon, color, is_default) VALUES
    (gen_random_uuid(), NULL, 'Salario', 'income', '💰', '#4CAF50', true),
    (gen_random_uuid(), NULL, 'Inversiones', 'income', '📈', '#2196F3', true),
    (gen_random_uuid(), NULL, 'Regalos', 'income', '🎁', '#9C27B0', true),
    (gen_random_uuid(), NULL, 'Otros Ingresos', 'income', '💵', '#607D8B', true),
    (gen_random_uuid(), NULL, 'Alimentación', 'expense', '🍽️', '#F44336', true),
    (gen_random_uuid(), NULL, 'Transporte', 'expense', '🚗', '#FF9800', true),
    (gen_random_uuid(), NULL, 'Vivienda', 'expense', '🏠', '#795548', true),
    (gen_random_uuid(), NULL, 'Servicios', 'expense', '📱', '#3F51B5', true),
    (gen_random_uuid(), NULL, 'Entretenimiento', 'expense', '🎮', '#E91E63', true),
    (gen_random_uuid(), NULL, 'Salud', 'expense', '🏥', '#009688', true),
    (gen_random_uuid(), NULL, 'Educación', 'expense', '📚', '#FF5722', true),
    (gen_random_uuid(), NULL, 'Otros Gastos', 'expense', '🛍️', '#9E9E9E', true);

-- Crear políticas de seguridad RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios
CREATE POLICY users_policy ON users
    FOR ALL USING (auth.uid() = id);

-- Políticas para cuentas
CREATE POLICY accounts_policy ON accounts
    FOR ALL USING (auth.uid() = user_id);

-- Políticas para categorías
CREATE POLICY categories_policy ON categories
    FOR ALL USING (
        is_default = true OR 
        auth.uid() = user_id
    );

-- Políticas para transacciones
CREATE POLICY transactions_policy ON transactions
    FOR ALL USING (auth.uid() = user_id);

