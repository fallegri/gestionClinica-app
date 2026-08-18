/**
 * Seed script: Insert test users for all roles
 * 
 * Creates: 1 Admin, 2 Medicos, 1 Secretaria, 1 Paciente
 * Uses bcryptjs for password hashing and pg with SSL for DB connection.
 */

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const DATABASE_URL = 'postgresql://neondb_owner:npg_qBCDgm7YcS1R@ep-quiet-wave-axzdc4wj-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const SALT_ROUNDS = 10;

async function seed() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    console.log('Connected successfully.\n');

    // Hash passwords
    console.log('Hashing passwords...');
    const adminHash = await bcrypt.hash('Admin1234', SALT_ROUNDS);
    const medicoHash = await bcrypt.hash('Medico1234', SALT_ROUNDS);
    const secretariaHash = await bcrypt.hash('Secretaria1234', SALT_ROUNDS);
    const pacienteHash = await bcrypt.hash('Paciente1234', SALT_ROUNDS);
    console.log('Passwords hashed.\n');

    // Look up especialidad IDs
    console.log('Looking up especialidades...');
    const medGeneralResult = await client.query(
      "SELECT id FROM especialidades WHERE nombre = 'Medicina General' LIMIT 1"
    );
    const cardiologiaResult = await client.query(
      "SELECT id FROM especialidades WHERE nombre = 'Cardiologia' LIMIT 1"
    );

    if (medGeneralResult.rows.length === 0) {
      throw new Error("Especialidad 'Medicina General' not found in database");
    }
    if (cardiologiaResult.rows.length === 0) {
      throw new Error("Especialidad 'Cardiologia' not found in database");
    }

    const medGeneralId = medGeneralResult.rows[0].id;
    const cardiologiaId = cardiologiaResult.rows[0].id;
    console.log(`  Medicina General ID: ${medGeneralId}`);
    console.log(`  Cardiologia ID: ${cardiologiaId}\n`);

    // 1. Insert Administrador
    console.log('Inserting Administrador...');
    const adminResult = await client.query(
      `INSERT INTO administradores (nombre, apellido, email, telefono, username, password_hash, activo)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (email) DO UPDATE SET
         nombre = EXCLUDED.nombre,
         apellido = EXCLUDED.apellido,
         telefono = EXCLUDED.telefono,
         username = EXCLUDED.username,
         password_hash = EXCLUDED.password_hash,
         activo = EXCLUDED.activo
       RETURNING id, nombre, apellido, email, username`,
      ['Admin', 'Sistema', 'admin@clinica.com', '555-0001', 'admin', adminHash, true]
    );
    console.log(`  Created: ${adminResult.rows[0].nombre} ${adminResult.rows[0].apellido} (${adminResult.rows[0].email})`);

    // 2. Insert Medico - Medicina General
    console.log('Inserting Medico (Medicina General)...');
    const medico1Result = await client.query(
      `INSERT INTO medicos (nombre, apellido, segundo_apellido, email, telefono, username, password_hash, especialidad_id, estado, activo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (email) DO UPDATE SET
         nombre = EXCLUDED.nombre,
         apellido = EXCLUDED.apellido,
         segundo_apellido = EXCLUDED.segundo_apellido,
         telefono = EXCLUDED.telefono,
         username = EXCLUDED.username,
         password_hash = EXCLUDED.password_hash,
         especialidad_id = EXCLUDED.especialidad_id,
         estado = EXCLUDED.estado,
         activo = EXCLUDED.activo
       RETURNING id, nombre, apellido, email, username`,
      ['Juan', 'Pérez', 'López', 'jperez@clinica.com', '555-0002', 'jperez', medicoHash, medGeneralId, 'ACTIVO', true]
    );
    console.log(`  Created: ${medico1Result.rows[0].nombre} ${medico1Result.rows[0].apellido} (${medico1Result.rows[0].email})`);

    // 3. Insert Medico - Cardiologia
    console.log('Inserting Medico (Cardiologia)...');
    const medico2Result = await client.query(
      `INSERT INTO medicos (nombre, apellido, segundo_apellido, email, telefono, username, password_hash, especialidad_id, estado, activo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (email) DO UPDATE SET
         nombre = EXCLUDED.nombre,
         apellido = EXCLUDED.apellido,
         segundo_apellido = EXCLUDED.segundo_apellido,
         telefono = EXCLUDED.telefono,
         username = EXCLUDED.username,
         password_hash = EXCLUDED.password_hash,
         especialidad_id = EXCLUDED.especialidad_id,
         estado = EXCLUDED.estado,
         activo = EXCLUDED.activo
       RETURNING id, nombre, apellido, email, username`,
      ['María', 'García', 'Ruiz', 'mgarcia@clinica.com', '555-0003', 'mgarcia', medicoHash, cardiologiaId, 'ACTIVO', true]
    );
    console.log(`  Created: ${medico2Result.rows[0].nombre} ${medico2Result.rows[0].apellido} (${medico2Result.rows[0].email})`);

    // 4. Insert Secretaria
    console.log('Inserting Secretaria...');
    const secretariaResult = await client.query(
      `INSERT INTO secretarias (nombre, apellido, email, telefono, username, password_hash, activo)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (email) DO UPDATE SET
         nombre = EXCLUDED.nombre,
         apellido = EXCLUDED.apellido,
         telefono = EXCLUDED.telefono,
         username = EXCLUDED.username,
         password_hash = EXCLUDED.password_hash,
         activo = EXCLUDED.activo
       RETURNING id, nombre, apellido, email, username`,
      ['María', 'López', 'mlopez@clinica.com', '555-0004', 'mlopez', secretariaHash, true]
    );
    console.log(`  Created: ${secretariaResult.rows[0].nombre} ${secretariaResult.rows[0].apellido} (${secretariaResult.rows[0].email})`);

    // 5. Insert Paciente
    console.log('Inserting Paciente...');
    const pacienteResult = await client.query(
      `INSERT INTO pacientes (nombre, apellido, segundo_apellido, email, password_hash, telefono, fecha_nacimiento, email_verificado, activo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (email) DO UPDATE SET
         nombre = EXCLUDED.nombre,
         apellido = EXCLUDED.apellido,
         segundo_apellido = EXCLUDED.segundo_apellido,
         password_hash = EXCLUDED.password_hash,
         telefono = EXCLUDED.telefono,
         fecha_nacimiento = EXCLUDED.fecha_nacimiento,
         email_verificado = EXCLUDED.email_verificado,
         activo = EXCLUDED.activo
       RETURNING id, nombre, apellido, email`,
      ['Carlos', 'Martínez', 'Soto', 'paciente@test.com', pacienteHash, '555-0005', '1990-05-15', true, true]
    );
    console.log(`  Created: ${pacienteResult.rows[0].nombre} ${pacienteResult.rows[0].apellido} (${pacienteResult.rows[0].email})`);

    console.log('\n========================================');
    console.log('Seed completed successfully!');
    console.log('========================================');
    console.log('\nTest users created:');
    console.log('  1. Admin:      admin@clinica.com / Admin1234');
    console.log('  2. Medico:     jperez@clinica.com / Medico1234 (Medicina General)');
    console.log('  3. Medico:     mgarcia@clinica.com / Medico1234 (Cardiologia)');
    console.log('  4. Secretaria: mlopez@clinica.com / Secretaria1234');
    console.log('  5. Paciente:   paciente@test.com / Paciente1234');

    client.release();
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
