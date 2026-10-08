import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbFile = path.join(__dirname, '../database/local_db.json');

// In-memory store
let db = {
  admins: [],
  categories: [],
  products: [],
  order_requests: [],
  wholesale_requests: [],
  contact_messages: [],
  faqs: [],
  testimonials: [],
  gallery_images: [],
  media_library: [],
  site_settings: [],
  cms_content: [],
  notification_settings: [],
  admin_notifications: [],
  notification_logs: [],
};

// Load existing data if file exists
function loadDb() {
  try {
    if (fs.existsSync(dbFile)) {
      const raw = fs.readFileSync(dbFile, 'utf8');
      db = { ...db, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.warn('Could not read local_db.json, starting with fresh in-memory state:', err.message);
  }
}

function saveDb() {
  try {
    const dir = path.dirname(dbFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(dbFile, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving local_db.json:', err.message);
  }
}

loadDb();

export function getTable(tableName) {
  if (!db[tableName]) {
    db[tableName] = [];
  }
  return db[tableName];
}

/**
 * Lightweight SQL query parser & executor for Local Development
 */
export function executeLocalSql(sql, params = []) {
  // Normalize whitespace so multiline template string SQL matches regex properly
  const cleanSql = sql.replace(/\s+/g, ' ').trim().replace(/;+$/, '');
  const upper = cleanSql.toUpperCase();

  // CREATE TABLE / CREATE EXTENSION
  if (upper.startsWith('CREATE')) {
    const match = cleanSql.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/i);
    if (match) {
      const tableName = match[1].toLowerCase();
      if (!db[tableName]) db[tableName] = [];
      saveDb();
    }
    return { rows: [], rowCount: 0 };
  }

  // INSERT INTO table (cols) VALUES (...)
  if (upper.startsWith('INSERT INTO')) {
    const tableMatch = cleanSql.match(/INSERT\s+INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i);
    if (!tableMatch) {
      // Handle without cols
      return { rows: [], rowCount: 0 };
    }
    const tableName = tableMatch[1].toLowerCase();
    const cols = tableMatch[2].split(',').map(c => c.trim().toLowerCase());
    const table = getTable(tableName);

    const record = {};
    cols.forEach((col, idx) => {
      let val = params[idx];
      record[col] = val !== undefined ? val : null;
    });

    table.push(record);
    saveDb();
    return { rows: [record], rowCount: 1 };
  }

  // SELECT ... FROM table ...
  if (upper.startsWith('SELECT')) {
    const fromMatch = cleanSql.match(/FROM\s+(\w+)/i);
    if (!fromMatch) return { rows: [], rowCount: 0 };
    const tableName = fromMatch[1].toLowerCase();
    let records = [...getTable(tableName)];

    // Simulate LEFT JOIN categories on products table
    if (tableName === 'products' && upper.includes('CATEGORIES')) {
      const categories = getTable('categories');
      const catMap = {};
      categories.forEach(c => { catMap[c.id] = c; });
      records = records.map(p => {
        const cat = p.category_id ? catMap[p.category_id] : null;
        return {
          ...p,
          category_name: cat ? cat.name : null,
          category_slug: cat ? cat.slug : null,
          'c.slug': cat ? cat.slug : null,
          'c.name': cat ? cat.name : null,
        };
      });
    }

    // Simulate product_count on categories table
    if (tableName === 'categories') {
      const prods = getTable('products');
      records = records.map(c => {
        const count = prods.filter(p => p.category_id === c.id && p.status === 'published').length;
        return {
          ...c,
          product_count: count
        };
      });
    }

    // Basic COUNT(*) support
    if (upper.includes('COUNT(*)')) {
      // Check WHERE condition
      if (upper.includes('WHERE')) {
        records = filterRecords(records, cleanSql, params);
      }
      return { rows: [{ count: records.length }], rowCount: 1 };
    }

    // WHERE clause
    if (upper.includes('WHERE')) {
      records = filterRecords(records, cleanSql, params);
    }

    // ORDER BY
    if (upper.includes('ORDER BY')) {
      records = sortRecords(records, cleanSql);
    }

    // LIMIT
    const limitMatch = cleanSql.match(/LIMIT\s+(\d+)/i);
    if (limitMatch) {
      const limit = parseInt(limitMatch[1], 10);
      records = records.slice(0, limit);
    }

    return { rows: records, rowCount: records.length };
  }

  // UPDATE table SET col1 = $1 WHERE ...
  if (upper.startsWith('UPDATE')) {
    const updateMatch = cleanSql.match(/UPDATE\s+(\w+)\s+SET\s+([\s\S]+?)(?:\s+WHERE\s+([\s\S]+))?$/i);
    if (!updateMatch) return { rows: [], rowCount: 0 };
    const tableName = updateMatch[1].toLowerCase();
    const setClause = updateMatch[2];
    const whereClause = updateMatch[3];
    const table = getTable(tableName);

    let updatedCount = 0;
    table.forEach(record => {
      if (!whereClause || testWhere(record, whereClause, params)) {
        // Parse set assignments
        applySet(record, setClause, params);
        updatedCount++;
      }
    });

    if (updatedCount > 0) saveDb();
    return { rows: [], rowCount: updatedCount };
  }

  // DELETE FROM table WHERE ...
  if (upper.startsWith('DELETE FROM')) {
    const delMatch = cleanSql.match(/DELETE\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+))?$/i);
    if (!delMatch) return { rows: [], rowCount: 0 };
    const tableName = delMatch[1].toLowerCase();
    const whereClause = delMatch[2];
    const table = getTable(tableName);

    const initialLen = table.length;
    db[tableName] = table.filter(record => {
      if (!whereClause) return false;
      return !testWhere(record, whereClause, params);
    });

    const removed = initialLen - db[tableName].length;
    if (removed > 0) saveDb();
    return { rows: [], rowCount: removed };
  }

  return { rows: [], rowCount: 0 };
}

function filterRecords(records, sql, params) {
  const whereMatch = sql.match(/WHERE\s+(.+?)(?:\s+ORDER\s+BY|\s+GROUP\s+BY|\s+LIMIT|$)/i);
  if (!whereMatch) return records;
  const condition = whereMatch[1];
  return records.filter(record => testWhere(record, condition, params));
}

function testSingleCondition(record, cond, params) {
  cond = cond.trim();
  if (cond === '1=1') return true;

  // Check equality: col = $x or col = 'val'
  const eqMatch = cond.match(/(?:p\.|c\.)?(\w+)\s*=\s*(?:'([^']*)'|\$(\d+)|(\d+))/i);
  if (eqMatch) {
    const col = eqMatch[1].toLowerCase();
    let targetVal = eqMatch[2] !== undefined ? eqMatch[2] : (eqMatch[3] !== undefined ? params[parseInt(eqMatch[3], 10) - 1] : Number(eqMatch[4]));

    if (col === 'is_active') {
      const recVal = record['is_active'];
      return recVal === 1 || recVal === '1' || recVal === true || recVal === null || recVal === undefined;
    }

    let recordVal = record[col];
    if (col === 'slug' && (cond.toLowerCase().includes('c.slug') || cond.toLowerCase().includes('category'))) {
      recordVal = record['category_slug'] || record['c.slug'];
    }

    if (recordVal === undefined || recordVal === null) return false;
    return String(recordVal).toLowerCase() === String(targetVal).toLowerCase();
  }

  // Check LIKE
  const likeMatch = cond.match(/(?:p\.|c\.)?(\w+)\s+LIKE\s+\$(\d+)/i);
  if (likeMatch) {
    const col = likeMatch[1].toLowerCase();
    const pIdx = parseInt(likeMatch[2], 10) - 1;
    const pattern = String(params[pIdx] || '').replace(/%/g, '').toLowerCase();
    const recordVal = String(record[col] || '').toLowerCase();
    return recordVal.includes(pattern);
  }

  return true;
}

function testWhere(record, condition, params) {
  const cleanCond = condition.trim();
  if (cleanCond === '1=1') return true;

  // Split on AND
  const parts = cleanCond.split(/\s+AND\s+/i);
  return parts.every(part => {
    part = part.trim();
    if (part === '1=1') return true;

    // Handle OR sub-conditions e.g. (c.slug = $1 OR p.category_id = $1)
    if (part.includes(' OR ') || part.includes(' or ')) {
      const cleanPart = part.replace(/^\s*\(\s*/, '').replace(/\s*\)\s*$/, '');
      const orParts = cleanPart.split(/\s+OR\s+/i);
      return orParts.some(orCond => testSingleCondition(record, orCond, params));
    }

    return testSingleCondition(record, part, params);
  });
}

function applySet(record, setClause, params) {
  // Split on comma: col = $1, col2 = $2
  const assignments = setClause.split(',');
  assignments.forEach(assign => {
    const match = assign.match(/(\w+)\s*=\s*(?:'([^']*)'|\$(\d+)|(\d+)|CURRENT_TIMESTAMP|NULL)/i);
    if (match) {
      const col = match[1].toLowerCase();
      if (match[0].toUpperCase().includes('CURRENT_TIMESTAMP')) {
        record[col] = new Date().toISOString();
      } else if (match[0].toUpperCase().includes('NULL')) {
        record[col] = null;
      } else if (match[2] !== undefined) {
        record[col] = match[2];
      } else if (match[3] !== undefined) {
        const paramIdx = parseInt(match[3], 10) - 1;
        record[col] = params[paramIdx] !== undefined ? params[paramIdx] : null;
      } else if (match[4] !== undefined) {
        record[col] = Number(match[4]);
      }
    }
  });
}

function sortRecords(records, sql) {
  const orderMatch = sql.match(/ORDER\s+BY\s+(.+?)(?:\s+LIMIT|$)/i);
  if (!orderMatch) return records;
  const orderClause = orderMatch[1].trim();

  return records.sort((a, b) => {
    // Basic sort support
    if (orderClause.includes('sort_order ASC')) {
      const diff = (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0);
      if (diff !== 0) return diff;
      if (orderClause.includes('name ASC')) return String(a.name || '').localeCompare(String(b.name || ''));
      return 0;
    }
    if (orderClause.includes('price ASC')) return (Number(a.price) || 0) - (Number(b.price) || 0);
    if (orderClause.includes('price DESC')) return (Number(b.price) || 0) - (Number(a.price) || 0);
    if (orderClause.includes('name ASC')) return String(a.name || '').localeCompare(String(b.name || ''));
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });
}
