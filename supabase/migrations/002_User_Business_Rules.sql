
-- Active RLS (déjà fait normalement, mais on s'assure)
alter table "User" enable row level security;
alter table "Business" enable row level security;

-- USER : chacun peut voir et modifier uniquement son propre profil
create  policy  "user_select_own" on "User"
  for select using(auth.uid() = id);

create policy "user_update_own" on "User"
  for update using(auth.uid() = id);

-- BUSINESS : tout le monde peut voir les business actifs
create policy "business_select_active" on "Business"
  for select using(is_active = true);

-- BUSINESS : seul le propriétaire peut créer/modifier son business
create policy "business_insert_owner" on "Business"
  for insert with check (auth.uid() = owner_id);;
  

create policy "business_update_owner" on "Business"
  for update using(auth.uid() = owner_id);