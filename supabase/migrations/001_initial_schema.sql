-- =========================================
-- USER (profil métier, lié à l'auth Supabase)
-- =========================================
create table "User" (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  role text not null default 'client' check (role in ('client', 'owner', 'admin')),
  created_at timestamptz not null default now()
);

-- =========================================
-- BUSINESS
-- =========================================
create table "Business" (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references "User"(id),
  name text not null,
  description text,
  phone text,
  street text,
  house_number text,
  postal_code text,
  city text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- =========================================
-- CATEGORY
-- =========================================
create table "Category" (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references "Business"(id) on delete cascade,
  name text not null,
  display_order integer not null default 0
);

-- =========================================
-- PRODUCT
-- =========================================
create table "Product" (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references "Category"(id) on delete cascade,
  name text not null,
  description text,
  price numeric(10,2) not null check (price > 0),
  is_available boolean not null default true
);

-- =========================================
-- PRODUCT OPTION (ex: "Ingrédients", "Sauce")
-- =========================================
create table "ProductOption" (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references "Product"(id) on delete cascade,
  name text not null,
  type text not null check (type in ('exclude', 'choice')),
  is_required boolean not null default false,
  display_order integer not null default 0
);

-- =========================================
-- PRODUCT OPTION VALUE (ex: "Coriandre", "Sauce piquante")
-- =========================================
create table "ProductOptionValue" (
  id uuid primary key default gen_random_uuid(),
  product_option_id uuid not null references "ProductOption"(id) on delete cascade,
  label text not null,
  price_modifier numeric(10,2) not null default 0,
  display_order integer not null default 0
);

-- =========================================
-- ORDER
-- =========================================
create table "Order" (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references "Business"(id),
  user_id uuid not null references "User"(id),
  status text not null default 'pending'
    check (status in ('pending','accepted','preparing','ready','on_delivery','completed','cancelled')),
  order_type text not null check (order_type in ('delivery','pickup')),
  delivery_street text,
  delivery_house_number text,
  delivery_postal_code text,
  delivery_city text,
  delivery_notes text,
  total numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);

-- =========================================
-- ORDER ITEM
-- =========================================
create table "OrderItem" (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references "Order"(id) on delete cascade,
  product_id uuid not null references "Product"(id),
  quantity integer not null check (quantity > 0),
  unit_price numeric(10,2) not null,
  notes text
);

-- =========================================
-- ORDER ITEM OPTION (ce que le client a choisi/exclu)
-- =========================================
create table "OrderItemOption" (
  id uuid primary key default gen_random_uuid(),
  order_item_id uuid not null references "OrderItem"(id) on delete cascade,
  product_option_value_id uuid not null references "ProductOptionValue"(id)
);

-- =========================================
-- RESERVATION
-- =========================================
create table "Reservation" (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references "Business"(id),
  user_id uuid not null references "User"(id),
  date_time timestamptz not null,
  party_size integer not null check (party_size > 0),
  status text not null default 'pending' check (status in ('pending','confirmed','refused')),
  notes text,
  created_at timestamptz not null default now()
);