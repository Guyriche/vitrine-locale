alter table "Category" enable row level security;
alter table "Product" enable row level security;
alter table "ProductOption" enable row level security;
alter table "ProductOptionValue" enable row level security;

-- CATEGORY : lecture publique, écriture réservée au propriétaire du business
create policy "category_select_all" on "Category"
  for select using(true);

create policy "category_write_owner" on "Category"
  for all using(
    exists(
      select 1 from "Business"
      where "Business".id = "Category".business_id
            and "Business".owner_id = auth.uid()
    )
  );

-- PRODUCT : lecture publique, écriture réservée au propriétaire (via Category → Business)
create policy "Product_select_all" on "Product"
  for select using(true);

create policy "Product_write_owner" on "Product"
  for all using(
    exists(
      select 1 from "Category"
      join "Business" on "Business".id = "Category".business_id
      where "Category".id = "Product".category_id 
            and "Business".owner_id = auth.uid()
    )
  );

-- PRODUCT OPTION : même logique, via Product → Category → Business
create policy "productOption_select_all" on "ProductOption"
  for select using(true);

create policy "productOption_swrite_owner" on "ProductOption"
  for all using(
    exists(
      select 1 from "Product"
        join "Category" on "Category".id = "Product".category_id
        join "Business" on "Business".id = "Category".business_id
      where "Product".id = "ProductOption".product_id 
            and "Business".owner_id = auth.uid()
    )
  );

-- PRODUCT OPTION : même logique, via Product → Category → Business
create policy "productionOptionValue_select_all" on "ProductOptionValue"
  for select using(true);

create policy "productionOptionValue_write_owne" on "ProductOptionValue"
  for all using (
    exists(
      select 1 from "ProductOption"
      join "Product" on "Product".id = "ProductOption".product_id
      join "Category" on "Category".id = "Product".category_id
      join "Business" on "Business".id = "Category".business_id
      where "ProductOption".id = "ProductOptionValue".product_option_id
            and "Business".owner_id = auth.uid()
    )
  );