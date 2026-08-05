alter table "Order" enable row level security;
alter table "OrderItem" enable row level security;
alter table "OrderItemOption" enable row level security;
alter table "Reservation" enable row level security;

-- ORDER : visible par le client qui l'a passée OU le propriétaire du business concerné
create policy "order_select_client_or_owner" on "Order"
  for select using(
    auth.uid() = user_id or 
    exists(
      select 1 from "Business"
      where "Business".id = "Order".business_id 
            and "Business".owner_id = auth.uid()
    )
  );

-- ORDER : seul le client connecté peut créer une commande en son nom
create policy "order_insert_client" on "Order"
  for insert with check (auth.uid() = user_id);

-- ORDER : le client peut modifier et le restaurateur peut modifier (ex: statut)
create policy "order_update_client" on "Order"
  for update using(
    auth.uid() = user_id and status = 'pending'
  )
  with check (
    auth.uid() = user_id and status = 'cancelled'
  );

-- Fonction : seul le owner du business peut changer le statut d'une commande
create or replace function update_order_status(order_id uuid, new_status text)
returns void
language plpgsql
security definer
as $$
begin
  if not exists (
    select 1 from "Order"
    join "Business" on "Business".id = "Order".business_id
    where "Order".id = order_id
    and "Business".owner_id = auth.uid()
  ) then
    raise exception 'Non autorisé';
  end if;

  update "Order" set status = new_status where id = order_id;
end;
$$;


-- ORDER ITEM : mêmes ayants droit, via Order
create policy "orderitem_select_client_or_owner" on "OrderItem"
  for select using (
    exists (
      select 1 from "Order"
      where "Order".id = "OrderItem".order_id
      and (
        "Order".user_id = auth.uid()
        or exists (
          select 1 from "Business"
          where "Business".id = "Order".business_id
          and "Business".owner_id = auth.uid()
        )
      )
    )
  );

create policy "orderitem_insert_client" on "OrderItem"
  for insert with check (
    exists (
      select 1 from "Order"
      where "Order".id = "OrderItem".order_id
      and "Order".user_id = auth.uid()
    )
  );

-- ORDER ITEM OPTION : mêmes ayants droit, via OrderItem → Order
create policy "orderitemoption_select_client_or_owner" on "OrderItemOption"
  for select using (
    exists (
      select 1 from "OrderItem"
      join "Order" on "Order".id = "OrderItem".order_id
      where "OrderItem".id = "OrderItemOption".order_item_id
      and (
        "Order".user_id = auth.uid()
        or exists (
          select 1 from "Business"
          where "Business".id = "Order".business_id
          and "Business".owner_id = auth.uid()
        )
      )
    )
  );

create policy "orderitemoption_insert_client" on "OrderItemOption"
  for insert with check (
    exists (
      select 1 from "OrderItem"
      join "Order" on "Order".id = "OrderItem".order_id
      where "OrderItem".id = "OrderItemOption".order_item_id
      and "Order".user_id = auth.uid()
    )
  );

-- RESERVATION : même logique que Order
create policy "reservation_select_client_or_owner" on "Reservation"
  for select using (
    auth.uid() = user_id
    or exists (
      select 1 from "Business"
      where "Business".id = "Reservation".business_id
      and "Business".owner_id = auth.uid()
    )
  );

create policy "reservation_insert_client" on "Reservation"
  for insert with check (auth.uid() = user_id);

create policy "reservation_update_client_or_owner" on "Reservation"
  for update using (
    auth.uid() = user_id
    or exists (
      select 1 from "Business"
      where "Business".id = "Reservation".business_id
      and "Business".owner_id = auth.uid()
    )
  );

