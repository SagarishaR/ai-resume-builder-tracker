import SQLite from 'react-native-sqlite-storage';

SQLite.DEBUG(true);
SQLite.enablePromise(true);

let db = null;

// ✅ Initialize SQLite Database
export const initDatabase = async () => {
  try {
    db = await SQLite.openDatabase({
      name: 'user_db.db',
      location: 'default',
    });
    console.log('✅ SQLite Database opened successfully');
    await createUserTable();
    return db;
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    return null;
  }
};

// ✅ Create users table
export const createUserTable = async () => {
  if (!db) db = await initDatabase();
  try {
    await db.transaction(async (tx) => {
      await tx.executeSql(
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE,
          email TEXT UNIQUE,
          password TEXT
        );`
      );
      console.log('✅ User table created successfully');
    });
  } catch (error) {
    console.error('❌ Error creating user table:', error);
  }
};

// ✅ Register user in SQLite only
export const registerUser = async (username, email, password) => {
  if (!db) db = await initDatabase();

  try {
    // Check for existing username/email
    const exists = await new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM users WHERE username = ? OR email = ?;',
          [username, email],
          (_, result) => resolve(result.rows.length > 0),
          (_, error) => reject(error)
        );
      });
    });

    if (exists) {
      return { success: false, message: 'Username or Email already exists' };
    }

    // Insert user
    await db.transaction(async (tx) => {
      await tx.executeSql(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?);',
        [username, email, password]
      );
    });

    return { success: true, message: 'User registered successfully', username };
  } catch (error) {
    console.error('❌ Error registering user:', error);
    return { success: false, message: 'Registration failed. Try again!' };
  }
};

// ✅ Authenticate user
export const authenticateUser = async (email, password) => {
  if (!db) db = await initDatabase();

  try {
    const user = await new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM users WHERE email = ?;',
          [email],
          (_, result) => {
            if (result.rows.length > 0) resolve(result.rows.item(0));
            else resolve(null);
          },
          (_, error) => reject(error)
        );
      });
    });

    if (!user) {
      return { success: false, message: 'Email not found' };
    }

    if (user.password === password) {
      return { success: true, user };
    } else {
      return { success: false, message: 'Incorrect password' };
    }
  } catch (error) {
    console.error('❌ Error during login:', error);
    return { success: false, message: 'Login failed. Try again!' };
  }
};

// Initialize on load
initDatabase();
