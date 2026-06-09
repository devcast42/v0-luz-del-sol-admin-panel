import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hglfegkhpcmtaumjtyxk.supabase.co';
const SUPABASE_KEY = 'sb_publishable_dmaTYMIfDgux6bByqoS-iw_FOOG7SUq';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const users = [
  { email: 'contador@luzdelsol.com', password: 'contador123', rol: 'CONTADOR', nombre: 'Contador' },
  { email: 'admin@luzdelsol.com', password: 'admin123', rol: 'ADMIN', nombre: 'Administrador' },
  { email: 'superadmin@luzdelsol.com', password: 'super123', rol: 'SUPER_ADMIN', nombre: 'Super Administrador' },
  { email: 'asesor@luzdelsol.com', password: 'asesor123', rol: 'ASESOR', nombre: 'Asesor' }
];

async function createUsers() {
  for (const u of users) {
    console.log(`Creating user ${u.email}...`);
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: u.email,
      password: u.password,
    });

    if (authError) {
      console.error(`Error creating auth user ${u.email}:`, authError.message);
      // Let's also try to just sign in to see if they exist, to get the ID
      if (authError.message.includes('already registered')) {
        console.log(`User ${u.email} already registered. Trying to log in to get ID...`);
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: u.email,
          password: u.password
        });
        if (loginData?.user?.id) {
          await insertIntoUsuarios(loginData.user.id, u);
        } else {
          console.error(`Could not log in to get ID for ${u.email}:`, loginError?.message);
        }
      }
      continue;
    }

    const userId = authData.user?.id;
    if (userId) {
      console.log(`User ${u.email} created in auth.users with ID ${userId}.`);
      await insertIntoUsuarios(userId, u);
    }
  }
  console.log('Done.');
}

async function insertIntoUsuarios(userId, u) {
  console.log(`Inserting ${u.email} into public.usuarios...`);
  const { error: dbError } = await supabase
    .from('usuarios')
    .upsert([
      {
        id: userId,
        rol: u.rol,
        nombre: u.nombre,
        email: u.email
      }
    ], { onConflict: 'id' });
  
  if (dbError) {
    console.error(`Error inserting ${u.email} into public.usuarios:`, dbError.message);
  } else {
    console.log(`User ${u.email} successfully inserted/updated in public.usuarios.`);
  }
}

createUsers();
