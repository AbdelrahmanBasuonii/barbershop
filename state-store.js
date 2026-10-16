const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

class StateStore {
  constructor({ databaseUrl, localFile }) {
    this.localFile = localFile;
    this.pool = databaseUrl
      ? new Pool({ connectionString: databaseUrl, max: 1, ssl: { rejectUnauthorized: true } })
      : null;
    this.writeQueue = Promise.resolve();
  }

  async initialize(initialState) {
    if (!this.pool) {
      if (fs.existsSync(this.localFile)) return JSON.parse(fs.readFileSync(this.localFile, 'utf8'));
      await this.save(initialState);
      return initialState;
    }

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS app_state (
        id SMALLINT PRIMARY KEY CHECK (id = 1),
        data JSONB NOT NULL
      )
    `);
    const result = await this.pool.query('SELECT data FROM app_state WHERE id = 1');
    if (result.rows.length) return result.rows[0].data;

    let state = initialState;
    if (fs.existsSync(this.localFile)) state = JSON.parse(fs.readFileSync(this.localFile, 'utf8'));
    await this.save(state);
    return state;
  }

  save(state) {
    const snapshot = JSON.stringify(state);
    if (!this.pool) {
      fs.mkdirSync(path.dirname(this.localFile), { recursive: true });
      fs.writeFileSync(this.localFile, JSON.stringify(state, null, 1));
      return Promise.resolve();
    }

    this.writeQueue = this.writeQueue
      .catch(() => {})
      .then(() => this.pool.query(
        `INSERT INTO app_state (id, data) VALUES (1, $1::jsonb)
         ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data`,
        [snapshot]
      ));
    return this.writeQueue;
  }

  async close() {
    if (this.pool) await this.pool.end();
  }
}

module.exports = { StateStore };
