-- Fonction déclenchée à chaque nouvelle inscription

create or replace function public.handle_new_user()
  returns trigger
  language plpgsql
  security definer
  as $$
  begin
    insert into public."User"(id, name, role)
    values(
      new.id,
      coalesce(new.raw_user_meta_data->>'name', 'New User'),
      'client'
    );
    return new;
  end;
  $$;


-- drop trigger if exists on_auth_user_created on auth.users;
  
-- Trigger : appelle la fonction juste après chaque insertion dans auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();