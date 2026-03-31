-- ═══════════════════════════════════════
-- ilpro.ai Database Schema for Supabase
-- ═══════════════════════════════════════

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT '',
    phone TEXT DEFAULT '',
    plan TEXT DEFAULT 'free',
    business_name TEXT DEFAULT '',
    business_category TEXT DEFAULT '',
    business_phone TEXT DEFAULT '',
    business_address TEXT DEFAULT '',
    business_hours TEXT DEFAULT '',
    business_description TEXT DEFAULT '',
    business_menu TEXT DEFAULT '',
    has_sample_data BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Contacts
CREATE TABLE contacts (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    company TEXT DEFAULT '',
    position TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    phone2 TEXT DEFAULT '',
    email TEXT DEFAULT '',
    address TEXT DEFAULT '',
    birthday TEXT DEFAULT '',
    group_name TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    favorite BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Schedules (Calendar)
CREATE TABLE schedules (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    start_date DATE NOT NULL,
    start_time TEXT DEFAULT '',
    end_time TEXT DEFAULT '',
    color TEXT DEFAULT '#0071E3',
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Notes
CREATE TABLE notes (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT DEFAULT '',
    content TEXT NOT NULL,
    color TEXT DEFAULT '#FFFFFF',
    pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Todos
CREATE TABLE todos (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT false,
    due_date DATE,
    priority INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Files
CREATE TABLE files (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_size INT DEFAULT 0,
    file_type TEXT DEFAULT '',
    folder TEXT DEFAULT '',
    storage_path TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Ledger (매출장부)
CREATE TABLE ledger (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    entry_type TEXT NOT NULL CHECK (entry_type IN ('income', 'expense')),
    category TEXT DEFAULT '',
    description TEXT DEFAULT '',
    amount DECIMAL(12,0) NOT NULL,
    payment_method TEXT DEFAULT '',
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Reservations (예약)
CREATE TABLE reservations (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT DEFAULT '',
    party_size INT DEFAULT 1,
    reservation_date DATE NOT NULL,
    reservation_time TEXT NOT NULL,
    service TEXT DEFAULT '',
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'completed', 'cancelled', 'noshow')),
    notes TEXT DEFAULT '',
    source TEXT DEFAULT 'direct',
    reminder_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Quotes (견적서)
CREATE TABLE quotes (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    quote_number TEXT NOT NULL,
    doc_type TEXT DEFAULT 'quote' CHECK (doc_type IN ('quote', 'order', 'invoice')),
    title TEXT DEFAULT '',
    client_name TEXT DEFAULT '',
    contact_name TEXT DEFAULT '',
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'confirmed', 'cancelled')),
    subtotal DECIMAL(12,0) DEFAULT 0,
    vat DECIMAL(12,0) DEFAULT 0,
    grand_total DECIMAL(12,0) DEFAULT 0,
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Quote Items
CREATE TABLE quote_items (
    id BIGSERIAL PRIMARY KEY,
    quote_id BIGINT NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    spec TEXT DEFAULT '',
    qty DECIMAL(10,2) DEFAULT 1,
    unit TEXT DEFAULT 'EA',
    unit_price DECIMAL(12,0) DEFAULT 0,
    supply_amount DECIMAL(12,0) DEFAULT 0,
    vat DECIMAL(12,0) DEFAULT 0,
    total DECIMAL(12,0) DEFAULT 0,
    sort_order INT DEFAULT 0
);

-- Employees (급여)
CREATE TABLE employees (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    position TEXT DEFAULT '',
    emp_type TEXT DEFAULT 'fulltime',
    base_salary DECIMAL(12,0) DEFAULT 0,
    hourly_rate DECIMAL(10,0) DEFAULT 0,
    start_date DATE,
    phone TEXT DEFAULT '',
    bank_info TEXT DEFAULT '',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Payroll
CREATE TABLE payroll (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    pay_month TEXT NOT NULL,
    work_hours DECIMAL(6,1) DEFAULT 0,
    base_pay DECIMAL(12,0) DEFAULT 0,
    overtime_pay DECIMAL(12,0) DEFAULT 0,
    bonus DECIMAL(12,0) DEFAULT 0,
    total_pay DECIMAL(12,0) DEFAULT 0,
    national_pension DECIMAL(12,0) DEFAULT 0,
    health_insurance DECIMAL(12,0) DEFAULT 0,
    employment_insurance DECIMAL(12,0) DEFAULT 0,
    income_tax DECIMAL(12,0) DEFAULT 0,
    total_deduction DECIMAL(12,0) DEFAULT 0,
    net_pay DECIMAL(12,0) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ Row Level Security (RLS) ═══
-- Users can only see their own data

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Generic policy for all user_id tables
DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT unnest(ARRAY['contacts','schedules','notes','todos','files','ledger','reservations','quotes','employees','payroll'])
    LOOP
        EXECUTE format('CREATE POLICY "Users can view own %I" ON %I FOR SELECT USING (auth.uid() = user_id)', tbl, tbl);
        EXECUTE format('CREATE POLICY "Users can insert own %I" ON %I FOR INSERT WITH CHECK (auth.uid() = user_id)', tbl, tbl);
        EXECUTE format('CREATE POLICY "Users can update own %I" ON %I FOR UPDATE USING (auth.uid() = user_id)', tbl, tbl);
        EXECUTE format('CREATE POLICY "Users can delete own %I" ON %I FOR DELETE USING (auth.uid() = user_id)', tbl, tbl);
    END LOOP;
END $$;

-- Quote items: accessible if user owns the quote
CREATE POLICY "Users can view own quote_items" ON quote_items FOR SELECT
    USING (EXISTS (SELECT 1 FROM quotes WHERE quotes.id = quote_items.quote_id AND quotes.user_id = auth.uid()));
CREATE POLICY "Users can insert own quote_items" ON quote_items FOR INSERT
    WITH CHECK (EXISTS (SELECT 1 FROM quotes WHERE quotes.id = quote_items.quote_id AND quotes.user_id = auth.uid()));
CREATE POLICY "Users can update own quote_items" ON quote_items FOR UPDATE
    USING (EXISTS (SELECT 1 FROM quotes WHERE quotes.id = quote_items.quote_id AND quotes.user_id = auth.uid()));
CREATE POLICY "Users can delete own quote_items" ON quote_items FOR DELETE
    USING (EXISTS (SELECT 1 FROM quotes WHERE quotes.id = quote_items.quote_id AND quotes.user_id = auth.uid()));

-- ═══ Auto-create profile on signup ═══
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
